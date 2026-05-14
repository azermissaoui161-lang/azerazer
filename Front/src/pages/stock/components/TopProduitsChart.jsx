import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const COLORS = [
  '#60a5fa',
  '#34d399',
  '#a78bfa',
  '#f59e0b',
  '#f87171',
  '#22d3ee',
  '#fb7185',
  '#84cc16',
];

const LABELS = ['Produit A', 'Produit B', 'Produit C', 'Autres'];

const TopProduitsChart = ({ labels, dataVentes }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const chartLabels =
    Array.isArray(labels) && labels.length ? labels : LABELS;

  const data =
    Array.isArray(dataVentes) && dataVentes.length
      ? dataVentes
      : [300, 50, 100, 80];

  const total = data.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [
          {
            data,
            backgroundColor: chartLabels.map(
              (_, index) => COLORS[index % COLORS.length]
            ),
            borderColor: '#0b1220',
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',

        onClick: (_, elements) => {
          if (elements.length > 0) {
            setSelectedIndex(elements[0].index);
          }
        },

        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [chartLabels, data]);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0b1220, #111c33)',
        borderRadius: 18,
        padding: 22,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Top produits
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
            Répartition des ventes
          </p>
        </div>
      </div>

      {/* CHART */}
      <div style={{ height: 220, marginTop: 15 }}>
        <canvas ref={chartRef} />
      </div>

      {/* LEGEND */}
      <div style={{ marginTop: 20 }}>
        {chartLabels.map((label, i) => {
          const percent = total
            ? Math.round(((data[i] || 0) / total) * 100)
            : 0;

          return (
            <div
              key={label}
              onClick={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                background:
                  selectedIndex === i
                    ? 'rgba(255,255,255,0.06)'
                    : 'transparent',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: COLORS[i % COLORS.length],
                  }}
                />
                {label}
              </span>

              <span style={{ color: '#cbd5e1' }}>
                {data[i] || 0} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* DETAIL CARD */}
      {selectedIndex !== null && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0' }}>Détail produit</h4>

          <table style={{ width: '100%', fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ color: '#94a3b8' }}>Produit</td>
                <td>{chartLabels[selectedIndex]}</td>
              </tr>
              <tr>
                <td style={{ color: '#94a3b8' }}>Quantité</td>
                <td>{data[selectedIndex]}</td>
              </tr>
              <tr>
                <td style={{ color: '#94a3b8' }}>%</td>
                <td>
                  {total
                    ? Math.round(
                        ((data[selectedIndex] || 0) / total) * 100
                      )
                    : 0}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopProduitsChart;