import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DEFAULT_DATA = [
  {
    name: 'Client Ahmed',
    total: 4500,
    commandes: 12,
    retour: 1,
    mois: [300, 450, 380, 500, 420, 550, 480, 600, 520, 580, 610, 650],
  },
  {
    name: 'Société Alpha',
    total: 3200,
    commandes: 8,
    retour: 0,
    mois: [200, 280, 310, 260, 340, 300, 380, 320, 290, 350, 370, 400],
  },
  {
    name: 'Client Moncef',
    total: 2800,
    commandes: 5,
    retour: 2,
    mois: [180, 220, 200, 250, 230, 270, 240, 290, 260, 310, 280, 320],
  },
  {
    name: 'Magasin Central',
    total: 2100,
    commandes: 9,
    retour: 1,
    mois: [150, 180, 160, 200, 190, 210, 180, 230, 200, 220, 240, 260],
  },
  {
    name: 'Client Sonia',
    total: 1500,
    commandes: 4,
    retour: 0,
    mois: [100, 120, 110, 140, 130, 150, 140, 160, 150, 170, 160, 180],
  },
];

const LABELS  = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
const COLORS  = ['#60a5fa','#34d399','#a78bfa','#f59e0b','#f87171'];
const AVATAR_BG = ['rgba(96,165,250,.15)','rgba(52,211,153,.15)','rgba(167,139,250,.15)','rgba(245,158,11,.15)','rgba(248,113,113,.15)'];
const RANK_STYLE = [
  ['rgba(245,158,11,.15)','#f59e0b'],
  ['rgba(148,163,184,.1)','#94a3b8'],
  ['rgba(180,138,100,.1)','#b48a64'],
];

const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const score = (c) =>
  Math.round((c.commandes * 10) - (c.retour * 8) + (c.total / 500));

// ─── Line Chart ─────────────────────────
const FideliteLineChart = ({ clients, selected, chartRefExport }) => {
  const ref      = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    if (instance.current) instance.current.destroy();

    const mkGradient = (color) => {
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0, color + '28');
      g.addColorStop(1, color + '02');
      return g;
    };

    const datasets = clients.map((c, i) => ({
      label: c.name,
      data: c.mois,
      borderColor: COLORS[i],
      backgroundColor: selected === i ? mkGradient(COLORS[i]) : 'transparent',
      fill: selected === i,
      tension: 0.4,
      borderWidth: selected === i ? 2.5 : 1.2,
      borderDash: selected === i ? [] : [4, 4],
      pointBackgroundColor: COLORS[i],
      pointBorderColor: '#0f172a',
      pointBorderWidth: 2,
      pointRadius: selected === i ? 4 : 2,
    }));

    instance.current = new Chart(ctx, {
      type: 'line',
      data: { labels: LABELS, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    // 🔥 expose chart au parent
    if (chartRefExport) chartRefExport.current = instance.current;

    return () => instance.current?.destroy();
  }, [clients, selected]);

  return (
    <div style={{ height: '240px' }}>
      <canvas ref={ref} />
    </div>
  );
};

// ─── Main Component ─────────────────────
const KpiClientFidele = ({ data }) => {
  const clients  = data || DEFAULT_DATA;
  const [selected, setSelected] = useState(0);

  const chartExportRef = useRef(null);

  const sorted = [...clients].sort((a, b) => score(b) - score(a));
  const sel    = sorted[selected];
  const color  = COLORS[selected];

  // 🔽 EXPORT FUNCTIONS
  const downloadPNG = () => {
    const chart = chartExportRef.current;
    if (!chart) return;

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients-fideles.png';
    link.click();
  };

  const downloadSVG = () => {
    const canvas = chartExportRef.current.canvas;
    const imgData = canvas.toDataURL("image/png");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <image href="${imgData}" width="100%" height="100%" />
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients-fideles.svg';
    link.click();

    URL.revokeObjectURL(url);
  };

  const btnStyle = {
    background: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid rgba(148,163,184,.2)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  };

  const s = {
    background: 'linear-gradient(145deg,#0f172a,#1e293b)',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid rgba(148,163,184,.1)',
  };

  return (
    <div style={s}>

      {/* Header + Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3 style={{ color: '#e2e8f0' }}>Clients fidèles</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={downloadPNG} style={btnStyle}>PNG</button>
          <button onClick={downloadSVG} style={btnStyle}>SVG</button>
        </div>
      </div>

      {/* Chart */}
      <FideliteLineChart
        clients={sorted}
        selected={selected}
        chartRefExport={chartExportRef}
      />

    </div>
  );
};

export default KpiClientFidele;