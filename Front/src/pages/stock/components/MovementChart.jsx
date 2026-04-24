import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MovementLineChart = ({ dataEntree, dataSortie }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',                          // ← changé
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            label: 'Entrées',
            data: dataEntree || [30, 45, 35, 60, 50, 70],
            backgroundColor: 'rgba(52, 211, 153, 0.75)',
            borderColor: '#34d399',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Sorties',
            data: dataSortie || [20, 35, 40, 30, 45, 55],
            backgroundColor: 'rgba(248, 113, 113, 0.75)',
            borderColor: '#f87171',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
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
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
            ticks: { color: '#64748b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.07)', drawBorder: false },
            ticks: { color: '#64748b', font: { size: 11 }, padding: 6 },
            border: { display: false },
          }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });

    return () => { chartInstance.current?.destroy(); };
  }, [dataEntree, dataSortie]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(148,163,184,0.12)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>
            Tendance des mouvements
          </h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
            Janvier – Juin
          </p>
        </div>

        {/* Légende custom */}
        <div style={{ display: 'flex', gap: '14px' }}>
          {[['#34d399', 'Entrées'], ['#f87171', 'Sorties']].map(([color, label]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: color, borderRadius: '3px' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: '220px' }}>
        <canvas ref={chartRef} role="img" aria-label="Graphique barres entrées et sorties de stock" />
      </div>
    </div>
  );
};

export default MovementLineChart;