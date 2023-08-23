const urlParams = new URLSearchParams(window.location.search);
const heroId = urlParams.get('id');

// Constants for the API keys and URL endpoints
const PUBLIC_KEY = "a9b98783ba0ed2096792b8b16aaafbe3";
const PRIVATE_KEY = "2b6433a8cfc22599629305be3f970e284e1794e5";
const hash = "a3b7640c225b2ffbeb55b329e8509682";
const timeStamp = "1692715909981";
const BASE_URL = 'https://gateway.marvel.com:443/v1/public/characters/';

// Service class to manage API calls
class HeroDetailsService {
    static fetchHeroDetails() {
        return fetch(`${BASE_URL}${heroId}?ts=${timeStamp}&apikey=${PUBLIC_KEY}&hash=${hash}`)
            .then(response => response.json())
            .then(data => data.data.results[0])
            .catch(error => {
                console.error("There was an error fetching the hero details", error);
            });
    }
}

// Module to manage the basic details of a hero
class HeroDetail {
    static populateBasicDetails(hero) {
        document.getElementById('heroImage').src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
        document.getElementById('heroName').innerText = hero.name;
        document.getElementById('heroDescription').innerText = hero.description || "Description not available";
    }
}

// Module to display different lists related to the hero
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

// Initialization function
function init() {
    HeroDetailsService.fetchHeroDetails().then(hero => {
        HeroDetail.populateBasicDetails(hero);
        HeroList.displayList('heroComics', hero.comics.items);
        HeroList.displayList('heroStories', hero.stories.items);
        HeroList.displayList('heroEvents', hero.events.items);
        HeroList.displayList('heroSeries', hero.series.items);
    });
}

init();
