import React, { useEffect, useState } from 'react';

export default function StatBar({ name, value, max = 255 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate the bar width on mount
    const timeout = setTimeout(() => {
      setWidth((value / max) * 100);
    }, 100);
    return () => clearTimeout(timeout);
  }, [value, max]);

  // Map stat names to more readable formats
  const formatStatName = (name) => {
    const map = {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SpA',
      'special-defense': 'SpD',
      speed: 'SPD',
    };
    return map[name] || name.toUpperCase();
  };

  // Color based on value (red for low, green for high, etc.)
  let color = '#ff4b4b'; // red
  if (value > 60) color = '#f7d02c'; // yellow
  if (value > 90) color = '#7ac74c'; // green
  if (value > 120) color = '#6390f0'; // blue

  return (
    <div className="stat-bar-container">
      <span className="stat-name">{formatStatName(name)}</span>
      <span className="stat-value">{value.toString().padStart(3, '0')}</span>
      <div className="stat-bar-bg">
        <div 
          className="stat-bar-fill" 
          style={{ 
            width: `${width}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`
          }}
        ></div>
      </div>
    </div>
  );
}
