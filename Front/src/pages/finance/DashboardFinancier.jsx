import React, { useRef } from 'react';
import jsPDF from 'jspdf';
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

  // Export PDF
  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    
    const element = dashboardRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`dashboard-financier-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="db" ref={dashboardRef}>
      
      {/* HEADER WITH ACTIONS */}
      <header className="db-header">
        <div>
          <h1>📊 Tableau de bord financier</h1>
          <p>Suivi des recettes et dépenses - Mise à jour {new Date().toLocaleDateString('fr-TN')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-pdf" onClick={exportToPDF}>
            📄 Télécharger PDF
          </button>
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
      
      {/* FOOTER for PDF */}
      <div className="pdf-footer" style={{ display: 'none' }}>
        <p>Généré le {new Date().toLocaleString('fr-TN')} - Dashboard Financier</p>
      </div>
      
    </div>
  );
};

export default DashboardFinancier;