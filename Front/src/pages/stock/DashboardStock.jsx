import React, { useEffect, useRef, useState } from 'react';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart';
import KpiPage from './components/KpiPage';
import TopFournisseursChart from './components/TopFournisseursChart';
import dashboardStockService from '../../services/DashboardStockService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';
import './DashboardStock.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* Header card WITHOUT ICON */
const CardHeader = ({ color, title }) => (
  <div className="card-header">
    <h3 className="card-title">{title}</h3>
  </div>
);

const DashboardStock = () => {
  const dashboardRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [period, setPeriod] = useState('30');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadDashboard = async (selectedPeriod) => {
    try {
      const response = await dashboardStockService.getDashboard(selectedPeriod);
      setDashboard(response.data || response);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error,'Impossible de charger le dashboard stock')
      );
    }
  };

  useEffect(() => {
    loadDashboard(period);
  }, [period]);

  // PNG EXPORT
  const exportAsPNG = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);

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
      link.download = `dashboard-stock-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

    } catch {
      alert("Erreur export PNG");
    }

    setExporting(false);
    setExportMenuOpen(false);
  };

  // PDF EXPORT
  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);

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

      pdf.save(`dashboard-stock-${Date.now()}.pdf`);

    } catch {
      alert("Erreur export PDF");
    }

    setExporting(false);
    setExportMenuOpen(false);
  };

  const movements = dashboard?.monthlyMovements || [];
  const topProducts = dashboard?.topProducts || [];

  return (
    <div className="db" ref={dashboardRef}>
      <header className="db-header">
        <div>
          <h1>Analytique de stock</h1>
          <p>Suivi des mouvements et analyse des produits</p>
        </div>

        <div className="db-header-actions">
          <select
            className="period-select"
            value={period}
            onChange={(e)=>setPeriod(e.target.value)}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">Cette année</option>
          </select>

          {/* EXPORT BUTTON WITHOUT ICON */}
<div className="export-menu-container">

  <button
    className="export-btn"
    onClick={() => setExportMenuOpen(prev => !prev)}
    disabled={exporting}
  >
    {exporting ? 'Export en cours...' : 'Exporter'}
  </button>

  {exportMenuOpen && (
    <div className="export-dropdown">

      <button
        type="button"
        onClick={exportAsPNG}
        disabled={exporting}
      >
        PNG
      </button>

      <button
        type="button"
        onClick={exportAsPDF}
        disabled={exporting}
      >
        PDF
      </button>

    </div>
  )}

</div>

          <span className="db-badge">Live</span>
        </div>
      </header>

      {errorMessage && (
        <div className="card" style={{ maxWidth:1000, margin:'0 auto 20px', color:'#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      <KpiPage kpi={dashboard?.kpi} />

      <div className="db-grid">
        <div className="card full">
          <CardHeader title="Mouvements mensuels" />
          <div className="card-body">
            <MovementLineChart
              labels={movements.map(i=>i.label)}
              dataEntree={movements.map(i=>Number(i.entree||0))}
              dataSortie={movements.map(i=>Number(i.sortie||0))}
            />
          </div>
        </div>

        <div className="card">
          <CardHeader title="Top produits" />
          <div className="card-body center">
            <TopProduitsChart
              labels={topProducts.map(i=>i.name)}
              dataVentes={topProducts.map(i=>Number(i.stock||i.value||0))}
            />
          </div>
        </div>

        <div className="card">
          <CardHeader title="Stock categories" />
          <div className="card-body center">
            <CategoriPieChart categoriesData={dashboard?.categories} />
          </div>
        </div>
      </div>

      <div className="card full">
        <CardHeader title="Top fournisseurs par valeur stock" />
        <div className="card-body">
          <TopFournisseursChart data={dashboard?.topFournisseurs} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStock;