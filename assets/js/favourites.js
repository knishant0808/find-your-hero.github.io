document.addEventListener('DOMContentLoaded', function() {
    //Initialise the FavouriteSuperheroesApp on page load
    const favoriteSuperheroesApp = new FavoriteSuperheroesApp();
    favoriteSuperheroesApp.initialize();
});

// Class for the main application
class FavoriteSuperheroesApp {
    constructor() {
        // Get the main container for the favourite superheroes
        this.favoriteContainer = document.getElementById('favoriteSuperheroes');
    }

    initialize() {
        this.loadFavoriteHeroes();
    }

    // Load and display the favorite superheroes
    loadFavoriteHeroes() {
        // Clear existing superheros from the container
        this.favoriteContainer.innerHTML = '';
        
        const favoriteHeroIds = this.retrieveFavoriteHeroIds();
    
        if (!favoriteHeroIds.length) {
            this.displayNoFavoritesMessage();
        } else {
            this.displayFavoriteHeroes(favoriteHeroIds);
        }
    }
    
    // Retreive superhero IDs from localstorage
    retrieveFavoriteHeroIds() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    // Display a message if there are no favorite superheroes
    displayNoFavoritesMessage() {
        this.favoriteContainer.innerHTML = '<p>You have no favorite superheroes yet.</p>';
    }

    // For each superhero ID, fetch the details and display the superhero
    displayFavoriteHeroes(heroIds) {
        heroIds.forEach(heroId => {
            const heroDetailsFetcher = new MarvelHeroDetailsFetcher();
            heroDetailsFetcher.fetch(heroId)
                .then(heroDetails => {
                    const heroCard = new HeroCard(heroDetails, heroId, this);
                    this.favoriteContainer.appendChild(heroCard.render());
                });
        });
    }

    // Remove a superhero from the favorite list
    removeHeroFromFavorites(heroIdToRemove) {
        // Retrieve the favorites from localStorage
        const favoriteHeroIds = this.retrieveFavoriteHeroIds();

        // Filter out the heroIdToRemove
        const updatedFavorites = favoriteHeroIds.filter(heroId => heroId !== heroIdToRemove);

        // Update localStorage with the filtered list
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Load the favorite superheroes page
        this.loadFavoriteHeroes();
    }
}

// Class to fetch superhero details from the MARVEL api
class MarvelHeroDetailsFetcher {
    constructor() {
        // Configuration for the MARVEL api
        this.apiConfig = {
            PUBLIC_KEY: 'a9b98783ba0ed2096792b8b16aaafbe3',
            PRIVATE_KEY: "2b6433a8cfc22599629305be3f970e284e1794e5",
            hash: "a3b7640c225b2ffbeb55b329e8509682",
            timeStamp: "1692715909981",
            baseURL: `https://gateway.marvel.com:443/v1/public/characters/`
        };
    }
    
    // Fetch superhero details based on the hero ID
    fetch(heroId) {
        return fetch(`${this.apiConfig.baseURL}${heroId}?ts=${this.apiConfig.timeStamp}&apikey=${this.apiConfig.PUBLIC_KEY}&hash=${this.apiConfig.hash}`)
            .then(response => response.json())
            .then(data => data.data.results[0]);
    }
}

// Class to create a card for each superhero
class HeroCard {
    constructor(heroDetails, heroId, appInstance) {
        this.heroDetails = heroDetails;
        this.heroId = heroId;
        this.appInstance = appInstance;
    }
    
    // Create the main card for the superhero
    render() {
        const heroCard = document.createElement('div');
        heroCard.className = 'card col-md-3';

        const heroLink = this.createHeroLink();
        const heroBody = this.createHeroBody();

        heroCard.appendChild(heroLink);
        heroCard.appendChild(heroBody);

        return heroCard;
    }

    // Create a link for the superhero image
    createHeroLink() {
        const heroLink = document.createElement('a');
        heroLink.href = `hero-detail.html?id=${this.heroId}`;
        heroLink.title = `Details for ${this.heroDetails.name}`;

        const heroImage = document.createElement('img');
        heroImage.src = `${this.heroDetails.thumbnail.path}.${this.heroDetails.thumbnail.extension}`;
        heroImage.className = 'card-img-top hero-image';

        heroLink.appendChild(heroImage);

        return heroLink;
    }

    // Create the body sectiopn of the superhero card
    createHeroBody() {
        const heroBody = document.createElement('div');
        heroBody.className = 'card-body';

        const heroName = document.createElement('h5');
        heroName.className = 'card-title';
        heroName.textContent = this.heroDetails.name;

        const heartIcon = this.createHeartIcon();

        heroName.appendChild(heartIcon);
        heroBody.appendChild(heroName);

        return heroBody;
    }

    // Create a heart icon for favorites
    createHeartIcon() {
        const heartIcon = document.createElement('i');
        heartIcon.className = 'fas fa-heart ml-2';
        
        // Add an eventlistener to remove superhero from favorites on click
        heartIcon.addEventListener('click', () => {
            this.appInstance.removeHeroFromFavorites(this.heroId);
            this.removeHeroCard();
        });

        return heartIcon;
    }

    // Remove the superhero card from the DOM
    removeHeroCard() {
        const heroCard = document.querySelector(`[data-hero-id="${this.heroId}"]`);
        if (heroCard) {
            heroCard.remove();
        }
    }
}
