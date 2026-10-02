import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteNames, setFavoriteNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pokedex-favorites")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pokedex-favorites", JSON.stringify(favoriteNames));
  }, [favoriteNames]);

  const value = useMemo(() => ({
    favoriteNames,
    isFavorite: name => favoriteNames.includes(name),
    toggleFavorite: name => {
      setFavoriteNames(current => current.includes(name)
        ? current.filter(favorite => favorite !== name)
        : [...current, name]
      );
    }
  }), [favoriteNames]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
