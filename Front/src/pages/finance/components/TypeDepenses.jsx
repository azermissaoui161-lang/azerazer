import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DATA = [
  { type: 'Salaires', montant: 12000 },
  { type: 'Loyer', montant: 5000 },
  { type: 'Transport', montant: 2500 },
  { type: 'Fournitures', montant: 1800 },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const TypeDepenses = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [selected, setSelected] = useState(null);

  const chartData = Array.isArray(data) && data.length ? data : DATA;

  const total = chartData.reduce(
    (a, b) => a + (Number(b.montant) || 0),
    0
  );

  /* ================= CHART ================= */
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.map(d => d.type),
        datasets: [
          {
            data: chartData.map(d => Number(d.montant) || 0),
            backgroundColor: chartData.map(
              (_, i) => COLORS[i % COLORS.length]
            ),
            borderWidth: 3,
            borderColor: '#fff',
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',

        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 16,
              color: '#64748b',
              font: { size: 12 },
            },
          },

          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                const percent = total
                  ? ((val / total) * 100).toFixed(1)
                  : '0.0';

                return `${ctx.label}: ${val.toLocaleString('fr-TN')} DT (${percent}%)`;
              },
            },
          },
        },

        onClick: (evt, elements) => {
          if (!elements.length) return;
          const index = elements[0].index;
          setSelected(chartData[index]);
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [chartData, total]);

  return (
    <div
      className="card-pro"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 14,
        padding: 16,
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Types de dépenses</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Total: {total.toLocaleString('fr-TN')} DT
          </span>
        </div>
      </div>

      {/* CHART */}
      <div style={{ height: 280 }}>
        <canvas ref={chartRef} />
      </div>

      {/* TABLE */}
      <table style={{ width: '100%', fontSize: 12, marginTop: 10 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#64748b' }}>
            <th>Type</th>
            <th>Montant</th>
            <th>%</th>
          </tr>
        </thead>

        <tbody>
          {chartData.map((item, i) => (
            <tr
              key={i}
              onClick={() => setSelected(item)}
              style={{
                cursor: 'pointer',
                background:
                  selected?.type === item.type
                    ? 'rgba(59,130,246,0.1)'
                    : 'transparent',
              }}
            >
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    marginRight: 6,
                    background: COLORS[i % COLORS.length],
                  }}
                />
                {item.type}
              </td>

              <td>
                {Number(item.montant || 0).toLocaleString('fr-TN')} DT
              </td>

              <td>
                {total
                  ? ((Number(item.montant || 0) / total) * 100).toFixed(1)
                  : '0.0'}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAILS */}
      {selected && (
        <div style={{ marginTop: 12, padding: 10, borderTop: '1px solid #eee' }}>
          <strong>Détails: {selected.type}</strong>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            Montant: {selected.montant.toLocaleString('fr-TN')} DT
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeDepenses;