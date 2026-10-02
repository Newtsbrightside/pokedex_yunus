import React from 'react';

export default function TypeBadge({ type }) {
  const typeName = type.toLowerCase();
  return (
    <span 
      className="type-badge" 
      style={{
        backgroundColor: `var(--type-${typeName}, #777)`,
        boxShadow: `0 0 10px var(--type-${typeName}, #777)`
      }}
    >
      {type}
    </span>
  );
}
