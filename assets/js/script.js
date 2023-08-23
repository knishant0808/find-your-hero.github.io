// Constants related to API keys and hashing
const PUBLIC_KEY = "a9b98783ba0ed2096792b8b16aaafbe3";
const PRIVATE_KEY = "2b6433a8cfc22599629305be3f970e284e1794e5";
const hash = "a3b7640c225b2ffbeb55b329e8509682";
const timeStamp = "1692715909981";

// This class provides services for fetching superhero data from MARVEL's API.
class SuperheroService {
    constructor(publicKey, privateKey, hash, timeStamp) {
        this.baseURL = "https://gateway.marvel.com:443/v1/public/characters";
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.hash = hash;
        this.timeStamp = timeStamp;
    }

    // Fetches superheroes that start with the provided query name
    fetchSuperheroesByName(query) {
        console.log("fetchinfg query data ...");
        const url = `${this.baseURL}?ts=${this.timeStamp}&apikey=${this.publicKey}&hash=${this.hash}&nameStartsWith=${query}`;
        return fetch(url).then(response => response.json());
    }

    // Fetches a subset of superheroes, useful for getting random superheroes
    fetchRandomSuperheroes(offset, limit) {
        console.log("fetching random data ...");
        const url = `${this.baseURL}?ts=${this.timeStamp}&apikey=${this.publicKey}&hash=${this.hash}&offset=${offset}&limit=${limit}`;
        return fetch(url).then(response => response.json());
    }
}

// This class manages the suggestion dropdown that appears as user types in the search box.
class SuggestionBox {
    constructor(searchInput, suggestionsBox, superheroService) {
        this.searchInput = searchInput;
        this.suggestionsBox = suggestionsBox;
        this.superheroService = superheroService;

        this.init();
    }

    // Set up event listeners for this class
    init() {
        this.searchInput.addEventListener("input", this.handleInput.bind(this));
        
        // Hide the suggestion box when clicking outside of it
        document.addEventListener("click", (e) => {
            if (e.target !== this.searchInput && e.target !== this.suggestionsBox) {
                this.suggestionsBox.innerHTML = "";
            }
        });
    }

    // Handle the input event, fetch matching superheroes and display them
    handleInput() {
        clearTimeout(this.debounceTimer); // Clear any existing timer

        const query = this.searchInput.value;
        if (query.length < 2) {
            this.suggestionsBox.innerHTML = "";
            return;
        }
        
        // Set a delay of 300ms before triggering the API call
        this.debounceTimer = setTimeout(() => {
            this.superheroService.fetchSuperheroesByName(query).then(data => {
                this.displaySuggestions(data.data.results);
            });
        }, 300);
    }

    // Render the fetched superheroes as suggestions
    displaySuggestions(heroes) {
        this.suggestionsBox.innerHTML = "";
        heroes.slice(0, 5).forEach(hero => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "list-group-item list-group-item-action suggestion-item";
    
            // The hero link
            const heroLink = document.createElement("a");
            heroLink.href = `hero-detail.html?id=${hero.id}`;
            heroLink.className = "hero-link"; // This will help in styling, if needed.
    
            const heroImg = document.createElement("img");
            heroImg.className = "suggestion-img";
            heroImg.src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
            heroLink.appendChild(heroImg);
    
            const heroName = document.createTextNode(hero.name);
            heroLink.appendChild(heroName);
            
            suggestionItem.appendChild(heroLink);
    
            // The favorite icon
            const favIcon = document.createElement("i");
            favIcon.className = "fas fa-heart favorite-icon";
            if(isFavorite(hero.id)) {
                favIcon.className = "fas fa-heart favorite-icon";
            }else {
                favIcon.className = "far fa-heart favorite-icon"
                favIcon.dataset.heroId = hero.id;
            }
            suggestionItem.appendChild(favIcon);
    
            this.suggestionsBox.appendChild(suggestionItem);
        });
    
        // Add event listener for favorite icon click within the suggestion box
        this.suggestionsBox.addEventListener('click', function(e) {
            if (e.target && e.target.matches('.favorite-icon')) {
                e.stopPropagation();
                const heroId = e.target.dataset.heroId;
                toggleFavorite(heroId);
                // Update the icon class based on the new favorite status
                e.target.className = isFavorite(heroId) ? "fas fa-heart favorite-icon" : "far fa-heart favorite-icon";
            }
        });
    }
        
}

// This class is responsible for fetching and displaying random superheroes on the homepage.
class RandomSuperheroes {
    constructor(displayArea, superheroService) {
        this.displayArea = displayArea;
        this.superheroService = superheroService;
    }

    // Fetch and render random superheroes
    display() {
        const totalCharacters = 1500;
        const charactersPerRequest = 100;
        const randomOffset = Math.floor(Math.random() * (totalCharacters - charactersPerRequest));
        
        this.superheroService.fetchRandomSuperheroes(randomOffset, charactersPerRequest).then(data => {
            this.showRandomSuperheroes(data.data.results);
        });
    }

    // Render fetched superheroes on the webpage
    showRandomSuperheroes(superheroes) {
        this.displayArea.innerHTML = "";
        const randomIndices = [];
        while (randomIndices.length < 3) {
            const random = Math.floor(Math.random() * superheroes.length);
            if (!randomIndices.includes(random)) randomIndices.push(random);
        }

        randomIndices.forEach(index => {
            const hero = superheroes[index];
            const heroDiv = document.createElement('div');
            heroDiv.className = "col-md-4 random-hero";
            heroDiv.innerHTML = `
                <a href="hero-detail.html?id=${hero.id}">
                    <div class="image-wrapper">
                        <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}" class="random-hero-image">
                        <i class="${isFavorite(hero.id) ? 'fas' : 'far'} fa-heart favorite-icon" data-hero-id="${hero.id}"></i>
                    </div>
                    <div class="hero-name">${hero.name}</div>
                </a>
            `;
        
            // Add event listener for favorite icon within the heroDiv
            const favoriteIcon = heroDiv.querySelector('.favorite-icon');
            favoriteIcon.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the anchor tag from navigating
                const heroId = event.target.dataset.heroId;
                toggleFavorite(heroId);
                // Update the icon class based on the new favorite status
                event.target.className = isFavorite(heroId) ? "fas fa-heart favorite-icon" : "far fa-heart favorite-icon";
            });
        
            this.displayArea.appendChild(heroDiv);
        });
    }
}


// Helper function to toggle the favorite status in local storage
function toggleFavorite(heroId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(heroId)) {
        const index = favorites.indexOf(heroId);
        favorites.splice(index, 1);
    } else {
        favorites.push(heroId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Helper function to check if a hero is marked as a favorite
function isFavorite(heroId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(heroId);
}

// Initialise services and components on page load
document.addEventListener("DOMContentLoaded", function() {
    const superheroService = new SuperheroService(PUBLIC_KEY, PRIVATE_KEY, hash, timeStamp);
    const suggestionsBox = new SuggestionBox(document.getElementById("searchInput"), document.getElementById("suggestions"), superheroService);
    const randomSuperheroes = new RandomSuperheroes(document.getElementById("randomSuperheroes"), superheroService);
    randomSuperheroes.display();
});
