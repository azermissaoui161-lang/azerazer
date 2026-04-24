import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const DEFAULT_PAYE   = [20, 35, 25, 45, 40, 55];
const DEFAULT_IMPAYE = [10, 15, 20, 10, 25, 15];

const KpiFactureStatus = ({ dataPaye, dataImpaye }) => {
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  const paye   = dataPaye   || DEFAULT_PAYE;
  const impaye = dataImpaye || DEFAULT_IMPAYE;

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    const mkGradient = (color) => {
      const g = ctx.createLinearGradient(0, 0, 0, 180);
      g.addColorStop(0, color + '26');
      g.addColorStop(1, color + '02');
      return g;
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'Payées',
            data: paye,
            borderColor: '#34d399',
            backgroundColor: mkGradient('#34d399'),
            fill: true, tension: 0.4, borderWidth: 2,
            pointBackgroundColor: '#34d399',
            pointBorderColor: '#0f172a', pointBorderWidth: 2,
            pointRadius: 4, pointHoverRadius: 6,
          },
          {
            label: 'Impayées',
            data: impaye,
            borderColor: '#f87171',
            backgroundColor: mkGradient('#f87171'),
            fill: true, tension: 0.4, borderWidth: 2,
            pointBackgroundColor: '#f87171',
            pointBorderColor: '#0f172a', pointBorderWidth: 2,
            pointRadius: 4, pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#94a3b8',
            bodyColor: '#f1f5f9', borderColor: '#334155',
            borderWidth: 1, padding: 10,
            mode: 'index', intersect: false,
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
  }, [dataPaye, dataImpaye]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a, #1e293b)',
      borderRadius: '16px', padding: '22px',
      border: '1px solid rgba(148,163,184,0.1)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Statut des factures
          </h3>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            Janvier – Juin
          </p>
        </div>

        {/* Légende */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['#34d399', 'Payées'], ['#f87171', 'Impayées']].map(([c, l]) => (
            <div key={l} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(148,163,184,.07)',
              border: '1px solid rgba(148,163,184,.1)',
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '10px', color: '#94a3b8',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Chart uniquement */}
      <div style={{ height: '180px', position: 'relative' }}>
        <canvas ref={chartRef} role="img" aria-label="Évolution factures payées et impayées" />
      </div>

    </div>
  );
};

export default KpiFactureStatus;