const PUBLIC_KEY = "a9b98783ba0ed2096792b8b16aaafbe3";
const PRIVATE_KEY = "2b6433a8cfc22599629305be3f970e284e1794e5";
const hash = "a3b7640c225b2ffbeb55b329e8509682";
const timeStamp = "1692715909981";

class SuperheroService {
    constructor(publicKey, privateKey, hash, timeStamp) {
        this.baseURL = "https://gateway.marvel.com:443/v1/public/characters";
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.hash = hash;
        this.timeStamp = timeStamp;
    }

    fetchSuperheroesByName(query) {
        const url = `${this.baseURL}?ts=${this.timeStamp}&apikey=${this.publicKey}&hash=${this.hash}&nameStartsWith=${query}`;
        return fetch(url).then(response => response.json());
    }

    fetchRandomSuperheroes(offset, limit) {
        const url = `${this.baseURL}?ts=${this.timeStamp}&apikey=${this.publicKey}&hash=${this.hash}&offset=${offset}&limit=${limit}`;
        return fetch(url).then(response => response.json());
    }
}

class SuggestionBox {
    constructor(searchInput, suggestionsBox, superheroService) {
        this.searchInput = searchInput;
        this.suggestionsBox = suggestionsBox;
        this.superheroService = superheroService;

        this.init();
    }

    init() {
        this.searchInput.addEventListener("input", this.handleInput.bind(this));

        document.addEventListener("click", (e) => {
            if (e.target !== this.searchInput && e.target !== this.suggestionsBox) {
                this.suggestionsBox.innerHTML = "";
            }
        });
    }

    handleInput() {
        const query = this.searchInput.value;
        if (query.length < 2) {
            this.suggestionsBox.innerHTML = "";
            return;
        }

        this.superheroService.fetchSuperheroesByName(query).then(data => {
            this.displaySuggestions(data.data.results);
        });
    }

    displaySuggestions(heroes) {
        this.suggestionsBox.innerHTML = "";
        heroes.slice(0, 5).forEach(hero => {
            const suggestionItem = document.createElement("a");
            suggestionItem.href = `hero-detail.html?id=${hero.id}`;
            suggestionItem.className = "list-group-item list-group-item-action suggestion-item";

            const heroImg = document.createElement("img");
            heroImg.className = "suggestion-img";
            heroImg.src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
            suggestionItem.appendChild(heroImg);

            const heroName = document.createTextNode(hero.name);
            suggestionItem.appendChild(heroName);
            this.suggestionsBox.appendChild(suggestionItem);
        });
    }
}

class RandomSuperheroes {
    constructor(displayArea, superheroService) {
        this.displayArea = displayArea;
        this.superheroService = superheroService;
    }

    display() {
        const totalCharacters = 1500;
        const charactersPerRequest = 100;
        const randomOffset = Math.floor(Math.random() * (totalCharacters - charactersPerRequest));

        this.superheroService.fetchRandomSuperheroes(randomOffset, charactersPerRequest).then(data => {
            this.showRandomSuperheroes(data.data.results);
        });
    }

    showRandomSuperheroes(superheroes) {
        this.displayArea.innerHTML = "";
        const randomIndices = [];
        while (randomIndices.length < 3) {
            const random = Math.floor(Math.random() * superheroes.length);
            if (!randomIndices.includes(random)) randomIndices.push(random);
        }

        randomIndices.forEach(index => {
            const hero = superheroes[index];
            const heroDiv = `
                <div class="col-md-4 random-hero">
                    <a href="hero-detail.html?id=${hero.id}">
                        <div class="image-wrapper">
                            <img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}" class="random-hero-image">
                        </div>
                        <div class="hero-name">${hero.name}</div>
                    </a>
                </div>
            `;

            this.displayArea.innerHTML += heroDiv;
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const superheroService = new SuperheroService(PUBLIC_KEY, PRIVATE_KEY, hash, timeStamp);
    const suggestionsBox = new SuggestionBox(document.getElementById("searchInput"), document.getElementById("suggestions"), superheroService);
    const randomSuperheroes = new RandomSuperheroes(document.getElementById("randomSuperheroes"), superheroService);
    randomSuperheroes.display();
});
