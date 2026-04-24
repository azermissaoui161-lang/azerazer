import React from "react";

const FINANCE_KPI = {
  chiffreAffaire: 75000,
  depensesTotal: 42000,
  transactionsTotal: 128,
};

export const KpiCard = ({ label, value, accent, note, trend, trendUp }) => (
  <div className="ds-kpi-card" style={{ "--accent": accent }}>
    <span className="ds-kpi-label">{label}</span>

    <div className="ds-kpi-bottom">
      <span className="ds-kpi-value">
        {value.toLocaleString("fr-FR")}
      </span>

      {trend && (
        <span className={`ds-kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? "▲" : "▼"} {trend}
        </span>
      )}
    </div>

    {note && <span className="ds-kpi-note">{note}</span>}
  </div>
);

const FinanceKpiPage = () => (
  <div className="kpi-page">

    <div className="ds-kpi-row">

      {/* ── KPI 1 : Chiffre d'affaires ── */}
      <KpiCard
        label="Chiffre d'affaires"
        value={FINANCE_KPI.chiffreAffaire}
        accent="#10b981"
        note="revenu total"
        trend="+12%"
        trendUp={true}
      />

      {/* ── KPI 2 : Dépenses ── */}
      <KpiCard
        label="Dépenses Totales"
        value={FINANCE_KPI.depensesTotal}
        accent="#f43f5e"
        note="charges globales"
        trend="+5%"
        trendUp={false}
      />

      {/* ── KPI 3 : Transactions ── */}
      <KpiCard
        label="Transactions"
        value={FINANCE_KPI.transactionsTotal}
        accent="#6366f1"
        note="opérations effectuées"
        trend="+8%"
        trendUp={true}
      />

    </div>
  </div>
);

export default FinanceKpiPage;