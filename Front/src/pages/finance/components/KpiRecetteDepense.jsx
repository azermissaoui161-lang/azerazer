import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS       = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const DEF_RECETTES = [5000, 7000, 6000, 9000, 8000, 10000];
const DEF_DEPENSES = [3000, 4000, 5500, 6000, 7000, 8500];
const DEF_NET      = [2000, 3000, 500, 3000, 1000, 1500];

const KpiRecetteDepense = ({ dataRecettes, dataDepenses, dataNet }) => {

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const recettes = dataRecettes || DEF_RECETTES;
  const depenses = dataDepenses || DEF_DEPENSES;
  const net      = dataNet      || DEF_NET;

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      data: {
        labels: LABELS,
        datasets: [
          {
            type: 'bar',
            label: 'Recettes',
            data: recettes,
            backgroundColor: 'rgba(29,158,117,0.25)',
            borderColor: '#1D9E75',
            borderWidth: 1.5,
            borderRadius: 6,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Dépenses',
            data: depenses,
            backgroundColor: 'rgba(216,90,48,0.25)',
            borderColor: '#D85A30',
            borderWidth: 1.5,
            borderRadius: 6,
            order: 2,
          },
          {
            type: 'line',
            label: 'Net',
            data: net,
            borderColor: '#378ADD',
            backgroundColor: 'rgba(55,138,221,0.08)',
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 4,
            order: 1,
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
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
            },
          },

          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111',
            bodyColor: '#111',
            borderColor: 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (c) =>
                `${c.dataset.label}: ${c.parsed.y.toLocaleString('fr-TN')} DT`,
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
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
            },
          },
        },

        animation: {
          duration: 700,
          easing: 'easeOutQuart',
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [recettes, depenses, net]);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: '16px',
    }}>
      
      {/* Title only */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
          Recettes vs Dépenses
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          Analyse mensuelle financière
        </p>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 240 }}>
        <canvas ref={chartRef} />
      </div>

    </div>
  );
};

export default KpiRecetteDepense;