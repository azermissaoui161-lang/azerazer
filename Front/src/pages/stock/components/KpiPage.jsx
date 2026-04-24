// components/KpiPage.jsx
import React from 'react';

const KPI = {
  produitsEnStock: 142,
  produitsEnRupture: 18,
  nombreCategories: 12,
  totalMouvements: 374,
  entreeMouvements: 210,
  sortieMouvements: 164,
};

export const KpiCard = ({ label, value, accent, note, trend, trendUp }) => (
  <div className="ds-kpi-card" style={{ '--accent': accent }}>
    <span className="ds-kpi-label">{label}</span>
    <div className="ds-kpi-bottom">
      <span className="ds-kpi-value">{value.toLocaleString('fr-FR')}</span>
      {trend && (
        <span className={`ds-kpi-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      )}
    </div>
    {note && <span className="ds-kpi-note">{note}</span>}
  </div>
);

const KpiPage = () => (
  <div className="kpi-page">

    <div className="ds-kpi-row">

      {/* ── KPI 1 : Stock ── */}
      <div className="ds-kpi-card" style={{ '--accent': '#10b981' }}>
        <span className="ds-kpi-label">Stock total</span>
        <div className="ds-kpi-bottom">
          <span className="ds-kpi-value">
            {(KPI.produitsEnStock + KPI.produitsEnRupture).toLocaleString('fr-FR')}
          </span>
          <span className="ds-kpi-note">produits</span>
        </div>
        <div className="ds-kpi-split">
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#10b981' }} />
            <span className="ds-kpi-split-label">En stock</span>
            <span className="ds-kpi-split-val">{KPI.produitsEnStock}</span>
          </div>
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#f43f5e' }} />
            <span className="ds-kpi-split-label">Rupture</span>
            <span className="ds-kpi-split-val">{KPI.produitsEnRupture}</span>
          </div>
        </div>
      </div>

      {/* ── KPI 2 : Catégories ── */}
      <KpiCard
        label="Catégories"
        value={KPI.nombreCategories}
        accent="#6366f1"
        note="familles de produits"
      />

      {/* ── KPI 3 : Mouvements ── */}
      <div className="ds-kpi-card" style={{ '--accent': '#0ea5e9' }}>
        <span className="ds-kpi-label">Total mouvements</span>
        <div className="ds-kpi-bottom">
          <span className="ds-kpi-value">
            {KPI.totalMouvements.toLocaleString('fr-FR')}
          </span>
          <span className="ds-kpi-trend up">▲ +8%</span>
        </div>
        <div className="ds-kpi-split">
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#0ea5e9' }} />
            <span className="ds-kpi-split-label">Entrée</span>
            <span className="ds-kpi-split-val">{KPI.entreeMouvements}</span>
          </div>
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#f59e0b' }} />
            <span className="ds-kpi-split-label">Sortie</span>
            <span className="ds-kpi-split-val">{KPI.sortieMouvements}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
);

export default KpiPage;