// components/KpiPage.jsx

import React, { useEffect, useState } from 'react';

export const KpiCard = ({
  label,
  value,
  accent,
  note,
  trend,
  trendUp
}) => (

  <div className="ds-kpi-card" style={{ '--accent': accent }}>

    <span className="ds-kpi-label">
      {label}
    </span>

    <div className="ds-kpi-bottom">

      <span className="ds-kpi-value">
        {value.toLocaleString('fr-FR')}
      </span>

      {trend && (
        <span className={`ds-kpi-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      )}

    </div>

    {note && (
      <span className="ds-kpi-note">
        {note}
      </span>
    )}

  </div>
);

const KpiPage = () => {

  const [kpi, setKpi] = useState({
    produitsEnStock: 0,
    produitsEnRupture: 0,
    nombreCategories: 0,
    totalMouvements: 0,
    entreeMouvements: 0,
    sortieMouvements: 0,
    totalFournisseurs: 0,
  });

  useEffect(() => {

    fetch('http://localhost:5000/api/dashboard/stock/kpi-stock')
      .then(res => res.json())
      .then(data => {
        setKpi(data);
      })
      .catch(err => {
        console.error(err);
      });

  }, []);

  return (
    <div className="kpi-page">

      <div className="ds-kpi-row">

        {/* ── KPI 1 : Stock ── */}
        <div className="ds-kpi-card" style={{ '--accent': '#10b981' }}>

          <span className="ds-kpi-label">
            Stock total
          </span>

          <div className="ds-kpi-bottom">

            <span className="ds-kpi-value">
              {(kpi.produitsEnStock + kpi.produitsEnRupture).toLocaleString('fr-FR')}
            </span>

            <span className="ds-kpi-note">
              produits
            </span>

          </div>

          <div className="ds-kpi-split">

            <div className="ds-kpi-split-item">

              <span
                className="ds-kpi-split-dot"
                style={{ background: '#10b981' }}
              />

              <span className="ds-kpi-split-label">
                En stock
              </span>

              <span className="ds-kpi-split-val">
                {kpi.produitsEnStock}
              </span>

            </div>

            <div className="ds-kpi-split-item">

              <span
                className="ds-kpi-split-dot"
                style={{ background: '#f43f5e' }}
              />

              <span className="ds-kpi-split-label">
                Rupture
              </span>

              <span className="ds-kpi-split-val">
                {kpi.produitsEnRupture}
              </span>

            </div>

          </div>

        </div>

        {/* ── KPI 2 : Catégories ── */}
        <KpiCard
          label="Catégories"
          value={kpi.nombreCategories}
          accent="#6366f1"
          note="familles de produits"
        />

        {/* ── KPI 3 : Mouvements ── */}
        <div className="ds-kpi-card" style={{ '--accent': '#0ea5e9' }}>

          <span className="ds-kpi-label">
            Total mouvements
          </span>

          <div className="ds-kpi-bottom">

            <span className="ds-kpi-value">
              {kpi.totalMouvements.toLocaleString('fr-FR')}
            </span>

            <span className="ds-kpi-trend up">
              ▲ +8%
            </span>

          </div>

          <div className="ds-kpi-split">

            <div className="ds-kpi-split-item">

              <span
                className="ds-kpi-split-dot"
                style={{ background: '#0ea5e9' }}
              />

              <span className="ds-kpi-split-label">
                Entrée
              </span>

              <span className="ds-kpi-split-val">
                {kpi.entreeMouvements}
              </span>

            </div>

            <div className="ds-kpi-split-item">

              <span
                className="ds-kpi-split-dot"
                style={{ background: '#f59e0b' }}
              />

              <span className="ds-kpi-split-label">
                Sortie
              </span>

              <span className="ds-kpi-split-val">
                {kpi.sortieMouvements}
              </span>

            </div>

          </div>

        </div>

        {/* ── KPI 4 : Fournisseurs ── */}
        <KpiCard
          label="Fournisseurs"
          value={kpi.totalFournisseurs}
          accent="#8b5cf6"
          note="partenaires actifs"
        />

      </div>

    </div>
  );
};

export default KpiPage;