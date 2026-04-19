import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiRecetteEvolution = ({ dataRecette }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];
    const values = dataRecette || [12000, 19000, 15000, 25000, 22000, 30000, 45000, 42000];

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Recette (DT)',
          data: values,
          fill: true,
          backgroundColor: 'rgba(28, 200, 138, 0.05)', // Akhdar khfif
          borderColor: '#1cc88a', // Akhdar fati7
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#1cc88a',
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              callback: (value) => `${value} DT` 
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataRecette]);

  return <canvas ref={chartRef}></canvas>;
};

export default KpiRecetteEvolution;