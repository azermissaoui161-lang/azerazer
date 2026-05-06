import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart';
import KpiPage from './components/KpiPage';
import TopFournisseursChart from './components/TopFournisseursChart';
import './DashboardStock.css';

// ─── Data ─────────────────────────────────────────────────────────────────────


const rankClass = ['rank-1', 'rank-2', 'rank-3'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const CardHeader = ({ icon, color, title }) => (
  <div className="card-header">
    <div className={`card-icon ${color}`}>{icon}</div>
    <div><h3 className="card-title">{title}</h3></div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardStock = () => {
  const dashboardRef = useRef(null);

  return (
    <div className="db" ref={dashboardRef}>

      {/* ── HEADER ── */}
      <header className="db-header">
        <div>
          <h1>Analytique de stock</h1>
          <p>Suivi des mouvements et analyse des ventes</p>
        </div>

        {/* ❌ bouton supprimé ici */}
        <div className="db-header-actions">
          <span className="db-badge">● Live</span>
        </div>
      </header>

      {/* ── KPI ── */}
      <KpiPage />

      {/* ── GRID ── */}
      <div className="db-grid">

        <div className="card full">
          <CardHeader icon="" color="green" title="Mouvements mensuels" />
          <div className="card-body">
            <MovementLineChart />
          </div>
        </div>

        <div className="card">
          <CardHeader icon="" color="blue" title="Répartition ventes" />
          <div className="card-body center">
            <TopProduitsChart dataVentes={[300, 100, 50, 80]} />
          </div>
        </div>

        <div className="card">
          <CardHeader icon="" color="purple" title="Stock catégories" />
          <div className="card-body center">
            <CategoriPieChart />
          </div>
        </div>

        

      </div>

      {/* ── TOP FOURNISSEURS ── */}
      <div className="card full">
        <CardHeader icon="" color="blue" title="Top fournisseurs par produit" />
        <div className="card-body">
          <TopFournisseursChart />
        </div>
      </div>

    </div>
  );
};

export default DashboardStock;