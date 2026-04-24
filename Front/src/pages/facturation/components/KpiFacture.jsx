import React from "react";

const KPI = {
  totalClients: 95,
  totalFactures: 120,
  facturesPayees: 85,
  facturesImpayees: 35,
  totalCommandes: 180,
};

export const KpiCard = ({ label, value, accent, note }) => (
  <div className="ds-kpi-card" style={{ "--accent": accent }}>
    <span className="ds-kpi-label">{label}</span>

    <div className="ds-kpi-bottom">
      <span className="ds-kpi-value">
        {value.toLocaleString("fr-FR")}
      </span>
    </div>

    {note && <span className="ds-kpi-note">{note}</span>}
  </div>
);

const KpiFacture = () => {
  return (
    <div className="kpi-page">

      <div className="ds-kpi-row">

        {/* ── KPI 1 : Total Clients ── */}
        <KpiCard
          label="Total clients"
          value={KPI.totalClients}
          accent="#6366f1"
          note="clients actifs"
        />

        {/* ── KPI 2 : Factures ── */}
        <div className="ds-kpi-card" style={{ "--accent": "#10b981" }}>
          <span className="ds-kpi-label">Total factures</span>

          <div className="ds-kpi-bottom">
            <span className="ds-kpi-value">
              {KPI.totalFactures.toLocaleString("fr-FR")}
            </span>
          </div>

          <div className="ds-kpi-split">
            <div className="ds-kpi-split-item">
              <span className="ds-kpi-split-dot" style={{ background: "#10b981" }} />
              <span className="ds-kpi-split-label">Payées</span>
              <span className="ds-kpi-split-val">{KPI.facturesPayees}</span>
            </div>

            <div className="ds-kpi-split-item">
              <span className="ds-kpi-split-dot" style={{ background: "#f43f5e" }} />
              <span className="ds-kpi-split-label">Impayées</span>
              <span className="ds-kpi-split-val">{KPI.facturesImpayees}</span>
            </div>
          </div>
        </div>

        {/* ── KPI 3 : Total Commandes ── */}
        <KpiCard
          label="Total commandes"
          value={KPI.totalCommandes}
          accent="#0ea5e9"
          note="commandes globales"
        />

      </div>

    </div>
  );
};

export default KpiFacture;