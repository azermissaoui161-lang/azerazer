import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LABELS       = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const DEF_RECETTES = [5000, 7000, 6000, 9000, 8000, 10000];
const DEF_DEPENSES = [3000, 4000, 5500, 6000, 7000, 8500];
const DEF_NET      = [2000, 3000, 500,  3000, 1000, 1500];

const KpiRecetteDepense = ({ dataRecettes, dataDepenses, dataNet }) => {
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  const recettes = dataRecettes || DEF_RECETTES;
  const depenses = dataDepenses || DEF_DEPENSES;
  const net      = dataNet      || DEF_NET;

  const totalRec = recettes.reduce((a, b) => a + b, 0);
  const totalDep = depenses.reduce((a, b) => a + b, 0);
  const totalNet = net.reduce((a, b) => a + b, 0);

  const fmt = (n) => (n / 1000).toFixed(0) + 'k DT';

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      data: {
        labels: LABELS,
        datasets: [
          {
            type: 'bar', label: 'Recettes', data: recettes,
            backgroundColor: 'rgba(29,158,117,0.18)',
            borderColor: '#1D9E75', borderWidth: 1.5,
            borderRadius: 5, borderSkipped: false, order: 2,
          },
          {
            type: 'bar', label: 'Dépenses', data: depenses,
            backgroundColor: 'rgba(216,90,48,0.18)',
            borderColor: '#D85A30', borderWidth: 1.5,
            borderRadius: 5, borderSkipped: false, order: 2,
          },
          {
            type: 'line', label: 'Net / Solde', data: net,
            borderColor: '#378ADD',
            backgroundColor: 'rgba(55,138,221,0.07)',
            tension: 0.4, fill: true, borderWidth: 2.5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#378ADD', pointBorderWidth: 2,
            pointRadius: 4, pointHoverRadius: 6, order: 1,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            borderColor: 'rgba(0,0,0,0.08)', borderWidth: 1,
            titleColor: 'rgba(0,0,0,0.45)', bodyColor: '#111',
            padding: 10, cornerRadius: 8,
            callbacks: {
              label: c => `  ${c.dataset.label}: ${c.parsed.y.toLocaleString('fr-TN')} DT`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false }, border: { display: false },
            ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 11 }, autoSkip: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false },
            ticks: {
              color: 'rgba(0,0,0,0.4)', font: { size: 11 }, maxTicksLimit: 5, padding: 6,
              callback: v => v >= 1000 ? (v / 1000) + 'k' : v
            }
          }
        },
        animation: { duration: 600, easing: 'easeOutQuart' }
      }
    });

    return () => { chartInstance.current?.destroy(); };
  }, [dataRecettes, dataDepenses, dataNet]);

  const statStyle = {
    flex: 1, minWidth: 90, background: '#f6f6f4',
    borderRadius: 8, padding: '12px 14px',
  };

  const Legend = ({ color, label, isLine }) => (
    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#888' }}>
      {isLine
        ? <span style={{ width:14, height:2, borderRadius:2, background:color, display:'inline-block' }} />
        : <span style={{ width:10, height:10, borderRadius:2, background:color, display:'inline-block' }} />}
      {label}
    </span>
  );

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 12, padding: '1.5rem', fontFamily: 'inherit',
    }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem', flexWrap:'wrap', gap:10 }}>
        <div>
          <p style={{ fontSize:12, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>
            Recettes vs dépenses
          </p>
          <p style={{ fontSize:13, color:'#888', margin:0 }}>Solde net mensuel — Jan à Juin</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <Legend color="#1D9E75" label="Recettes" />
          <Legend color="#D85A30" label="Dépenses" />
          <Legend color="#378ADD" label="Net" isLine />
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'flex', gap:10, marginBottom:'1.25rem' }}>
        {[
          { label:'Total recettes', value: fmt(totalRec), color:'#0F6E56', sub:'sur la période' },
          { label:'Total dépenses', value: fmt(totalDep), color:'#993C1D', sub:'sur la période' },
          { label:'Solde net',      value: (totalNet >= 0 ? '+' : '') + fmt(totalNet), color:'#185FA5', sub: totalNet >= 0 ? 'bénéficiaire' : 'déficitaire' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={statStyle}>
            <p style={{ fontSize:11, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>{label}</p>
            <p style={{ fontSize:18, fontWeight:500, color, margin:0 }}>{value}</p>
            <p style={{ fontSize:11, color:'#888', margin:'3px 0 0' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position:'relative', width:'100%', height:230 }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default KpiRecetteDepense;