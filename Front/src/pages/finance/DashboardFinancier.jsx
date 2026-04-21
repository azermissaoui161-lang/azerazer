import React from 'react';
import KpiEvolutionRecettes from './components/KpiEvolutionRecettes';
import KpiRecetteDepense from './components/KpiRecetteDepense';
import './DashboardFinancier.css';

const DashboardFinancier = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord financier</h1>
        <p>Période : Janvier – Août 2024</p>
      </div>

      <div className="dashboard-grid">

        <div className="card">
          <div className="card-title">
            <span className="card-title-accent" />
            Évolution de la recette mensuelle
          </div>
          <div className="chart-container">
            <KpiEvolutionRecettes />
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span className="card-title-accent" />
            Recettes vs dépenses
          </div>
          <div className="chart-container">
            <KpiRecetteDepense />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardFinancier;