import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TopProduitsChart = ({ dataVentes }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut', // El cercle
      data: {
        labels: ['Produit A', 'Produit B', 'Produit C', 'Autres'],
        datasets: [{
          label: 'Unités Vendues',
          data: dataVentes || [300, 50, 100, 80],
          backgroundColor: [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataVentes]);

  return <canvas ref={chartRef}></canvas>;
};

export default TopProduitsChart;