import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import PokemonCard from "../components/PokemonCard.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";

export default function Favorites() {
  const { favoriteNames } = useFavorites();
  const favoritePokemons = favoriteNames.map(name => ({
    name,
    url: `https://pokeapi.co/api/v2/pokemon/${name}`
  }));

  return (
    <div className="favorites-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={24} />
        Back to Pokédex
      </Link>
      <div className="page-heading">
        <div>
          <span className="home-kicker">Your collection</span>
          <h2>Favorite Pokémon</h2>
        </div>
        <span className="favorites-count"><Heart size={16} /> {favoritePokemons.length}</span>
      </div>
      {favoritePokemons.length > 0 ? (
        <div className="pokemon-grid">
          {favoritePokemons.map(pokemon => <PokemonCard key={pokemon.name} pokemon={pokemon} />)}
        </div>
      ) : (
        <div className="empty-state glass">
          <Heart size={34} />
          <h3>Your favorites are waiting</h3>
          <p>Tap the heart on a Pokémon card to build your collection.</p>
          <Link to="/" className="btn-primary">Browse Pokédex</Link>
        </div>
      )}
    </div>
  );
}
