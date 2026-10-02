import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { Gamepad2, Heart, Moon, Sun, Users } from "lucide-react";
import Home from "./pages/Home.jsx";
import PokemonDetail from "./pages/PokemonDetail.jsx";
import Minigame from "./pages/Minigame.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import Favorites from "./pages/Favorites.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";

function App() {
  const [isLightTheme, setIsLightTheme] = useState(() => {
    return localStorage.getItem("pokedex-theme") === "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = isLightTheme ? "light" : "dark";
    localStorage.setItem("pokedex-theme", isLightTheme ? "light" : "dark");
  }, [isLightTheme]);

  return (
    <FavoritesProvider>
      <HashRouter>
        <div className="app-container">
        <header className="navbar glass">
          <Link to="/" className="brand-lockup">
            <h1>
              Poké<span>Dex</span>
            </h1>
          </Link>
          <div className="nav-links">
            <Link to="/favorites" className="nav-btn nav-favorites-btn">
              <Heart size={18} />
              Favorites
            </Link>
            <Link to="/team" className="nav-btn nav-team-btn">
              <Users size={20} />
              Team Builder
            </Link>
            <Link to="/game" className="nav-btn nav-game-btn">
              <Gamepad2 size={20} />
              Mini-game
            </Link>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setIsLightTheme(theme => !theme)}
              aria-label={`Switch to ${isLightTheme ? "dark" : "light"} theme`}
              title={`Switch to ${isLightTheme ? "dark" : "light"} theme`}
            >
              {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:name" element={<PokemonDetail />} />
            <Route path="/game" element={<Minigame />} />
            <Route path="/team" element={<TeamBuilder />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
        </div>
      </HashRouter>
    </FavoritesProvider>
  );
}

export default App;
