import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TopProduitsChart from './components/TopProduitsChart';
import MovementLineChart from './components/MovementChart';
import CategoriPieChart from './components/CategoriPieChart';
import './DashboardStock.css';

// ─── Data ────────────────────────────────────────────────────────────────────
const topProduits = [
  { id: 1, name: 'Produit A', ventes: 300, CA: '1 500 DT', pct: 100 },
  { id: 2, name: 'Produit B', ventes: 100, CA: '800 DT',   pct: 33  },
  { id: 3, name: 'Produit C', ventes: 50,  CA: '400 DT',   pct: 17  },
];

const rankClass = ['rank-1', 'rank-2', 'rank-3'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const CardHeader = ({ icon, color, title, sub }) => (
  <div className="card-header">
    <div className={`card-icon ${color}`}>{icon}</div>
    <div>
      <h3 className="card-title">{title}</h3>
      {sub && <p className="card-sub">{sub}</p>}
    </div>
  </div>
);

const DownloadIcon = () => (
  <svg
    width="15" height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className="spin"
    width="15" height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M21 12a9 9 0 1 1-9-9" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardStock = () => {
  const dashboardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f9fb',
      });

      const imgData  = canvas.toDataURL('image/png');
      const imgW     = canvas.width  / 2;
      const imgH     = canvas.height / 2;

      const pdf = new jsPDF({
        orientation: imgW > imgH ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgW, imgH],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      pdf.save('dashboard-stock.pdf');
    } catch (err) {
      console.error('Erreur export PDF :', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="db" ref={dashboardRef}>

      {/* ── HEADER ── */}
      <header className="db-header">
        <div>
          <h1>Analytique de stock</h1>
          <p>Suivi des mouvements et analyse des ventes</p>
        </div>

        <div className="db-header-actions">
          <span className="db-badge">● Live</span>

          <button
            className={`btn-pdf${isExporting ? ' btn-pdf--loading' : ''}`}
            onClick={handleDownloadPDF}
            disabled={isExporting}
            title="Télécharger le dashboard en PDF"
          >
            {isExporting ? <SpinnerIcon /> : <DownloadIcon />}
            {isExporting ? 'Génération…' : 'Télécharger PDF'}
          </button>
        </div>
      </header>

      {/* ── GRID ── */}
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

        {/* BAR / CATEGORY CHART */}
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