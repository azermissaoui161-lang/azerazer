import React, { useEffect, useRef, useState, useCallback } from 'react';
import KpiFinance from './components/KpiFinance';
import EvolutionRecettes from './components/EvolutionRecettes';
import RecetteDepense from './components/RecetteDepense';
import TypeDepenses from './components/TypeDepenses';
import dashboardFinancierService from '../../services/DashboardFinancierService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './DashboardFinancier.css';

const DashboardFinancier = () => {
  const dashboardRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadDashboard = useCallback(async (period) => {
    try {
      const response = await dashboardFinancierService.getDashboard(period);
      setDashboard(response.data || response);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Impossible de charger le dashboard finance'));
    }
  }, []);

  useEffect(() => {
    loadDashboard(selectedPeriod);
  }, [selectedPeriod, loadDashboard]);

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  // ================= PNG EXPORT =================
  const exportAsPNG = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    setExportMenuOpen(false);

    try {
      document.body.classList.add("pdf-mode");

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY
      });

      document.body.classList.remove("pdf-mode");

      const link = document.createElement("a");
      link.download = `dashboard-financier-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

    } catch (err) {
      console.error("Erreur export PNG:", err);
      alert("Erreur lors de l'export PNG");
    }

    setExporting(false);
  };

  // ================= PDF EXPORT =================
  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    setExportMenuOpen(false);

    try {
      document.body.classList.add("pdf-mode");

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY
      });

      document.body.classList.remove("pdf-mode");

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-financier-${Date.now()}.pdf`);

    } catch (err) {
      console.error("Erreur export PDF:", err);
      alert("Erreur lors de l'export PDF");
    }

    setExporting(false);
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuOpen && !event.target.closest('.export-menu-container')) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [exportMenuOpen]);

  const monthly = dashboard?.monthly || [];
  const labels = monthly.map((item) => item.label);
  const recettes = monthly.map((item) => Number(item.recettes || 0));
  const depenses = monthly.map((item) => Number(item.depenses || 0));
  const net = monthly.map((item) => Number(item.net || 0));

  return (
    <div className="db" ref={dashboardRef}>
      <header className="db-header">
        <div>
          <h1>Tableau de bord financier</h1>
          <p>
            Suivi des recettes et depenses - Mise a jour{' '}
            {new Date().toLocaleDateString('fr-TN')}
          </p>
        </div>

        <div className="db-controls">
          <select 
            className="df-select" 
            value={selectedPeriod} 
            onChange={handlePeriodChange}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">Cette année</option>
          </select>

          {/* Menu d'export */}
          <div className="export-menu-container">
            <button 
              className="export-btn" 
              onClick={() => setExportMenuOpen(!exportMenuOpen)} 
              disabled={exporting}
            >
              {exporting ? ' Export...' : ' Exporter'}
            </button>

            {exportMenuOpen && (
              <div className="export-dropdown">
                <button onClick={exportAsPNG} disabled={exporting}>
                   PNG
                </button>
                <button onClick={exportAsPDF} disabled={exporting}>
                   PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="card" style={{ maxWidth: 1000, margin: '0 auto 20px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      <KpiFinance kpi={dashboard?.kpi} />

      <div className="db-grid">
        <div className="card full">
          <div className="card-title">Evolution des recettes</div>
          <div className="chart-container">
            <EvolutionRecettes labels={labels} dataRecette={recettes} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recettes vs Depenses</div>
          <div className="chart-container">
            <RecetteDepense
              labels={labels}
              dataRecettes={recettes}
              dataDepenses={depenses}
              dataNet={net}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Types de depenses</div>
          <div className="chart-container">
            <TypeDepenses data={dashboard?.depensesByCategory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinancier;