import { Link } from "react-router-dom";
import TypeBadge from "./TypeBadge.jsx";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext.jsx";

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function getSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function PokemonCard({ pokemon }) {
  const id = getIdFromUrl(pokemon.url);
  const [types, setTypes] = useState([]);
  const initialSprite = pokemon.sprite || (/^\d+$/.test(id) ? getSpriteUrl(id) : null);
  const [spriteUrl, setSpriteUrl] = useState(initialSprite);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    // Optional: fetch types to show on the card.
    // To keep it performant on a large list, we might want to just show the sprite and name
    // or fetch types asynchronously.
    let isMounted = true;
    fetch(pokemon.url)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setTypes(data.types.map(t => t.type.name));
          setSpriteUrl(getSpriteUrl(data.id));
        }
      })
      .catch(err => console.error(err));

    return () => { isMounted = false; };
  }, [pokemon.url]);

  return (
    <article className="pokemon-card glass">
      <div className="card-bg-circle"></div>
      <button
        type="button"
        className={`favorite-button ${isFavorite(pokemon.name) ? "is-favorite" : ""}`}
        onClick={() => toggleFavorite(pokemon.name)}
        aria-label={`${isFavorite(pokemon.name) ? "Remove" : "Add"} ${capitalize(pokemon.name)} ${isFavorite(pokemon.name) ? "from" : "to"} favorites`}
        title={isFavorite(pokemon.name) ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={18} fill={isFavorite(pokemon.name) ? "currentColor" : "none"} />
      </button>
      <Link to={`/pokemon/${pokemon.name}`} className="pokemon-card-link">
        {spriteUrl && <img className="pokemon-card-sprite" src={spriteUrl} alt={pokemon.name} loading="lazy" />}
        <div className="pokemon-card-info">
          <span className="pokemon-card-id">#{id.padStart(3, "0")}</span>
          <h3 className="pokemon-card-name">{capitalize(pokemon.name)}</h3>
          <div className="pokemon-card-types">
            {types.map(type => <TypeBadge key={type} type={capitalize(type)} />)}
          </div>
        </div>
      </Link>
    </article>
  );
}
