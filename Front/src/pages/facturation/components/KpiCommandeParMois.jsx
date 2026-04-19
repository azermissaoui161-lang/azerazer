import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiCommandeParMois = ({ dataCommandes }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    // N'fassa7 el chart la9dim ken mawjoud bech mayisra7ch bug
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Data mta3 el tajrib (ba3d tjibha mel API)
    const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
    const values = dataCommandes || [12, 19, 15, 25, 22, 30, 45];

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Commandes',
          data: values,
          fill: true, // Bech ya3mel el loun taht el khatt
          backgroundColor: 'rgba(78, 115, 223, 0.1)', // Loun khfif
          borderColor: '#4e73df', // Loun el khatt (Bleu)
          borderWidth: 3,
          tension: 0.4, // Bech iji el khatt "Smooth" (mouch mkasser)
          pointBackgroundColor: '#4e73df',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false } // Na7iw el légende bech yerba7 blassa
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [2] } // Khtout el grid ykounou pointillés
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dataCommandes]);
  

  return <canvas ref={chartRef}></canvas>;
  
};

export default KpiCommandeParMois;