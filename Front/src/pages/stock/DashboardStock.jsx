import React, { useEffect, useRef, useState } from 'react';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart';
import KpiPage from './components/KpiPage';
import TopFournisseursChart from './components/TopFournisseursChart';
import dashboardStockService from '../../services/DashboardStockService';
import { extractApiErrorMessage } from '../../utils/frontendApiAdapters';
import './DashboardStock.css';

const CardHeader = ({ icon, color, title }) => (
  <div className="card-header">
    <div className={`card-icon ${color}`}>{icon}</div>
    <div><h3 className="card-title">{title}</h3></div>
  </div>
);

const DashboardStock = () => {
  const dashboardRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');



const [period, setPeriod] = useState('30'); 

  

const loadDashboard = async (selectedPeriod) => {
  try {
    // Nab'athou el period k-argument lel service
    const response = await dashboardStockService.getDashboard(selectedPeriod);
    setDashboard(response.data || response);
    setErrorMessage('');
  } catch (error) {
    setErrorMessage(extractApiErrorMessage(error, 'Impossible de charger le dashboard stock'));
  }
};

// 2. Un SEUL useEffect elli i-t-lanci kol ma t-t-badel el period
// W b-ma ennou el period 3andou valeur initiale (ex: '30'), 
// bech i-t-lanci automatiquement ki t-7al el page (on mount).
useEffect(() => {
  loadDashboard(period);
}, [period]);

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
          {/* 4. El Menu mta' el Période */}
          <select 
            className="period-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">Cette année</option>
          </select>
          <span className="db-badge">Live</span>
        </div>
      </header>

      {errorMessage && (
        <div className="card" style={{ maxWidth: 1000, margin: '0 auto 20px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      <KpiPage kpi={dashboard?.kpi} />

      <div className="db-grid">
        <div className="card full">
          <CardHeader icon="" color="green" title="Mouvements mensuels" />
          <div className="card-body">
            <MovementLineChart
              labels={movements.map((item) => item.label)}
              dataEntree={movements.map((item) => Number(item.entree || 0))}
              dataSortie={movements.map((item) => Number(item.sortie || 0))}
            />
          </div>
        </div>

        <div className="card">
          <CardHeader icon="" color="blue" title="Top produits" />
          <div className="card-body center">
            <TopProduitsChart
              labels={topProducts.map((item) => item.name)}
              dataVentes={topProducts.map((item) => Number(item.stock || item.value || 0))}
            />
          </div>
        </div>

        <div className="card">
          <CardHeader icon="" color="purple" title="Stock categories" />
          <div className="card-body center">
            <CategoriPieChart categoriesData={dashboard?.categories} />
          </div>
        </div>
      </div>

      <div className="card full">
        <CardHeader icon="" color="blue" title="Top fournisseurs par valeur stock" />
        <div className="card-body">
          <TopFournisseursChart data={dashboard?.topFournisseurs} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStock;
