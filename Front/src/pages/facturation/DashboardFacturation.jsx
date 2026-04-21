import React from 'react';
import KpiCommandeParMois    from './components/KpiCommandeParMois';
import KpiTotalCommandeParClient from './components/KpiTotalCommandeParClient';
import KpiFactureStatus      from './components/KpiFactureStatus';
import './DashboardFacturation.css';

const DashboardFacturation = () => (
  <div className="df">

    <header className="df-header">
      <div>
        <h1>Tableau de bord facturation</h1>
        <p>Suivi des performances et de la trésorerie</p>
      </div>
      <span className="df-badge">Trésorerie</span>
    </header>

    <div className="df-grid">

      {/* Évolution mensuelle — pleine largeur */}
      <div className="card">
        <KpiCommandeParMois />
      </div>

      {/* Factures + Clients — 2 colonnes */}
      <div className="row-2">
        <div className="card">
          <KpiFactureStatus />
        </div>
        <div className="card">
          <KpiTotalCommandeParClient />
        </div>
      </div>

    </div>
  </div>
);

export default DashboardFacturation;