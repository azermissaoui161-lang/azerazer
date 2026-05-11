import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await dashboardFacturationService.getDashboard();
        setDashboard(response.data || response);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(extractApiErrorMessage(error, 'Impossible de charger le dashboard facturation'));
      }
    };

    loadDashboard();
  }, []);

  const commandes = dashboard?.commandesParMois || [];
  const factureStatus = dashboard?.factureStatus || [];

  return (
    <div className="df">
      <header className="df-header">
        <div>
          <h1>Tableau de bord facturation</h1>
          <p>Suivi des performances et de la tresorerie</p>
        </div>
        <span className="df-badge">Tresorerie</span>
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
