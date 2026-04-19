import React from 'react';
import KpiCommandeParMois from './components/KpiCommandeParMois';
import KpiTotalCommandeParClient from './components/KpiTotalCommandeParClient';
import KpiFactureStatus from './components/KpiFactureStatus';
import './DashboardFacturation.css';

const DashboardFacturation = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Tableau de Bord Facturation</h1>
        <p>Suivi des performances et de la trésorerie</p>
      </header>

      <div className="dashboard-grid">
        
        {/* KPI 1: Evolution Mensuelle (Full Width) */}
        <div className="card full-width">
          <h3> Évolution Mensuelle des Commandes</h3>
          <div className="chart-container">
            <KpiCommandeParMois />
          </div>
        </div>

        {/* KPI 2: Payé vs Impayé */}
        <div className="card">
          <h3> Payé vs Impayé (Mensuel)</h3>
          <div className="chart-container">
            <KpiFactureStatus />
          </div>
        </div>

        {/* KPI 3: Analyse par Client */}
        <div className="card">
          <h3> Analyse des Commandes par Client</h3>
          
            <KpiTotalCommandeParClient />
            
          
        </div>

      </div>
    </div>
    
  );
};

export default DashboardFacturation;