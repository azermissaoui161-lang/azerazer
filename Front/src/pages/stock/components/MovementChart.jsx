import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MovementLineChart = ({ dataEntree, dataSortie }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line', // Type Line Chart
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            label: 'Évolution Entrées',
            data: dataEntree || [30, 45, 35, 60, 50, 70],
            borderColor: '#48bb78', // Akhdar
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            fill: true, // Bach ya3bi taht el khatt bchwaya loun
            tension: 0.3 // Bach el khatt iji fih chwaya courbe (smooth)
          },
          {
            label: 'Évolution Sorties',
            data: dataSortie || [20, 35, 40, 30, 45, 55],
            borderColor: '#f56565', // Ahmar
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Tendance des Mouvements de Stock' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantité' }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataEntree, dataSortie]);

  return <canvas ref={chartRef}></canvas>;
};

export default MovementLineChart;