import React, { useEffect, useState } from "react";

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

  const [kpi, setKpi] = useState({
    totalClients: 0,
    totalFactures: 0,
    facturesPayees: 0,
    facturesImpayees: 0,
    totalCommandes: 0,
  });

  useEffect(() => {

    fetch("http://localhost:5000/api/dashboard/facturation/kpi-facture")
      .then(res => res.json())
      .then(data => setKpi(data))
      .catch(err => console.error(err));

  }, []);

  return (
    <div className="kpi-page">

      <div className="ds-kpi-row">

        <KpiCard
          label="Total clients"
          value={kpi.totalClients}
          accent="#6366f1"
          note="clients actifs"
        />

        <div className="ds-kpi-card" style={{ "--accent": "#10b981" }}>

          <span className="ds-kpi-label">
            Total factures
          </span>

          <div className="ds-kpi-bottom">
            <span className="ds-kpi-value">
              {kpi.totalFactures}
            </span>
          </div>

          <div className="ds-kpi-split">

            <div className="ds-kpi-split-item">
              <span className="ds-kpi-split-dot" style={{ background: "#10b981" }} />
              <span>Payées</span>
              <span>{kpi.facturesPayees}</span>
            </div>

            <div className="ds-kpi-split-item">
              <span className="ds-kpi-split-dot" style={{ background: "#f43f5e" }} />
              <span>Impayées</span>
              <span>{kpi.facturesImpayees}</span>
            </div>

          </div>

        </div>

        <KpiCard
          label="Total commandes"
          value={kpi.totalCommandes}
          accent="#0ea5e9"
          note="commandes globales"
        />

      </div>

    </div>
  );
};

export default KpiFacture;