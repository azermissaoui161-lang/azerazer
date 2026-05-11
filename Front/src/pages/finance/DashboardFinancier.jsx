import React, { useEffect, useRef, useState } from 'react';

import KpiFinance from './components/KpiFinance';
import EvolutionRecettes from './components/EvolutionRecettes';
import RecetteDepense from './components/RecetteDepense';
import TypeDepenses from './components/TypeDepenses';
import dashboardFinancierService from '../../services/DashboardFinancierService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';

import './DashboardFinancier.css';

const DashboardFinancier = () => {
  const dashboardRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await dashboardFinancierService.getDashboard();
        setDashboard(response.data || response);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(extractApiErrorMessage(error, 'Impossible de charger le dashboard finance'));
      }
    };

    loadDashboard();
  }, []);

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
