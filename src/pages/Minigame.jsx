import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function getSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function Minigame() {
  const [pokemons, setPokemons] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState("loading"); // loading, playing, won, lost
  const inputRef = useRef(null);

  useEffect(() => {
    async function initGame() {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025"); // up to Gen 9 limit for better art availability
        const data = await res.json();
        setPokemons(data.results);
        pickRandom(data.results);
      } catch (err) {
        console.error(err);
      }
    }
    initGame();
  }, []);

  const pickRandom = (list) => {
    const listToUse = list || pokemons;
    if (listToUse.length === 0) return;
    
    const randIndex = Math.floor(Math.random() * listToUse.length);
    setCurrentPokemon(listToUse[randIndex]);
    setGuess("");
    setGameState("playing");
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (!currentPokemon) return;
    
    const formattedGuess = guess.trim().toLowerCase();
    const actualName = currentPokemon.name.toLowerCase();
    
    // Strip hyphens for easier guessing (e.g. mr-mime -> mr mime)
    const cleanActualName = actualName.replace(/-/g, ' ');
    const cleanGuess = formattedGuess.replace(/-/g, ' ');

    if (cleanGuess === cleanActualName || cleanGuess === actualName) {
      setGameState("won");
    } else {
      setGameState("lost");
    }
  };

  if (!currentPokemon) {
    return <div className="loading-spinner"></div>;
  }

  const id = getIdFromUrl(currentPokemon.url);
  const isRevealed = gameState === "won" || gameState === "lost";

  return (
    <div className="minigame-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={24} />
        Back to Pokédex
      </Link>

      <div className="game-container glass">
        <h2>Who's That Pokémon?</h2>
        
        <div className="pokemon-silhouette-container">
          <img 
            src={getSpriteUrl(id)} 
            alt="Mystery Pokemon" 
            className={`pokemon-silhouette ${isRevealed ? 'revealed' : ''}`}
          />
        </div>

        {gameState === "playing" && (
          <form onSubmit={handleGuess} className="guess-form">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Enter Pokémon name..." 
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary">Guess!</button>
          </form>
        )}

        {isRevealed && (
          <div className="game-result">
            <h3 className={gameState === "won" ? "text-success" : "text-error"}>
              {gameState === "won" ? "Correct!" : "Incorrect!"}
            </h3>
            <p>It's <strong>{currentPokemon.name.charAt(0).toUpperCase() + currentPokemon.name.slice(1)}</strong>!</p>
            <button onClick={() => pickRandom()} className="btn-primary flex-center" style={{ gap: '0.5rem', margin: '1rem auto' }}>
              <RefreshCw size={18} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
