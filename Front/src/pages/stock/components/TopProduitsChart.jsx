import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b'];
const LABELS = ['Produit A', 'Produit B', 'Produit C', 'Autres'];

const TopProduitsChart = ({ dataVentes }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const data = dataVentes || [300, 50, 100, 80];
  const total = data.reduce((a, b) => a + b, 0);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: LABELS,
        datasets: [{
          data,
          backgroundColor: COLORS.map(c => c + 'dd'),
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 6,
          hoverBorderColor: COLORS,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
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
              label: ctx =>
                `  ${ctx.parsed} unités (${Math.round(ctx.parsed / total * 100)}%)`
            }
          }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });

    return () => { chartInstance.current?.destroy(); };
  }, [dataVentes]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(148,163,184,0.12)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '15px', fontWeight: 600 }}>
          Top produits
        </h3>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
          Répartition des ventes
        </p>
      </div>

      {/* Donut + stat central */}
      <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={chartRef} role="img" aria-label="Graphique donut répartition des ventes par produit" />
        <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1 }}>
            {total}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            unités
          </div>
        </div>
      </div>

      {/* Légende avec mini barres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '16px' }}>
        {LABELS.map((label, i) => {
          const pct = Math.round(data[i] / total * 100);
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', flex: 1 }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#cbd5e1' }}>{data[i]}</span>
              <div style={{ width: '80px', height: '4px', background: 'rgba(148,163,184,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i], borderRadius: '4px' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', minWidth: '28px', textAlign: 'right' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProduitsChart;