const toTopBtn = document.querySelector(".back-to-top-button");
const pokeSearchForm = document.querySelector("#poke-search-form");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) toTopBtn.classList.add("show");
    else toTopBtn.classList.remove("show");
});

toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

pokeSearchForm.addEventListener("submit", (e) => e.preventDefault());

const pokedexURL = `https://pokeapi.co/api/v2/pokemon`;

const colors = {
    fire: "#FDDFDF",
    grass: "#DEFDE0",
    electric: "#FCF7DE",
    water: "#DEF3FD",
    ground: "#f4e7da",
    rock: "#d5d5d4",
    fairy: "#fceaff",
    poison: "#d6b3ff",
    bug: "#f8d5a3",
    dragon: "#97b3e6",
    psychic: "#eaeda1",
    flying: "#F5F5F5",
    fighting: "#E6E0D4",
    normal: "#F5F5F5",
    ice: "#e0f5ff ",
};

class Pokedex {
    constructor(apiUrl, pageSize = 25) {
        if (!apiUrl.length) {
            throw new Error("ApiURL must be filled!");
        }

        this.nextPageUrl = `${apiUrl}?limit=${pageSize}&offset=0`;
        this.currentPageUrl = null;
        this.prevPageUrl = null;
        this.cache = {};
    }

    getNextPage() {
        if (!this.nextPageUrl) {
            console.warn("You're on the last page already.", this.nextPageUrl)
            return [];
        }
        return this.fetchPage(this.nextPageUrl);
    }

    getPrevPage() {
        if (!this.prevPageUrl) {
            console.warn("You're on the first page already.")
            return [];
        }
        return this.fetchPage(this.prevPageUrl);
    }

    getCurrentPage() {
        if (!this.currentPageUrl) {
            console.warn("You haven't loaded any pages yet [hint: try calling `getNextPage` first].")
            return [];
        }
        return this.fetchPage(this.currentPageUrl);
    }

    getAllLoadedPokemons() {
        return Object.values(this.cache).flat(1);
    }

    findPokemonsByName(keyword) {
        const allPokemons = this.getAllLoadedPokemons();
        if (!keyword.length) {
            return allPokemons;
        }

        return allPokemons.filter(it => includes(it.name, keyword))
    }

    async fetchPage(url) {
        if (url in this.cache) {
            return this.cache[url]
        }

        const { results, next, previous } = await fetchJson(url);
        const pageWithDetails = await Promise.all(results.map(it => fetchJson(it.url)));

        this.currentPageUrl = url;
        this.nextPageUrl = next;
        this.prevPageUrl = previous;
        this.cache[url] = pageWithDetails;
        return pageWithDetails;
    }
}
 function fetchJson(url) {
  return fetch(url).then(it => it.json())
}

 function includes(searchIn, searchFor) {
  return searchIn.toLowerCase().includes(searchFor.toLowerCase())
}


const pokeContainer = document.querySelector(".poke-container");
const searchInput = document.querySelector("#search-input");
const pokedex = new Pokedex(pokedexURL);

window.addEventListener('load', loadNextPageAndRender);
document.querySelector("#load-button").addEventListener("click", loadNextPageAndRender);

// TODO: Debounce mechanism can be added.
searchInput.addEventListener("input", () => {
  pokeContainer.innerHTML = "";
  pokedex.findPokemonsByName(searchInput.value).forEach(createPokemonBox);
});

async function loadNextPageAndRender() {
  const pokemons = await pokedex.getNextPage();
  pokemons.forEach(createPokemonBox);
}

function createPokemonBox(pokemon) {
  const { name, weight } = pokemon;
  const id = pokemon.id.toString().padStart(3, "0");
  const type = pokemon.types[0].type.name

  const pokemonEl = document.createElement("div");
  pokemonEl.classList.add("poke-box");
  pokemonEl.style.backgroundColor = colors[type];
  pokemonEl.innerHTML = buildHtmlOfPokemon(id, name, weight, type)
  pokeContainer.appendChild(pokemonEl);
}

function buildHtmlOfPokemon(id, name, weight, type) {
  return `
  <img
    class="poke-img"
    src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png"
    alt="${name} Pokemon"
  />
  <h3 class="poke-name">${name}</h3>
  <p class="poke-id"># ${id}</p>
  <p class="poke-weight">${weight} kg</p>
  <p class="poke-type">Type : ${type}</p>
  `
}
