import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiRecetteDepense = ({ dataRecettes, dataDepenses, dataNet }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            type: 'bar', // Hada Bar chart
            label: 'Recettes',
            data: dataRecettes || [5000, 7000, 6000, 9000, 8000, 10000],
            backgroundColor: '#1cc88a',
            borderRadius: 5,
          },
          {
            //bar charts
            type: 'bar', 
            label: 'Dépenses',
            data: dataDepenses || [3000, 4000, 5500, 6000, 7000, 8500],
            backgroundColor: '#e74a3b',
            borderRadius: 5,
          },
          {
            //ligne charts
            type: 'line', 
            label: 'Net / Solde',
            data: dataNet || [2000, 3000, 500, 3000, 1000, 1500],
            borderColor: '#4e73df',
            backgroundColor: '#4e73df',
            tension: 0.3, // Bch yji l'khat mlawi chwaya
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [dataRecettes, dataDepenses, dataNet]);

  return <canvas ref={chartRef}></canvas>;
};

export default KpiRecetteDepense;