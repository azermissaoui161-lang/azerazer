import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DEFAULT_VALUES = [12000, 19000, 15000, 25000, 22000, 30000, 45000, 42000];
const LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];

const KpiRecetteEvolution = ({ dataRecette }) => {

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const values = dataRecette || DEFAULT_VALUES;

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const green = '#10b981';

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(16,185,129,0.25)');
    gradient.addColorStop(1, 'rgba(16,185,129,0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'Recettes',
            data: values,
            borderColor: green,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: 'index',
          intersect: false,
        },

        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111',
            bodyColor: '#111',
            borderColor: 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) =>
                `${ctx.parsed.y.toLocaleString('fr-TN')} DT`,
            },
          },
        },

        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#94a3b8' },
          },

          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.06)' },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              callback: (v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
            },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [values]);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: '16px',
    }}>
      
      {/* Simple title */}
      <div style={{ marginBottom: 10 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#334155',
        }}>
          Évolution des recettes
        </p>
        <p style={{
          fontSize: 12,
          color: '#94a3b8',
        }}>
          Analyse mensuelle
        </p>
      </div>

      {/* Chart only */}
      <div style={{ width: '100%', height: 240 }}>
        <canvas ref={chartRef} />
      </div>

    </div>
  );
};

export default KpiRecetteEvolution;