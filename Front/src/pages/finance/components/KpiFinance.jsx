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

const FinanceKpiPage = ({ kpi = {} }) => {
  const beneficeNet = Number(kpi.beneficeNet || 0);

  return (
    <div className="kpi-page">
      <div className="ds-kpi-row">
        

        <KpiCard
          label="Recettes encaissees"
          value={kpi.recettesEncaissees}
          accent="#0ea5e9"
          note="paiements recus en DT"
        />

        <KpiCard
          label="Depenses"
          value={kpi.depensesTotal}
          accent="#f43f5e"
          note="charges globales en DT"
        />

        <KpiCard
          label="Benefice net"
          value={beneficeNet}
          accent={beneficeNet >= 0 ? '#16a34a' : '#dc2626'}
          note="recettes moins depenses"
          trend={beneficeNet >= 0 ? 'positif' : 'negatif'}
          trendUp={beneficeNet >= 0}
        />

        <KpiCard
          label="Transactions"
          value={kpi.transactionsTotal}
          accent="#6366f1"
          note="operations validees"
        />
      </div>
    </div>
  );
};

export default FinanceKpiPage;
