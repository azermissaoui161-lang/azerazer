import React from 'react';
import KpiCommandeParMois from './components/KpiCommandeParMois';
import KpiTotalCommandeParClient from './components/KpiTotalCommandeParClient';
import KpiFactureStatus from './components/KpiFactureStatus';
import KpiClientFidele from './components/KpiClientFidele';
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
        <KpiCommandeParMois />
      </div>

      <div className="row-2">
        <div className="card">
          <KpiFactureStatus />
        </div>

        <div className="card">
          <KpiTotalCommandeParClient />
        </div>
      </div>

      <div className="card">
        <KpiClientFidele />
      </div>

    </div>

  </div>
);

export default DashboardFacturation;