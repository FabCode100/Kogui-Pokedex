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
    cache_key = f"pokemon_{pokemon_id}_detalhe"
    cached = cache.get(cache_key)
    if cached:
        return cached

    url = f"{POKEAPI_BASE}/pokemon/{pokemon_id}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()

    # Tipos com cor
    tipos = [
        {"descricao": t["type"]["name"], "cor": TIPOS_CORES.get(t["type"]["name"], "#A8A878")}
        for t in data.get("types", [])
    ]

    # Status
    status = [{"nome": s["stat"]["name"], "valor": s["base_stat"]} for s in data.get("stats", [])]

    # Habilidades
    habilidades = [
        {"nome": a["ability"]["name"], "descricao": None}
        for a in data.get("abilities", [])
    ]

    # Movimentos (só primeiros 10 pra não pesar)
    movimentos = [
        {
            "nome": m["move"]["name"],
            "tipo": None,
            "power": None,
            "pp": None,
            "categoria": None,
            "level": None,
        }
        for m in data.get("moves", [])[:10]
    ]

    # Sprites (carrossel)
    sprites = [
        s for s in [
            data["sprites"].get("front_default"),
            data["sprites"].get("back_default"),
            data["sprites"].get("front_shiny"),
            data["sprites"].get("back_shiny"),
            data["sprites"]["other"].get("official-artwork", {}).get("front_default"),
        ] if s
    ]

    # Corrente evolutiva (opcional)
    species_url = data.get("species", {}).get("url")
    evolution_chain = []
    if species_url:
        species_resp = requests.get(species_url).json()
        evo_url = species_resp.get("evolution_chain", {}).get("url")
        if evo_url:
            evo_resp = requests.get(evo_url).json()
            chain = evo_resp.get("chain", {})
            while chain:
                evo_name = chain["species"]["name"]
                evo_id = int(chain["species"]["url"].split("/")[-2])
                evolution_chain.append({
                    "nome": evo_name,
                    "imagem_url": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{evo_id}.png"
                })
                chain = chain["evolves_to"][0] if chain["evolves_to"] else None

    # Monta objeto final compatível com frontend
    pokemon = {
        "codigo": data["id"],
        "nome": data["name"],
        "imagem_url": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png",
        "tipos": tipos,
        "status": status,
        "favorito": False,
        "equipe": False,
        "geracao": calcular_geracao(data["id"]),
        "habilidades": habilidades,
        "movimentos": movimentos,
        "evolutionChain": evolution_chain,
        "sprites": sprites,
    }

    cache.set(cache_key, pokemon, 60 * 60 * 24)
    return pokemon
