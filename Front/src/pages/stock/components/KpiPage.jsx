import React from 'react';

const formatNumber = (value) => Number(value || 0).toLocaleString('fr-FR');

export const KpiCard = ({
  label,
  value,
  accent,
  note,
  trend,
  trendUp,
}) => (
  <div className="ds-kpi-card" style={{ '--accent': accent }}>
    <span className="ds-kpi-label">{label}</span>

    <div className="ds-kpi-bottom">
      <span className="ds-kpi-value">{formatNumber(value)}</span>

      {trend && (
        <span className={`ds-kpi-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '+' : '-'} {trend}
        </span>
      )}
    </div>

    {note && <span className="ds-kpi-note">{note}</span>}
  </div>
);

const KpiPage = ({ kpi = {} }) => (
  <div className="kpi-page">
    <div className="ds-kpi-row">
      <div className="ds-kpi-card" style={{ '--accent': '#10b981' }}>
        <span className="ds-kpi-label">Stock total</span>

        <div className="ds-kpi-bottom">
          <span className="ds-kpi-value">
            {formatNumber((kpi.produitsEnStock || 0) + (kpi.produitsEnRupture || 0))}
          </span>
          <span className="ds-kpi-note">produits</span>
        </div>

        <div className="ds-kpi-split">
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#10b981' }} />
            <span className="ds-kpi-split-label">En stock</span>
            <span className="ds-kpi-split-val">{formatNumber(kpi.produitsEnStock)}</span>
          </div>

          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#f43f5e' }} />
            <span className="ds-kpi-split-label">Rupture</span>
            <span className="ds-kpi-split-val">{formatNumber(kpi.produitsEnRupture)}</span>
          </div>
        </div>
      </div>

      <KpiCard
        label="Stock faible"
        value={kpi.lowStock}
        accent="#f59e0b"
        note="produits sous seuil"
      />

      <KpiCard
        label="Categories"
        value={kpi.nombreCategories}
        accent="#6366f1"
        note="familles de produits"
      />

      <div className="ds-kpi-card" style={{ '--accent': '#0ea5e9' }}>
        <span className="ds-kpi-label">Total mouvements</span>

        <div className="ds-kpi-bottom">
          <span className="ds-kpi-value">{formatNumber(kpi.totalMouvements)}</span>
        </div>

        <div className="ds-kpi-split">
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#0ea5e9' }} />
            <span className="ds-kpi-split-label">Entree</span>
            <span className="ds-kpi-split-val">{formatNumber(kpi.entreeMouvements)}</span>
          </div>

          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#f59e0b' }} />
            <span className="ds-kpi-split-label">Sortie</span>
            <span className="ds-kpi-split-val">{formatNumber(kpi.sortieMouvements)}</span>
          </div>
        </div>
      </div>

      <KpiCard
        label="Valeur stock"
        value={kpi.stockValue}
        accent="#16a34a"
        note="valorisation en DT"
      />

      <KpiCard
        label="Fournisseurs"
        value={kpi.totalFournisseurs}
        accent="#8b5cf6"
        note="partenaires actifs"
      />
    </div>
  </div>
);

export default KpiPage;
