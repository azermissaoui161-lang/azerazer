import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

// ─── DATA ─────────────────────────────────────────────────────────────────────
const fournisseurs = [
  {
    id: 1,
    nom: 'Alpha Supply',
    total: 48500,
    commandes: 34,
    produits: [
      { nom: 'Processeur i9', achat: 18000 },
      { nom: 'RAM 32GB', achat: 12000 },
      { nom: 'SSD 1TB', achat: 10500 },
      { nom: 'Carte mère Z790', achat: 8000 },
    ],
  },
  {
    id: 2,
    nom: 'Beta Logistics',
    total: 36200,
    commandes: 27,
    produits: [
      { nom: 'Écran 4K 27"', achat: 14000 },
      { nom: 'Clavier mec.', achat: 9500 },
      { nom: 'Souris Pro', achat: 7200 },
      { nom: 'Hub USB-C', achat: 5500 },
    ],
  },
  {
    id: 3,
    nom: 'Gamma Trade',
    total: 29800,
    commandes: 21,
    produits: [
      { nom: 'Switch réseau', achat: 11000 },
      { nom: 'Câble fibre', achat: 8800 },
      { nom: 'Patch panel', achat: 6000 },
      { nom: 'Rack 12U', achat: 4000 },
    ],
  },
  {
    id: 4,
    nom: 'Delta Pro',
    total: 21400,
    commandes: 15,
    produits: [
      { nom: 'Imprimante A3', achat: 9000 },
      { nom: 'Toner noir', achat: 5400 },
      { nom: 'Scanner doc.', achat: 4500 },
      { nom: 'Papier A4', achat: 2500 },
    ],
  },
  {
    id: 5,
    nom: 'Epsilon Co.',
    total: 15900,
    commandes: 11,
    produits: [
      { nom: 'Batterie UPS', achat: 7000 },
      { nom: 'Câble HDMI', achat: 4200 },
      { nom: 'Multiprise', achat: 2900 },
      { nom: 'Adaptateur', achat: 1800 },
    ],
  },
];

const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b', '#f87171'];

// ─── CHART 1 ────────────────────────────────────────────────────────────────
const FournisseursBarChart = ({ fournisseursData, selected, onSelect }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = ref.current.getContext('2d');

    if (instance.current) instance.current.destroy();

    instance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: fournisseursData.map(f => f.nom),
        datasets: [
          {
            label: 'CA total (DT)',
            data: fournisseursData.map(f => f.total),
            backgroundColor: fournisseursData.map((_, i) =>
              selected === i
                ? COLORS[i % COLORS.length]
                : COLORS[i % COLORS.length] + '55'
            ),
            borderColor: fournisseursData.map(
              (_, i) => COLORS[i % COLORS.length]
            ),
            borderWidth: 1.5,
            borderRadius: 7,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => {
          if (elements.length > 0) onSelect(elements[0].index);
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => instance.current?.destroy();
  }, [fournisseursData, selected]);

  return (
    <div style={{ position: 'relative', height: 220 }}>
      <canvas ref={ref} />
    </div>
  );
};

// ─── CHART 2 ────────────────────────────────────────────────────────────────
const ProduitsBarChart = ({ fournisseur, color }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  const produits = Array.isArray(fournisseur.produits)
    ? fournisseur.produits
    : [];

  useEffect(() => {
    if (!ref.current) return;

    const ctx = ref.current.getContext('2d');

    if (instance.current) instance.current.destroy();

    instance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: produits.map(p => p.nom),
        datasets: [
          {
            data: produits.map(p => p.achat),
            backgroundColor: color + '33',
            borderColor: color,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => instance.current?.destroy();
  }, [produits, color]);

  return (
    <div
      style={{
        position: 'relative',
        height: `${Math.max(1, produits.length) * 52}px`,
      }}
    >
      <canvas ref={ref} />
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const TopFournisseursChart = ({ data }) => {
  const [selected, setSelected] = useState(0);

  const fournisseursData =
    Array.isArray(data) && data.length ? data : fournisseurs;

  const safeSelected = Math.min(
    selected,
    fournisseursData.length - 1
  );

  const f = fournisseursData[safeSelected];

  const color = COLORS[safeSelected % COLORS.length];

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0f172a, #1e293b)',
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.1)',
        padding: 24,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}
      >
        <h3 style={{ color: '#f1f5f9' }}>Top fournisseurs</h3>
      </div>

      {/* CHART */}
      <FournisseursBarChart
        fournisseursData={fournisseursData}
        selected={safeSelected}
        onSelect={setSelected}
      />

      {/* DETAILS */}
      <div style={{ marginTop: 20 }}>
        <h4 style={{ color: '#fff' }}>{f.nom}</h4>
        <p style={{ color: '#94a3b8' }}>
          CA: {f.total.toLocaleString()} DT
        </p>
      </div>

      {/* PRODUCTS CHART */}
      <ProduitsBarChart fournisseur={f} color={color} />
    </div>
  );
};

export default TopFournisseursChart;