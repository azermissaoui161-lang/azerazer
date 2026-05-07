import React from 'react';
import CommandeParMois from './components/CommandeParMois';
import TotalCommandeParClient from './components/TotalCommandeParClient';
import FactureStatus from './components/FactureStatus';
import ClientFidele from './components/ClientFidele';
import KpiFacture from './components/KpiFacture'; // ✅ AJOUT

import './DashboardFacturation.css';

// ─── Dashboard ───────────────────────────────────────────────────────────────
const DashboardFacturation = () => (
  <div className="df">

    <header className="df-header">
      <div>
        <h1>Tableau de bord facturation</h1>
        <p>Suivi des performances et de la trésorerie</p>
      </div>
      <span className="df-badge">Trésorerie</span>
    </header>

    {/* ── KPI GLOBAL (comme stock KpiPage) ── */}
    <div className="card">
      <KpiFacture />
    </div>

    {/* ── Graphiques ── */}
    <div className="df-grid">

      <div className="card">
        <CommandeParMois />
      </div>

      <div className="row-2">
        <div className="card">
          <FactureStatus />
        </div>

        <div className="card">
          <TotalCommandeParClient />
        </div>
      </div>

      <div className="card">
        <ClientFidele />
      </div>

    </div>

  </div>
);

export default DashboardFacturation;