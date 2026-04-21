import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiRecetteEvolution = ({ dataRecette }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const values = dataRecette || [12000, 19000, 15000, 25000, 22000, 30000, 45000, 42000];
  const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];

  const total = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    const green = '#1D9E75';
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(29,158,117,0.12)');
    gradient.addColorStop(1, 'rgba(29,158,117,0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Recette (DT)',
          data: values,
          fill: true,
          backgroundColor: gradient,
          borderColor: green,
          borderWidth: 2.5,
          tension: 0.45,
          pointBackgroundColor: '#fff',
          pointBorderColor: green,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: green,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            titleColor: 'rgba(0,0,0,0.5)',
            bodyColor: '#111',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `  ${ctx.parsed.y.toLocaleString('fr-TN')} DT`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: 'rgba(0,0,0,0.45)', font: { size: 12 } }
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.06)' },
            border: { display: false },
            ticks: {
              color: 'rgba(0,0,0,0.45)',
              font: { size: 12 },
              maxTicksLimit: 5,
              callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
            }
          }
        }
      }
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [dataRecette]);

  const fmt = (n) => n.toLocaleString('fr-TN') + ' DT';

  const statStyle = {
    flex: 1, minWidth: 90,
    background: '#f6f6f4',
    borderRadius: 8,
    padding: '10px 12px',
  };

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 12,
      padding: '1.5rem',
      fontFamily: 'inherit',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
            Recette
          </p>
          <p style={{ fontSize: 26, fontWeight: 500, color: '#111', margin: 0 }}>
            {fmt(total)}
          </p>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 8,
          background: '#e1f5ee',
          color: '#0f6e56',
        }}>
          +18.2% <span style={{ fontWeight: 400 }}>vs mois préc.</span>
        </span>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%', height: 220 }}>
        <canvas ref={chartRef} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        {[['Min', fmt(min)], ['Max', fmt(max)], ['Moyenne', fmt(avg)]].map(([label, val]) => (
          <div key={label} style={statStyle}>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#111', margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KpiRecetteEvolution;