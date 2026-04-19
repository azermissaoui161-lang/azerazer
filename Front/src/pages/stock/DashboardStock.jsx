import React from 'react';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart'; 
import './DashboardStock.css';

const DashboardStock = () => {
  const topProduits = [
    { id: 1, name: 'Produit A', ventes: 300, CA: '1500 DT' },
    { id: 2, name: 'Produit B', ventes: 100, CA: '800 DT' },
    { id: 3, name: 'Produit C', ventes: 50, CA: '400 DT' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Analytique de Stock</h1>
        <p>Suivi des mouvements et analyse des ventes</p>
      </header>

      <div className="dashboard-grid">
        
        {/* --- Section Line Chart --- */}
        <div className="card full-width">
          <h3>📈 Évolution Mensuelle des Mouvements</h3>
          <div className="chart-container">
             <MovementLineChart />
          </div>
        </div>

        {/* --- KPI Grid (Section taht el khatt) --- */}
        <div className="kpi-row">
          
          <div className="card">
            <h3>📊 Répartition des Ventes</h3>
            <div className="chart-container-sghir">
               <TopProduitsChart dataVentes={[300, 100, 50, 80]} />
            </div>
          </div>

          <div className="card">
            <h3>📁 Stock par Catégorie</h3>
            <div className="chart-container-sghir">
               <CategoriPieChart /> 
            </div>
          </div>

        </div>

        {/* --- EL TABLEAU (TOP PRODUITS) --- */}
        <div className="card full-width">
          <h3>🏆 Top Produits les plus vendus</h3>
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité Vendue</th>
                  <th>Chiffre d'Affaires</th>
                </tr>
              </thead>
              <tbody>
                {topProduits.map(p => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.name}</td>
                    <td className="text-primary">{p.ventes}</td>
                    <td>{p.CA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStock;