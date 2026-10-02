import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import PokemonCard from "../components/PokemonCard.jsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPokemons() {
      setIsLoading(true);
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000");
        if (!response.ok) throw new Error("Failed to fetch Pokémon data");
        const data = await response.json();
        setPokemons(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadPokemons();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      navigate(`/pokemon/${query}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(60); // Reset visible count on new search
  };

  const filteredPokemons = pokemons.filter((p) =>
    p.name.includes(searchQuery.toLowerCase())
  );

  const displayedPokemons = filteredPokemons.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPokemons.length;

  return (
    <div className="home-page">
      <section className="home-intro">
        <div>
          <span className="home-kicker">National field guide</span>
          <h2>Know your Pokémon.</h2>
          <p>Search, compare, and build a team from every known species.</p>
        </div>
        <span className="catalog-mark">01 <span>/</span> 1025</span>
      </section>
      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-bar glass">
          <Search size={20} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search Pokémon by name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      {isLoading && <div className="loading-spinner"></div>}
      {error && <div className="error-message">{error}</div>}

      {!isLoading && !error && (
        <>
          <div className="pokemon-grid">
            {displayedPokemons.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </div>
          
          {hasMore && (
            <div className="load-more-container flex-center" style={{ marginTop: '3rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => setVisibleCount(v => v + 60)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
      
      {!isLoading && !error && filteredPokemons.length === 0 && (
        <div className="no-results">
          <p>No Pokémon found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
