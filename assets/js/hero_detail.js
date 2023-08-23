let urlParams = new URLSearchParams(window.location.search);
let heroId = urlParams.get('id');

const PUBLIC_KEY = "a9b98783ba0ed2096792b8b16aaafbe3";
const PRIVATE_KEY = "2b6433a8cfc22599629305be3f970e284e1794e5";
const hash = "a3b7640c225b2ffbeb55b329e8509682";
const timeStamp = "1692715909981";
const BASE_URL = 'https://gateway.marvel.com:443/v1/public/characters/';

function fetchHeroDetails() {
    return fetch(`${BASE_URL}${heroId}?ts=${timeStamp}&apikey=${PUBLIC_KEY}&hash=${hash}`)
        .then(response => response.json())
        .then(data => data.data.results[0])
        .catch(error => {
            console.error("There was an error fetching the hero details", error);
        });
}

function populateBasicDetails(hero) {
    document.getElementById('heroImage').src = `${hero.thumbnail.path}.${hero.thumbnail.extension}`;
    document.getElementById('heroName').innerText = hero.name;
    document.getElementById('heroDescription').innerText = hero.description || "Description not available";
}

function displayList(elementId, items) {
    const listElement = document.getElementById(elementId);
    if (items && items.length > 0) {
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerText = item.name || "N/A"; // In case some names are null or not provided
            listElement.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.innerText = "Not available";
        listElement.appendChild(listItem);
    }
}

function init() {
    fetchHeroDetails().then(hero => {
        populateBasicDetails(hero);
        displayList('heroComics', hero.comics.items);
        displayList('heroStories', hero.stories.items);
        displayList('heroEvents', hero.events.items);
        displayList('heroSeries', hero.series.items);
    });
}

init();
