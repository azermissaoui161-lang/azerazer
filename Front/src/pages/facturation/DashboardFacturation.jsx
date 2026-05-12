import React, { useEffect, useState, useCallback } from 'react';
import CommandeParMois from './components/CommandeParMois';
import TotalCommandeParClient from './components/TotalCommandeParClient';
import FactureStatus from './components/FactureStatus';
import ClientFidele from './components/ClientFidele';
import KpiFacture from './components/KpiFacture';
import dashboardFacturationService from '../../services/DashboardFacturationService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';

import './DashboardFacturation.css';

const DashboardFacturation = () => {
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // Periode par défaut

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

  const commandes = dashboard?.commandesParMois || [];
  const factureStatus = dashboard?.factureStatus || [];

  return (
    <div className="df">
      <header className="df-header">
        <div>
          <h1>Tableau de bord facturation</h1>
          <p>Suivi des performances et de la tresorerie</p>
        </div>
        
        {/* El Menu Jdid houni */}
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