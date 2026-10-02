import { useState, useEffect } from "react";

export default function TeamAnalysis({ team }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function analyzeTeam() {
      setIsLoading(true);
      try {
        // Collect all unique types across the team
        const uniqueTypes = new Set();
        team.forEach(member => {
          member.types.forEach(t => uniqueTypes.add(t));
        });

        // Fetch type data for all unique types
        const typeDataMap = {};
        const promises = Array.from(uniqueTypes).map(async (t) => {
          const res = await fetch(`https://pokeapi.co/api/v2/type/${t}`);
          const data = await res.json();
          typeDataMap[t] = data.damage_relations;
        });

        await Promise.all(promises);

        // Aggregate Weaknesses (Defensive)
        // For each member, calculate their individual weaknesses to all 18 types
        const teamWeaknesses = {};
        const teamResistances = {};
        const teamImmunities = {};

        // Aggregate Strengths (Offensive)
        // Types the team can hit for super effective damage
        const offensiveCoverage = new Set();

        const allTypes = [
          "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel",
          "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"
        ];

        allTypes.forEach(t => {
          teamWeaknesses[t] = 0;
          teamResistances[t] = 0;
          teamImmunities[t] = 0;
        });

        team.forEach(member => {
          const type1 = member.types[0];
          const type2 = member.types[1];

          allTypes.forEach(attackingType => {
             let multiplier = 1;
             
             // Check multiplier against type1
             if (typeDataMap[type1]) {
                const relations = typeDataMap[type1];
                if (relations.double_damage_from.find(x => x.name === attackingType)) multiplier *= 2;
                if (relations.half_damage_from.find(x => x.name === attackingType)) multiplier *= 0.5;
                if (relations.no_damage_from.find(x => x.name === attackingType)) multiplier *= 0;
             }

             // Check multiplier against type2
             if (type2 && typeDataMap[type2]) {
                const relations = typeDataMap[type2];
                if (relations.double_damage_from.find(x => x.name === attackingType)) multiplier *= 2;
                if (relations.half_damage_from.find(x => x.name === attackingType)) multiplier *= 0.5;
                if (relations.no_damage_from.find(x => x.name === attackingType)) multiplier *= 0;
             }

             if (multiplier > 1) teamWeaknesses[attackingType]++;
             else if (multiplier === 0) teamImmunities[attackingType]++;
             else if (multiplier < 1) teamResistances[attackingType]++;
          });

          // Offensive calculation
          if (typeDataMap[type1]) {
             typeDataMap[type1].double_damage_to.forEach(x => offensiveCoverage.add(x.name));
          }
          if (type2 && typeDataMap[type2]) {
             typeDataMap[type2].double_damage_to.forEach(x => offensiveCoverage.add(x.name));
          }
        });

        // Identify glaring weaknesses (3 or more weak, 0 resists/immune)
        const glaringWeaknesses = [];
        allTypes.forEach(t => {
           if (teamWeaknesses[t] >= 2 && teamResistances[t] === 0 && teamImmunities[t] === 0) {
              glaringWeaknesses.push(t);
           }
        });

        // Identify lacking coverage (types you can't hit super effectively)
        const lackingCoverage = allTypes.filter(t => !offensiveCoverage.has(t) && t !== 'normal');

        setAnalysisData({
          weaknesses: teamWeaknesses,
          resistances: teamResistances,
          immunities: teamImmunities,
          glaringWeaknesses,
          lackingCoverage,
          offensiveCoverage: Array.from(offensiveCoverage)
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (team.length > 0) {
      analyzeTeam();
    }
  }, [team]);

  if (isLoading || !analysisData) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="team-analysis glass">
      <h3>Team Analysis</h3>

      <div className="analysis-grid">
        <div className="analysis-card warning-card">
          <h4>🔴 Glaring Weaknesses</h4>
          <p className="analysis-desc">Types that hurt multiple team members and are unresisted.</p>
          <div className="type-list">
            {analysisData.glaringWeaknesses.length > 0 ? (
              analysisData.glaringWeaknesses.map(t => (
                <span key={t} className="tiny-type-badge" style={{ backgroundColor: `var(--type-${t})` }}>{t}</span>
              ))
            ) : (
              <span className="success-text">None! Your team has good defensive synergy.</span>
            )}
          </div>
        </div>

        <div className="analysis-card info-card">
          <h4>🟡 Lacking Offensive Coverage</h4>
          <p className="analysis-desc">Types your team cannot hit for Super Effective damage.</p>
          <div className="type-list">
            {analysisData.lackingCoverage.length > 0 ? (
              analysisData.lackingCoverage.map(t => (
                <span key={t} className="tiny-type-badge" style={{ backgroundColor: `var(--type-${t})` }}>{t}</span>
              ))
            ) : (
              <span className="success-text">None! You can hit every type super effectively.</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="detailed-breakdown">
         <h4>Team Defensive Breakdown</h4>
         <div className="defensive-table">
            {Object.entries(analysisData.weaknesses)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([type, weakCount]) => (
                <div key={type} className="defensive-row">
                   <span className="tiny-type-badge" style={{ backgroundColor: `var(--type-${type})` }}>{type}</span>
                   <span className="def-stats">
                      {weakCount} weak • {analysisData.resistances[type]} resists • {analysisData.immunities[type]} immune
                   </span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
