import React from 'react';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart';
import './DashboardStock.css';

// Data
const topProduits = [
  { id: 1, name: 'Produit A', ventes: 300, CA: '1 500 DT', pct: 100 },
  { id: 2, name: 'Produit B', ventes: 100, CA: '800 DT', pct: 33 },
  { id: 3, name: 'Produit C', ventes: 50, CA: '400 DT', pct: 17 },
];

const rankClass = ['rank-1', 'rank-2', 'rank-3'];

// Header Card
const CardHeader = ({ icon, color, title, sub }) => (
  <div className="card-header">
    <div className={`card-icon ${color}`}>{icon}</div>
    <div>
      <h3 className="card-title">{title}</h3>
      {sub && <p className="card-sub">{sub}</p>}
    </div>
  </div>
);

const DashboardStock = () => {
  return (
    <div className="db">

      {/* HEADER */}
      <header className="db-header">
        <div>
          <h1>Analytique de stock</h1>
          <p>Suivi des mouvements et analyse des ventes</p>
        </div>
        <span className="db-badge">● Live</span>
      </header>

      {/* GRID */}
      <div className="db-grid">

        {/* LINE CHART */}
        <div className="card full">
          <CardHeader icon="📈" color="green" title="Évolution mensuelle" />
          <div className="card-body">
            <MovementLineChart />
          </div>
        </div>

        {/* PIE CHART */}
        <div className="card">
          <CardHeader icon="📊" color="blue" title="Répartition ventes" />
          <div className="card-body center">
            <TopProduitsChart dataVentes={[300, 100, 50, 80]} />
          </div>
        </div>

        {/* BAR CHART */}
        <div className="card">
          <CardHeader icon="📁" color="purple" title="Stock catégories" />
          <div className="card-body center">
            <CategoriPieChart />
          </div>
        </div>

        {/* TABLE */}
        <div className="card full">
          <CardHeader icon="🏆" color="amber" title="Top produits" />

          <div className="card-body">
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Progression</th>
                    <th>CA</th>
                  </tr>
                </thead>

                <tbody>
                  {topProduits.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <span className={`badge-rank ${rankClass[i]}`}>
                          {i + 1}
                        </span>
                      </td>

                      <td className="td-name">{p.name}</td>
                      <td className="td-ventes">{p.ventes}</td>

                      <td>
                        <div className="prog-bar">
                          <div
                            className="prog-fill"
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="td-ca">{p.CA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStock;