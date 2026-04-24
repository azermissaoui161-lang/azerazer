import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

// ─── Data ─────────────────────────────────────────────────────────────────────
const fournisseurs = [
  {
    id: 1,
    nom: 'Alpha Supply',
    total: 48500,
    commandes: 34,
    produits: [
      { nom: 'Processeur i9',   achat: 18000 },
      { nom: 'RAM 32GB',        achat: 12000 },
      { nom: 'SSD 1TB',         achat: 10500 },
      { nom: 'Carte mère Z790', achat: 8000  },
    ],
  },
  {
    id: 2,
    nom: 'Beta Logistics',
    total: 36200,
    commandes: 27,
    produits: [
      { nom: 'Écran 4K 27"',  achat: 14000 },
      { nom: 'Clavier mec.',  achat: 9500  },
      { nom: 'Souris Pro',    achat: 7200  },
      { nom: 'Hub USB-C',     achat: 5500  },
    ],
  },
  {
    id: 3,
    nom: 'Gamma Trade',
    total: 29800,
    commandes: 21,
    produits: [
      { nom: 'Switch réseau', achat: 11000 },
      { nom: 'Câble fibre',   achat: 8800  },
      { nom: 'Patch panel',   achat: 6000  },
      { nom: 'Rack 12U',      achat: 4000  },
    ],
  },
  {
    id: 4,
    nom: 'Delta Pro',
    total: 21400,
    commandes: 15,
    produits: [
      { nom: 'Imprimante A3', achat: 9000 },
      { nom: 'Toner noir',    achat: 5400 },
      { nom: 'Scanner doc.',  achat: 4500 },
      { nom: 'Papier A4',     achat: 2500 },
    ],
  },
  {
    id: 5,
    nom: 'Epsilon Co.',
    total: 15900,
    commandes: 11,
    produits: [
      { nom: 'Batterie UPS',  achat: 7000 },
      { nom: 'Câble HDMI',    achat: 4200 },
      { nom: 'Multiprise',    achat: 2900 },
      { nom: 'Adaptateur',    achat: 1800 },
    ],
  },
];

const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b', '#f87171'];
const ACCENT = '#1e293b';

// ─── Bar Chart fournisseurs ───────────────────────────────────────────────────
const FournisseursBarChart = ({ selected, onSelect }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    if (instance.current) instance.current.destroy();

    instance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fournisseurs.map(f => f.nom),
        datasets: [{
          label: 'CA total (DT)',
          data: fournisseurs.map(f => f.total),
          backgroundColor: fournisseurs.map((_, i) =>
            selected === i
              ? COLORS[i]
              : COLORS[i] + '55'
          ),
          borderColor: fournisseurs.map((_, i) => COLORS[i]),
          borderWidth: 1.5,
          borderRadius: 7,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => {
          if (elements.length > 0) onSelect(elements[0].index);
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => ` ${ctx.parsed.y.toLocaleString('fr-FR')} DT`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: v => v >= 1000 ? `${v / 1000}k` : v,
            },
            border: { display: false },
          },
        },
        animation: { duration: 500, easing: 'easeOutQuart' },
      },
    });

    return () => instance.current?.destroy();
  }, [selected]);

  return (
    <div style={{ position: 'relative', height: '220px', cursor: 'pointer' }}>
      <canvas ref={ref} />
      <p style={{ textAlign: 'center', fontSize: '11px', color: '#475569', marginTop: '8px' }}>
        Cliquez sur une barre pour voir le détail
      </p>
    </div>
  );
};

// ─── Bar Chart produits du fournisseur ───────────────────────────────────────
const ProduitsBarChart = ({ fournisseur, color }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    if (instance.current) instance.current.destroy();

    instance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fournisseur.produits.map(p => p.nom),
        datasets: [{
          label: 'Achat (DT)',
          data: fournisseur.produits.map(p => p.achat),
          backgroundColor: color + '33',
          borderColor: color,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.parsed.x.toLocaleString('fr-FR')} DT`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: v => v >= 1000 ? `${v / 1000}k` : v,
            },
            border: { display: false },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 11 } },
            border: { display: false },
          },
        },
        animation: { duration: 400, easing: 'easeOutQuart' },
      },
    });

    return () => instance.current?.destroy();
  }, [fournisseur, color]);

  return (
    <div style={{ position: 'relative', height: `${fournisseur.produits.length * 52 + 20}px` }}>
      <canvas ref={ref} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TopFournisseursChart = () => {
  const [selected, setSelected] = useState(0);
  const f = fournisseurs[selected];
  const color = COLORS[selected];

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a, #1e293b)',
      borderRadius: '16px',
      border: '1px solid rgba(148,163,184,0.1)',
      padding: '24px',
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>
            Top fournisseurs
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
            Classement par chiffre d'affaires
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {fournisseurs.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setSelected(i)}
              style={{
                background: selected === i ? COLORS[i] + '22' : 'transparent',
                border: `1px solid ${selected === i ? COLORS[i] : 'rgba(148,163,184,0.15)'}`,
                borderRadius: '20px',
                color: selected === i ? COLORS[i] : '#64748b',
                fontSize: '11px',
                padding: '4px 11px',
                cursor: 'pointer',
                transition: '0.15s',
              }}
            >
              {f.nom}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bar chart fournisseurs ── */}
      <FournisseursBarChart selected={selected} onSelect={setSelected} />

      {/* ── Divider ── */}
      <div style={{
        margin: '22px 0',
        borderTop: '1px solid rgba(148,163,184,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          marginTop: '-11px',
          background: '#0f172a',
          padding: '0 12px',
          fontSize: '11px',
          color: '#475569',
          whiteSpace: 'nowrap',
        }}>
          Détail fournisseur sélectionné
        </span>
      </div>

      {/* ── Fiche fournisseur ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: color + '22',
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color,
          }}>
            {f.nom.charAt(0)}
          </div>
          <div>
            <p style={{ margin: 0, color: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>{f.nom}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{f.commandes} commandes ce mois</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>CA total</p>
  <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: color }}>
    {f.total.toLocaleString('fr-FR')} DT
  </p>
</div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Produits</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
              {f.produits.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Bar chart produits ── */}
      <ProduitsBarChart fournisseur={f} color={color} />

    </div>
  );
};

export default TopFournisseursChart;