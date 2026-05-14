import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS       = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const DEF_RECETTES = [5000, 7000, 6000, 9000, 8000, 10000];
const DEF_DEPENSES = [3000, 4000, 5500, 6000, 7000, 8500];
const DEF_NET      = [2000, 3000, 500, 3000, 1000, 1500];

const RecetteDepense = ({ labels, dataRecettes, dataDepenses, dataNet }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartLabels =
    Array.isArray(labels) && labels.length ? labels : LABELS;

  const recettes =
    Array.isArray(dataRecettes) && dataRecettes.length
      ? dataRecettes
      : DEF_RECETTES;

  const depenses =
    Array.isArray(dataDepenses) && dataDepenses.length
      ? dataDepenses
      : DEF_DEPENSES;

  const net =
    Array.isArray(dataNet) && dataNet.length
      ? dataNet
      : DEF_NET;

  /* ================= CHART ================= */
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      data: {
        labels: chartLabels,
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
        },

        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
            },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [chartLabels, recettes, depenses, net]);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>
          Recettes vs Dépenses
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          Analyse mensuelle financière
        </p>
      </div>

      {/* CHART */}
      <div style={{ width: '100%', height: 240 }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default RecetteDepense;