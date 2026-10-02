import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import TypeBadge from "../components/TypeBadge.jsx";
import StatBar from "../components/StatBar.jsx";

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatLabel(value) {
  return value ? value.split("-").map(capitalize).join(" ") : "Unknown";
}

function formatPercent(value) {
  return value === null || value === undefined ? "Unknown" : `${value}%`;
}

function getEnglishName(entries, fallback = "Unknown") {
  return entries?.find(entry => entry.language.name === "en")?.name || fallback;
}

function flattenEvolutionChain(node, evolution = []) {
  if (!node) return evolution;

  evolution.push({
    name: node.species.name,
    id: node.species.url.split("/").filter(Boolean).pop()
  });

  node.evolves_to?.forEach(next => flattenEvolutionChain(next, evolution));
  return evolution;
}

export default function PokemonDetail() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const [pokeRes, speciesRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${name}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
        ]);

        if (!pokeRes.ok) throw new Error(`No Pokémon found for "${name}"`);
        
        const pokeData = await pokeRes.json();
        
        let speciesData = null;
        if (speciesRes.ok) {
           speciesData = await speciesRes.json();
        }

        let evolutionData = [];
        if (speciesData?.evolution_chain?.url) {
          const evolutionRes = await fetch(speciesData.evolution_chain.url);
          if (evolutionRes.ok) {
            const evolutionJson = await evolutionRes.json();
            evolutionData = flattenEvolutionChain(evolutionJson.chain);
          }
        }

        if (isMounted) {
          setPokemon(pokeData);
          setSpecies(speciesData);
          setEvolutionChain(evolutionData);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [name]);

  if (isLoading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error} <br/><Link to="/">Go Back</Link></div>;
  if (!pokemon) return null;

  const primaryType = pokemon.types[0].type.name;
  
  // Get English flavor text
  const flavorTextEntry = species?.flavor_text_entries.find(entry => entry.language.name === 'en');
  const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
  const genus = getEnglishName(species?.genera, "Unknown species").replace(/ Pokémon$/, "");
  const learnableMoves = pokemon.moves
    .filter(move => move.version_group_details.some(detail => detail.move_learn_method.name === "level-up"))
    .slice(0, 12);

  return (
    <div className="pokemon-detail-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={24} />
        Back to Pokédex
      </Link>
      
      <div className="detail-layout">
        {/* Left Side: Image & Basic Info */}
        <div className="detail-left glass">
          <div className="detail-header">
            <span className="detail-id">#{pokemon.id.toString().padStart(3, '0')}</span>
            <h2 className="detail-name">{capitalize(pokemon.name)}</h2>
          </div>
          
          <div className="detail-image-container" style={{
            background: `radial-gradient(circle, var(--type-${primaryType}) 0%, transparent 70%)`
          }}>
            <img 
              src={pokemon.sprites.other['official-artwork'].front_default} 
              alt={pokemon.name} 
              className="detail-image"
            />
          </div>

          <div className="detail-types">
            {pokemon.types.map(t => (
              <TypeBadge key={t.type.name} type={capitalize(t.type.name)} />
            ))}
          </div>
          
          <div className="detail-measurements">
            <div>
              <span className="measurement-label">Height</span>
              <span className="measurement-value">{pokemon.height / 10} m</span>
            </div>
            <div>
              <span className="measurement-label">Weight</span>
              <span className="measurement-value">{pokemon.weight / 10} kg</span>
            </div>
          </div>
        </div>

        {/* Right Side: Stats & Description */}
        <div className="detail-right">
          <div className="glass detail-section">
            <h3>Pokedex Entry</h3>
            <p className="flavor-text">{flavorText}</p>
          </div>

          <div className="glass detail-section">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">Species profile</span>
                <h3>About {capitalize(pokemon.name)}</h3>
              </div>
              <span className="species-pill">{genus}</span>
            </div>
            <div className="info-grid">
              <div><span>Generation</span><strong>{formatLabel(species?.generation?.name)}</strong></div>
              <div><span>Habitat</span><strong>{formatLabel(species?.habitat?.name)}</strong></div>
              <div><span>Base experience</span><strong>{pokemon.base_experience ?? "Unknown"}</strong></div>
              <div><span>Capture rate</span><strong>{formatPercent(species?.capture_rate)}</strong></div>
            </div>
          </div>

          <div className="glass detail-section">
            <h3>Base Stats</h3>
            <div className="stats-container">
              {pokemon.stats.map(s => (
                <StatBar 
                  key={s.stat.name}
                  name={s.stat.name}
                  value={s.base_stat}
                  max={255}
                />
              ))}
            </div>
          </div>
          
          <div className="glass detail-section">
            <h3>Abilities</h3>
            <div className="abilities-container">
              {pokemon.abilities.map(a => (
                <div key={a.ability.name} className="ability-badge">
                  {capitalize(a.ability.name)}
                  {a.is_hidden && <span className="hidden-tag">Hidden</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-dual-grid">
            <div className="glass detail-section compact-section">
              <h3>Training</h3>
              <div className="data-list">
                <div><span>Growth rate</span><strong>{formatLabel(species?.growth_rate?.name)}</strong></div>
                <div><span>Base happiness</span><strong>{species?.base_happiness ?? "Unknown"}</strong></div>
                <div><span>Effort yield</span><strong>{pokemon.stats.filter(stat => stat.effort > 0).map(stat => `${formatLabel(stat.stat.name)} +${stat.effort}`).join(", ") || "None"}</strong></div>
              </div>
            </div>
            <div className="glass detail-section compact-section">
              <h3>Breeding</h3>
              <div className="data-list">
                <div><span>Egg groups</span><strong>{species?.egg_groups?.map(group => formatLabel(group.name)).join(", ") || "Unknown"}</strong></div>
                <div><span>Gender ratio</span><strong>{species?.gender_rate === -1 ? "Genderless" : `${((8 - species.gender_rate) / 8) * 100}% male`}</strong></div>
                <div><span>Hatch cycles</span><strong>{species?.hatch_counter ?? "Unknown"}</strong></div>
              </div>
            </div>
          </div>

          {evolutionChain.length > 1 && (
            <div className="glass detail-section">
              <h3>Evolution chain</h3>
              <div className="evolution-chain">
                {evolutionChain.map((evolution, index) => (
                  <div className="evolution-step" key={evolution.name}>
                    <Link to={`/pokemon/${evolution.name}`} className="evolution-link">
                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.id}.png`} alt={evolution.name} />
                      <span>{capitalize(evolution.name)}</span>
                    </Link>
                    {index < evolutionChain.length - 1 && <ChevronRight size={18} className="evolution-arrow" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass detail-section">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">Level-up moves</span>
                <h3>Learnset snapshot</h3>
              </div>
              <span className="moves-count">{pokemon.moves.length} total moves</span>
            </div>
            <div className="move-list">
              {learnableMoves.map(move => (
                <span key={move.move.name} className="move-chip">{formatLabel(move.move.name)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
