import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const DEFAULT_PAYE   = [20, 35, 25, 45, 40, 55];
const DEFAULT_IMPAYE = [10, 15, 20, 10, 25, 15];

const FactureStatus = ({ labels, dataPaye, dataImpaye }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartLabels = Array.isArray(labels) && labels.length ? labels : LABELS;
  const paye = Array.isArray(dataPaye) && dataPaye.length ? dataPaye : DEFAULT_PAYE;
  const impaye = Array.isArray(dataImpaye) && dataImpaye.length ? dataImpaye : DEFAULT_IMPAYE;

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const mkGradient = (color) => {
      const g = ctx.createLinearGradient(0, 0, 0, 180);
      g.addColorStop(0, color + '26');
      g.addColorStop(1, color + '02');
      return g;
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Payées',
            data: paye,
            borderColor: '#34d399',
            backgroundColor: mkGradient('#34d399'),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#34d399',
            pointBorderColor: '#0f172a',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'Impayées',
            data: impaye,
            borderColor: '#f87171',
            backgroundColor: mkGradient('#f87171'),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#f87171',
            pointBorderColor: '#0f172a',
            pointBorderWidth: 2,
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [chartLabels, paye, impaye]);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0f172a, #1e293b)',
        borderRadius: '16px',
        padding: '22px',
        border: '1px solid rgba(148,163,184,0.1)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Statut des factures
          </h3>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            Janvier – Juin
          </p>
        </div>
      </div>

      {/* CHART */}
      <div style={{ height: '180px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default FactureStatus;