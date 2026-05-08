import React, { useEffect, useState } from "react";

export const KpiCard = ({
  label,
  value,
  accent,
  note,
  trend,
  trendUp
}) => (

  <div className="ds-kpi-card" style={{ "--accent": accent }}>

    <span className="ds-kpi-label">
      {label}
    </span>

    <div className="ds-kpi-bottom">

      <span className="ds-kpi-value">
        {Number(value || 0).toLocaleString("fr-FR")}
      </span>

      {trend && (
        <span className={`ds-kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? "▲" : "▼"} {trend}
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

const FinanceKpiPage = () => {

  const [financeKpi, setFinanceKpi] = useState({
    chiffreAffaire: 0,
    depensesTotal: 0,
    transactionsTotal: 0,
  });

  useEffect(() => {

    const fetchKpis = async () => {
      try {

        const res = await fetch(
          'http://localhost:5000/api/dashboard/finance/kpi-finance',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();

        setFinanceKpi(data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchKpis();

  }, []);

  return (
    <div className="kpi-page">

      <div className="ds-kpi-row">

        <KpiCard
          label="Chiffre d'affaires"
          value={financeKpi.chiffreAffaire}
          accent="#10b981"
          note="revenu total"
          trend="+12%"
          trendUp={true}
        />

        <KpiCard
          label="Dépenses Totales"
          value={financeKpi.depensesTotal}
          accent="#f43f5e"
          note="charges globales"
          trend="+5%"
          trendUp={false}
        />

        <KpiCard
          label="Transactions"
          value={financeKpi.transactionsTotal}
          accent="#6366f1"
          note="opérations effectuées"
          trend="+8%"
          trendUp={true}
        />

      </div>

    </div>
  );
};

export default FinanceKpiPage;