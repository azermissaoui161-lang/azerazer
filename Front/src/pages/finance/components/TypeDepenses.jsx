import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DATA = [
  { type: 'Salaires', montant: 12000 },
  { type: 'Loyer', montant: 5000 },
  { type: 'Transport', montant: 2500 },
  { type: 'Fournitures', montant: 1800 },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const TypeDepenses = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [selected, setSelected] = useState(null);

  const total = DATA.reduce((a, b) => a + b.montant, 0);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: DATA.map(d => d.type),
        datasets: [
          {
            data: DATA.map(d => d.montant),
            backgroundColor: COLORS,
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
                const percent = ((val / total) * 100).toFixed(1);
                return `${ctx.label}: ${val.toLocaleString('fr-TN')} DT (${percent}%)`;
              },
            },
          },
        },

        onClick: (evt, elements) => {
          if (!elements.length) return;
          const index = elements[0].index;
          setSelected(DATA[index]);
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, []);

  return (
    <div className="card-pro">

      {/* HEADER */}
      <div className="card-header">
        <h3>Types de dépenses</h3>
        <span className="badge">
          Total: {total.toLocaleString('fr-TN')} DT
        </span>
      </div>

      {/* CHART */}
      <div style={{ height: 280 }}>
        <canvas ref={chartRef} />
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Montant</th>
              <th>%</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {DATA.map((item, i) => (
              <tr
                key={i}
                className={selected?.type === item.type ? 'active-row' : ''}
                onClick={() => setSelected(item)}
              >
                <td>
                  <span
                    className="dot"
                    style={{ background: COLORS[i] }}
                  />
                  {item.type}
                </td>

                <td>{item.montant.toLocaleString('fr-TN')} DT</td>

                <td>
                  {((item.montant / total) * 100).toFixed(1)}%
                </td>

                <td>
                  <span className="arrow">›</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS PANEL */}
      {selected && (
        <div className="details-panel">
          <div className="details-header">
            <h4>Détails: {selected.type}</h4>
            <button onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className="details-content">
            <div>
              <span>Montant</span>
              <b>{selected.montant.toLocaleString('fr-TN')} DT</b>
            </div>

            <div>
              <span>Part</span>
              <b>
                {((selected.montant / total) * 100).toFixed(1)}%
              </b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeDepenses;