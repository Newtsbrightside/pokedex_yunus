import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Search, Heart, Star } from "lucide-react";
import TeamAnalysis from "../components/TeamAnalysis.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";

function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function getSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function TeamBuilder() {
  const [team, setTeam] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [pickerQuery, setPickerQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { favoriteNames, isFavorite } = useFavorites();

  useEffect(() => {
    async function loadPokemons() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await response.json();
        setAllPokemons(data.results);
      } catch (err) {
        console.error("Failed to load pokemon for search", err);
      }
    }
    loadPokemons();
  }, []);

  const addToTeam = async (pokemonItem) => {
    if (team.length >= 6) return;
    if (team.find(p => p.name === pokemonItem.name)) return; // prevent exact duplicates for simplicity

    try {
      // Fetch details to get types immediately
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonItem.name}`);
      const data = await res.json();
      
      const newMember = {
        name: data.name,
        id: data.id,
        types: data.types.map(t => t.type.name),
        sprite: getSpriteUrl(data.id)
      };

      setTeam(currentTeam => {
        const nextTeam = [...currentTeam];
        const targetSlot = selectedSlot ?? nextTeam.findIndex(member => !member);
        nextTeam[targetSlot === -1 ? nextTeam.length : targetSlot] = newMember;
        return nextTeam;
      });
      setPickerQuery("");
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromTeam = (indexToRemove) => {
    setTeam(team.filter((_, i) => i !== indexToRemove));
  };

  const clearTeam = () => {
    setTeam([]);
  };

  const openPicker = (slotIndex) => {
    setSelectedSlot(slotIndex);
    setPickerQuery("");
  };

  const closePicker = () => {
    setSelectedSlot(null);
    setPickerQuery("");
  };

  const matchingPokemons = allPokemons
    .filter(pokemon => pokemon.name.includes(pickerQuery.toLowerCase().trim()))
    .sort((first, second) => Number(isFavorite(second.name)) - Number(isFavorite(first.name)));
  const pickerResults = pickerQuery.trim()
    ? matchingPokemons.slice(0, 30)
    : matchingPokemons.filter(pokemon => isFavorite(pokemon.name));

  return (
    <div className="team-builder-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={24} />
        Back to Pokédex
      </Link>

      <div className="team-builder-header">
        <h2>Assemble Your Team</h2>
        <div className="team-controls">
          <button className="btn-primary picker-open-button" onClick={() => openPicker(team.findIndex(member => !member))} disabled={team.length >= 6}>
            <Search size={18} />
            Choose Pokémon
          </button>
          {team.length > 0 && (
             <button className="btn-secondary" onClick={clearTeam}>Clear Team</button>
          )}
        </div>
      </div>

      <div className="team-slots glass">
        {[0, 1, 2, 3, 4, 5].map(index => {
          const member = team[index];
          return (
            <div key={index} className={`team-slot ${member ? 'filled' : 'empty'}`} onClick={() => !member && openPicker(index)} role={!member ? "button" : undefined} tabIndex={!member ? 0 : undefined}>
              {member ? (
                <>
                  <button className="remove-btn" onClick={() => removeFromTeam(index)}>
                    <X size={16} />
                  </button>
                  <img src={member.sprite} alt={member.name} className="slot-sprite" />
                  <span className="slot-name">{member.name}</span>
                  <div className="slot-types">
                    {member.types.map(t => (
                       <span key={t} className="tiny-type-badge" style={{ backgroundColor: `var(--type-${t})` }}>{t}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Plus size={32} color="var(--border-color)" />
                  <span className="slot-hint">Add Pokémon</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {team.length > 0 && <TeamAnalysis team={team} />}

      {selectedSlot !== null && (
        <div className="picker-backdrop" onClick={closePicker}>
          <section className="pokemon-picker glass" onClick={event => event.stopPropagation()}>
            <div className="picker-header">
              <div>
                <span className="home-kicker">Team slot {selectedSlot === null ? "" : selectedSlot + 1}</span>
                <h3>Choose a Pokémon</h3>
              </div>
              <button className="modal-close" onClick={closePicker} aria-label="Close Pokémon picker"><X size={20} /></button>
            </div>
            <div className="picker-search">
              <Search size={18} color="var(--text-secondary)" />
              <input autoFocus value={pickerQuery} onChange={event => setPickerQuery(event.target.value)} placeholder="Search by name..." />
            </div>
            <div className="picker-results">
              {pickerResults.map(pokemon => {
                const id = getIdFromUrl(pokemon.url);
                const favorite = isFavorite(pokemon.name);
                return (
                  <button key={pokemon.name} className="picker-result" onClick={() => addToTeam(pokemon)} disabled={team.some(member => member?.name === pokemon.name)}>
                    <img src={getSpriteUrl(id)} alt={pokemon.name} />
                    <span>{pokemon.name}</span>
                    {favorite && <Star size={15} fill="currentColor" className="picker-favorite" />}
                  </button>
                );
              })}
            </div>
            {favoriteNames.length === 0 && <p className="picker-note"><Heart size={15} /> No favorites yet. Search above to find a Pokémon.</p>}
            {favoriteNames.length > 0 && !pickerQuery && <p className="picker-note"><Heart size={15} /> Your favorites are ready to add.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
