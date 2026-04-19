import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiFactureStatus = ({ dataPaye, dataImpaye }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Data test (ba3d tejbedhom mel backend)
    const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const paye = dataPaye || [20, 35, 25, 45, 40, 55];
    const impaye = dataImpaye || [10, 15, 20, 10, 25, 15];

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Factures Payées',
            data: paye,
            borderColor: '#1cc88a', // Akhdar
            backgroundColor: 'rgba(28, 200, 138, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Factures Impayées',
            data: impaye,
            borderColor: '#e74a3b', // Ahmar
            backgroundColor: 'rgba(231, 74, 59, 0.1)',
            fill: true,
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataPaye, dataImpaye]);

  return <canvas ref={chartRef}></canvas>;
};

export default KpiFactureStatus;