import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CategoryBarChart = ({ categoriesData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Données de test si aucune donnée n'est passée en props
    const labels = categoriesData?.map(item => item.name) || ['Électronique', 'Vêtements', 'Maison', 'Sport', 'Autres'];
    const dataValues = categoriesData?.map(item => item.count) || [120, 85, 45, 30, 20];

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de Produits',
          data: dataValues,
          backgroundColor: [
            'rgba(78, 115, 223, 0.8)',
            'rgba(28, 200, 138, 0.8)',
            'rgba(54, 185, 204, 0.8)',
            'rgba(246, 194, 62, 0.8)',
            'rgba(231, 74, 59, 0.8)'
          ],
          borderColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 8,
        }]
      },
      options: {
        indexAxis: 'y', // Barres horizontales pour mieux lire les noms des catégories
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Pas besoin de légende pour une seule série
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categoriesData]);

  return <canvas ref={chartRef}></canvas>;
};

export default CategoryBarChart;