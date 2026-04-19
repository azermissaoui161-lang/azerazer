import React from 'react';
import KpiEvolutionRecettes from './components/KpiEvolutionRecettes';
import KpiRecetteDepense from './components/KpiRecetteDepense';
import './DashboardFinancier.css';

const DashboardFinancier = () => {
  return (
    <div className="dashboard-grid">
      
      {/* Chart 1: Évolution */}
      <div className="card">
        <h3>📈 Évolution du Recette Mensuelle</h3>
        <div className="chart-container">
          <KpiEvolutionRecettes />
        </div>
      </div>

      {/* Chart 2: Comparaison */}
      <div className="card">
        <h3>⚖️ Recettes vs Dépenses</h3>
        <div className="chart-container">
          <KpiRecetteDepense />
        </div>
      </div>

    </div>
  );
};

export default DashboardFinancier;