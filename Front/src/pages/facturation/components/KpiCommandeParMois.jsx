import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
const DEFAULT_DATA = [12, 19, 15, 25, 22, 30, 45];

const KpiCommandeParMois = ({ dataCommandes }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const values = dataCommandes || DEFAULT_DATA;
  const total = values.reduce((a, b) => a + b, 0);
  const last = values[values.length - 1];
  const prev = values[values.length - 2] || 1;
  const trend = Math.round(((last - prev) / prev) * 100);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) chartInstance.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(96,165,250,0.22)');
    gradient.addColorStop(1, 'rgba(96,165,250,0.01)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: LABELS,
        datasets: [{
          label: 'Commandes',
          data: values,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#60a5fa',
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => `  ${ctx.parsed.y} commandes`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.07)', borderDash: [4, 4] },
            ticks: { color: '#64748b', font: { size: 11 }, padding: 6 },
            border: { display: false },
          }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });

    return () => { chartInstance.current?.destroy(); };
  }, [dataCommandes]);

  // =========================
  // EXPORT FUNCTIONS
  // =========================
  const downloadPNG = () => {
    const chart = chartInstance.current;
    if (!chart) return;

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'commandes-mois.png';
    link.click();
  };

  const downloadSVG = () => {
    const canvas = chartRef.current;
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
    link.download = 'commandes-mois.svg';
    link.click();

    URL.revokeObjectURL(url);
  };

  // =========================
  // STYLE BUTTON
  // =========================
  const btnStyle = {
    background: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid rgba(148,163,184,.2)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a, #1e293b)',
      borderRadius: '16px',
      padding: '22px',
      border: '1px solid rgba(148,163,184,0.1)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Header + boutons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '18px'
      }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Commandes par mois
          </h3>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            Janvier – Juillet
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#f1f5f9' }}>
            {total}
          </div>

          <div style={{
            fontSize: '11px',
            color: trend >= 0 ? '#34d399' : '#f87171',
            marginTop: '3px'
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            <span style={{ color: '#475569', marginLeft: '4px' }}>
              vs mois préc.
            </span>
          </div>

          {/* BOUTONS EXPORT */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <button onClick={downloadPNG} style={btnStyle}>PNG</button>
            <button onClick={downloadSVG} style={btnStyle}>SVG</button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '180px', position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>

    </div>
  );
};

export default KpiCommandeParMois;