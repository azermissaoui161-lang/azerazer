import React, { useEffect, useState, useCallback, useRef } from 'react';
import CommandeParMois from './components/CommandeParMois';
import TotalCommandeParClient from './components/TotalCommandeParClient';
import FactureStatus from './components/FactureStatus';
import ClientFidele from './components/ClientFidele';
import KpiFacture from './components/KpiFacture';
import dashboardFacturationService from '../../services/DashboardFacturationService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './DashboardFacturation.css';

const DashboardFacturation = () => {
  const dashboardRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadDashboard = useCallback(async (period) => {
    try {
      const response = await dashboardFacturationService.getDashboard(period);
      setDashboard(response.data || response);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Impossible de charger le dashboard facturation'));
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
      link.download = `dashboard-facturation-${Date.now()}.png`;
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

      pdf.save(`dashboard-facturation-${Date.now()}.pdf`);

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

  const commandes = dashboard?.commandesParMois || [];
  const factureStatus = dashboard?.factureStatus || [];

  return (
    <div className="df" ref={dashboardRef}>
      <header className="df-header">
        <div>
          <h1>Tableau de bord facturation</h1>
          <p>Suivi des performances et de la tresorerie</p>
        </div>
        
        <div className="df-controls">
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
              {exporting ? '⏳ Export...' : ' Exporter'}
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

          <span className="df-badge">Tresorerie</span>
        </div>
      </header>

      {errorMessage && (
        <div className="card" style={{ color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      <div className="card">
        <KpiFacture kpi={dashboard?.kpi} />
      </div>

      <div className="df-grid">
        <div className="card">
          <CommandeParMois
            labels={commandes.map((item) => item.label)}
            dataCommandes={commandes.map((item) => Number(item.count || 0))}
          />
        </div>

        <div className="row-2">
          <div className="card">
            <FactureStatus
              labels={factureStatus.map((item) => item.label)}
              dataPaye={factureStatus.map((item) => Number(item.paye || 0))}
              dataImpaye={factureStatus.map((item) => Number(item.impaye || 0))}
            />
          </div>

          <div className="card">
            <TotalCommandeParClient data={dashboard?.topCustomers} />
          </div>
        </div>

        <div className="card">
          <ClientFidele data={dashboard?.loyalCustomers} />
        </div>
      </div>
    </div>
  );
};

export default DashboardFacturation;