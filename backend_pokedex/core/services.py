import requests
from django.core.cache import cache

POKEAPI_BASE = "https://pokeapi.co/api/v2"

TIPOS_CORES = {
    "fire": "#F08030",
    "water": "#6890F0",
    "grass": "#78C850",
    "electric": "#F8D030",
    "bug": "#A8B820",
    "fairy": "#EE99AC",
    "normal": "#A8A878",
    "poison": "#A040A0",
    "ground": "#E0C068",
    "rock": "#B8A038",
    "fighting": "#C03028",
    "psychic": "#F85888",
    "ghost": "#705898",
    "ice": "#98D8D8",
    "dragon": "#7038F8",
    "dark": "#705848",
    "steel": "#B8B8D0",
    "flying": "#A890F0",
}

def calcular_geracao(pokemon_id):
    if pokemon_id <= 151: return 1
    if pokemon_id <= 251: return 2
    if pokemon_id <= 386: return 3
    if pokemon_id <= 493: return 4
    if pokemon_id <= 649: return 5
    if pokemon_id <= 721: return 6
    if pokemon_id <= 809: return 7
    if pokemon_id <= 905: return 8
    return 9

def get_pokemon_detalhes(pokemon_id):
    cache_key = f"pokemon_{pokemon_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    url = f"{POKEAPI_BASE}/pokemon/{pokemon_id}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()

    tipos = [
        {"nome": t["type"]["name"], "cor": TIPOS_CORES.get(t["type"]["name"], "#A8A878")}
        for t in data.get("types", [])
    ]
    stats = [{"label": s["stat"]["name"], "valor": s["base_stat"]} for s in data.get("stats", [])]

    pokemon = {
        "numero": data["id"],
        "nome": data["name"],
        "imagem": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png",
        "tipos": tipos,
        "stats": stats,
        "geracao": calcular_geracao(data["id"]),
    }

    # Cache por 24h
    cache.set(cache_key, pokemon, 60*60*24)
    return pokemon
import requests

def get_pokemon_by_id(pokemon_id):
    url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}/"
    response = requests.get(url)
    if response.status_code != 200:
        return None
    return response.json()

def get_todos_pokemons(limit=151):
    cache_key = f"pokemons_list_{limit}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    url = f"{POKEAPI_BASE}/pokemon?limit={limit}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return []

    results = resp.json().get("results", [])
    pokemons = []
    for p in results:
        # Extrai ID da URL
        pokemon_id = int(p["url"].rstrip("/").split("/")[-1])
        detalhes = get_pokemon_detalhes(pokemon_id)
        if detalhes:
            pokemons.append(detalhes)

    cache.set(cache_key, pokemons, 60*60*24)
    return pokemons
