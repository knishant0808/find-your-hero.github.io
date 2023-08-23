// Extracting  the 'id' parameter from the url
const urlParams = new URLSearchParams(window.location.search);
const heroId = urlParams.get('id');

// Constants for the API keys and URL endpoints
const PUBLIC_KEY = "a9b98783ba0ed2096792b8b16aaafbe3";
const PRIVATE_KEY = "2b6433a8cfc22599629305be3f970e284e1794e5";
const hash = "a3b7640c225b2ffbeb55b329e8509682";
const timeStamp = "1692715909981";
const BASE_URL = 'https://gateway.marvel.com:443/v1/public/characters/';

// Service class to handle fetching hero details from the MARVEL API
class HeroDetailsService {
    static fetchHeroDetails() {
        // Fetchin the details of a hero based on its 'id' from the MARVEL API
        return fetch(`${BASE_URL}${heroId}?ts=${timeStamp}&apikey=${PUBLIC_KEY}&hash=${hash}`)
            .then(response => response.json())
            .then(data => data.data.results[0])
            .catch(error => {
                console.error("There was an error fetching the hero details", error);
            });
    }
}

// Class for managing and populating hero's basic details on the page
class HeroDetail {
    static populateBasicDetails(hero) {
        document.getElementById('heroImage').src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
        document.getElementById('heroName').innerText = hero.name;
        document.getElementById('heroDescription').innerText = hero.description || "Description not available";
    }

    // Check the favorite status of the hero and toggle the favorite icon accordingly
    static handleFavoriteStatus() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        let favoriteIcon = document.getElementById('favoriteIcon');
        
        // Create and append the favorite icon if it does not exist
        if (!favoriteIcon) {
            favoriteIcon = document.createElement('i');
            favoriteIcon.id = 'favoriteIcon';
            favoriteIcon.style.cursor = 'pointer';
            favoriteIcon.onclick = toggleFavoriteOnDetailPage;

            // Append the icon next to the hero's name
            document.getElementById('heroName').after(favoriteIcon);
        }
        
        // Now, set the class depending on whether the hero is a favorite or not
        if (favorites && favorites.includes(heroId.toString())) {
            favoriteIcon.className = 'fas fa-heart';
        } else {
            favoriteIcon.className = 'far fa-heart';
        }
    }
}

// Class to manage lists associated with the hero
class HeroList {
    static displayList(elementId, items) {
        const listElement = document.getElementById(elementId);
        if (items && items.length > 0) {
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerText = item.name || "N/A"; // Handle cases where some names might be null or not provided
                listElement.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.innerText = "Not available";
            listElement.appendChild(listItem);
        }
    }
}

// Function to handle the toggling of favorite status for a hero
function toggleFavoriteOnDetailPage() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteIcon = document.getElementById('favoriteIcon');

    // Convert heroId to string for consistent comparisons
    const strHeroId = heroId.toString();

    //If hero is already a favorite, remove it, otherwise add it
    if (favorites.includes(strHeroId)) {
        const index = favorites.indexOf(strHeroId);
        favorites.splice(index, 1);
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far');
    } else {
        favorites.push(strHeroId);
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas');
    }
    
    //Store the updated favorites in localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
}


// Initialization function, fetches hero details and populates them on the page
function init() {
    HeroDetailsService.fetchHeroDetails().then(hero => {
        HeroDetail.populateBasicDetails(hero);
        HeroDetail.handleFavoriteStatus();
        HeroList.displayList('heroComics', hero.comics.items);
        HeroList.displayList('heroStories', hero.stories.items);
        HeroList.displayList('heroEvents', hero.events.items);
        HeroList.displayList('heroSeries', hero.series.items);
    });
}

//Run the initialisation function
init();
