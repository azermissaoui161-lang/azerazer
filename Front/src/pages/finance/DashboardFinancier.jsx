import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

import KpiFinance from './components/KpiFinance';
import KpiEvolutionRecettes from './components/KpiEvolutionRecettes';
import KpiRecetteDepense from './components/KpiRecetteDepense';
import TypeDepenses from './components/TypeDepenses';

import './DashboardFinancier.css';

// ─── DATA ─────────────────────────────
const FINANCE_KPI = {
  chiffreAffaire: 75000,
  depenses: 42000,
  transactions: 128,
};

const recettesMensuelles = [
  { mois: "Jan", valeur: 5000 },
  { mois: "Fév", valeur: 7000 },
  { mois: "Mar", valeur: 9000 },
  { mois: "Avr", valeur: 8500 },
  { mois: "Mai", valeur: 11000 },
  { mois: "Juin", valeur: 13000 },
];

// ─── MAIN ─────────────────────────────
const DashboardFinancier = () => {
  const dashboardRef = useRef(null);

  return (
    <div className="db" ref={dashboardRef}>
      
      {/* HEADER (NO BUTTON) */}
      <header className="db-header">
        <div>
          <h1>📊 Tableau de bord financier</h1>
          <p>
            Suivi des recettes et dépenses - Mise à jour{" "}
            {new Date().toLocaleDateString('fr-TN')}
          </p>
        </div>
      </header>

      {/* KPI */}
      <KpiFinance
        chiffreAffaire={FINANCE_KPI.chiffreAffaire}
        depenses={FINANCE_KPI.depenses}
        transactions={FINANCE_KPI.transactions}
      />

      {/* GRID */}
      <div className="db-grid">

        {/* EVOLUTION */}
        <div className="card full">
          <div className="card-title">
            📈 Évolution des recettes
          </div>
          <div className="chart-container">
            <KpiEvolutionRecettes data={recettesMensuelles} />
          </div>
        </div>

        {/* RECETTES VS DEPENSES */}
        <div className="card">
          <div className="card-title">
            ⚖️ Recettes vs Dépenses
          </div>
          <div className="chart-container">
            <KpiRecetteDepense
              recette={FINANCE_KPI.chiffreAffaire}
              depense={FINANCE_KPI.depenses}
            />
          </div>
        </div>

        {/* TYPE DEPENSES */}
        <div className="card">
          <div className="card-title">
            🥧 Types de dépenses
          </div>
          <div className="chart-container">
            <TypeDepenses />
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardFinancier;