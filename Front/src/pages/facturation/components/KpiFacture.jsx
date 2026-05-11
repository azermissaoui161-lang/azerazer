import React from 'react';

const formatNumber = (value) => Number(value || 0).toLocaleString('fr-FR');

export const KpiCard = ({ label, value, accent, note }) => (
  <div className="ds-kpi-card" style={{ '--accent': accent }}>
    <span className="ds-kpi-label">{label}</span>

    <div className="ds-kpi-bottom">
      <span className="ds-kpi-value">{formatNumber(value)}</span>
    </div>

    {note && <span className="ds-kpi-note">{note}</span>}
  </div>
);

const KpiFacture = ({ kpi = {} }) => (
  <div className="kpi-page">
    <div className="ds-kpi-row">
      <KpiCard
        label="Total clients"
        value={kpi.totalClients}
        accent="#6366f1"
        note="clients actifs"
      />

      <div className="ds-kpi-card" style={{ '--accent': '#10b981' }}>
        <span className="ds-kpi-label">Total factures</span>

        <div className="ds-kpi-bottom">
          <span className="ds-kpi-value">{formatNumber(kpi.totalFactures)}</span>
        </div>

        <div className="ds-kpi-split">
          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#10b981' }} />
            <span>Payees</span>
            <span>{formatNumber(kpi.facturesPayees)}</span>
          </div>

          <div className="ds-kpi-split-item">
            <span className="ds-kpi-split-dot" style={{ background: '#f43f5e' }} />
            <span>Impayees</span>
            <span>{formatNumber(kpi.facturesImpayees)}</span>
          </div>
        </div>
      </div>

      <KpiCard
        label="Commandes"
        value={kpi.totalCommandes}
        accent="#0ea5e9"
        note="commandes globales"
      />

      <KpiCard
        label="Chiffre affaires"
        value={kpi.chiffreAffaires}
        accent="#16a34a"
        note="total facture en DT"
      />

      <KpiCard
        label="Reste a payer"
        value={kpi.resteAPayer}
        accent="#f59e0b"
        note="encours clients en DT"
      />
    </div>
  </div>
);

export default KpiFacture;
