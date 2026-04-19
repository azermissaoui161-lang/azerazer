import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KpiTotalCommandeParClient = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Data mta3 el tajrib (ba3d tejbedhom mel API mte3ek)
  const clientsData = data || [
    { name: 'Client Ahmed', total: 4500, count: 12 },
    { name: 'Société Alpha', total: 3200, count: 8 },
    { name: 'Client Moncef', total: 2800, count: 5 },
    { name: 'Magasin Central', total: 2100, count: 9 },
    { name: 'Client Sonia', total: 1500, count: 4 },
  ];

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: clientsData.map(c => c.name),
        datasets: [{
          label: 'Total Commandes (DT)',
          data: clientsData.map(c => c.total),
          backgroundColor: '#4e73df',
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
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
  }, [clientsData]);

  return (
    <div className="kpi-client-container">
      {/* 1. EL BAR CHART */}
      <div style={{ height: '250px', marginBottom: '20px' }}>
        <canvas ref={chartRef}></canvas>
      </div>

      {/* 2. EL TABLEAU */}
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666' }}>
              <th style={{ padding: '10px' }}>Client</th>
              <th style={{ padding: '10px' }}>Nb Commandes</th>
              <th style={{ padding: '10px' }}>Total (DT)</th>
            </tr>
          </thead>
          <tbody>
            {clientsData.map((client, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f8f9fc' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{client.name}</td>
                <td style={{ padding: '10px' }}>{client.count}</td>
                <td style={{ padding: '10px', color: '#1cc88a', fontWeight: 'bold' }}>{client.total} DT</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KpiTotalCommandeParClient;