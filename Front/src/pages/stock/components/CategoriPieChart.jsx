import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CategoryBarChart = ({ categoriesData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels =
      categoriesData?.map(item => item.name) ||
      ['Électronique', 'Vêtements', 'Maison', 'Sport', 'Autres'];

    const dataValues =
      categoriesData?.map(item => item.count) ||
      [120, 85, 45, 30, 20];

    const colors = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b', '#f87171'];

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Produits',
            data: dataValues,
            backgroundColor: colors.map(c => c + 'cc'),
            borderColor: colors,
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },

      options: {
        indexAxis: 'y',
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
              label: ctx => ` ${ctx.parsed.x} produits`,
            },
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(148,163,184,0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
            },
            border: { display: false },
          },

          y: {
            grid: { display: false },
            ticks: {
              color: '#cbd5e1',
              font: { size: 12, weight: '500' },
              padding: 8,
            },
            border: { display: false },
          },
        },

        animation: {
          duration: 600,
          easing: 'easeOutQuart',
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [categoriesData]);

  const total =
    (categoriesData?.map(i => i.count) || [120, 85, 45, 30, 20])
      .reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0f172a, #1e293b)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid rgba(148,163,184,0.12)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: '#f1f5f9',
            fontSize: 15,
            fontWeight: 600,
          }}>
            Produits par catégorie
          </h3>

          <p style={{
            margin: '4px 0 0',
            color: '#64748b',
            fontSize: 12,
          }}>
            {total} produits au total
          </p>
        </div>
      </div>

      {/* CHART */}
      <div style={{ position: 'relative', height: 220 }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default CategoryBarChart;