import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DEFAULT_DATA = [
  { name: 'Client Ahmed',    total: 4500, count: 12 },
  { name: 'Société Alpha',   total: 3200, count: 8  },
  { name: 'Client Moncef',   total: 2800, count: 5  },
  { name: 'Magasin Central', total: 2100, count: 9  },
  { name: 'Client Sonia',    total: 1500, count: 4  },
];

const COLORS     = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b', '#f87171'];
const AVATAR_BG  = ['rgba(96,165,250,.15)', 'rgba(52,211,153,.15)', 'rgba(167,139,250,.15)', 'rgba(245,158,11,.15)', 'rgba(248,113,113,.15)'];
const RANK_STYLE = [
  ['rgba(245,158,11,.15)', '#f59e0b'],
  ['rgba(148,163,184,.1)', '#94a3b8'],
  ['rgba(180,138,100,.1)', '#b48a64'],
];

const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const KpiTotalCommandeParClient = ({ data }) => {
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  const clients    = data || DEFAULT_DATA;
  const totalCA    = clients.reduce((a, c) => a + c.total, 0);
  const totalCmds  = clients.reduce((a, c) => a + c.count, 0);
  const panierMoy  = Math.round(totalCA / totalCmds);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: clients.map(c => c.name.split(' ')[1] || c.name.split(' ')[0]),
        datasets: [{
          data: clients.map(c => c.total),
          backgroundColor: COLORS.map(c => c + 'cc'),
          borderColor: COLORS,
          borderWidth: 1.5,
          borderRadius: 7,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#94a3b8',
            bodyColor: '#f1f5f9', borderColor: '#334155',
            borderWidth: 1, padding: 10,
            callbacks: {
              title: (items) => [clients[items[0].dataIndex].name],
              label: (item) => `  ${item.parsed.y.toLocaleString()} DT`,
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.07)', borderDash: [4, 4] },
            ticks: {
              color: '#64748b', font: { size: 11 }, padding: 6,
              callback: v => v >= 1000 ? v / 1000 + 'k' : v,
            },
            border: { display: false },
          }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });

    return () => { chartInstance.current?.destroy(); };
  }, [data]);

  const s = { background: 'linear-gradient(145deg,#0f172a,#1e293b)', borderRadius: '16px', padding: '22px', border: '1px solid rgba(148,163,184,.1)', fontFamily: "'Inter','Segoe UI',sans-serif" };

  const KbCard = ({ label, value, sub }) => (
    <div style={{ background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.07)', borderRadius: '10px', padding: '11px 13px' }}>
      <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginTop: '3px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{sub}</div>
    </div>
  );

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Commandes par client</h3>
        <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Top {clients.length} clients — classement par CA</p>
      </div>

      {/* KPI boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
        <KbCard label="Total CA"     value={totalCA.toLocaleString()}  sub="DT générés" />
        <KbCard label="Commandes"    value={totalCmds}                  sub="au total" />
        <KbCard label="Panier moy."  value={panierMoy.toLocaleString()} sub="DT / commande" />
      </div>

      {/* Chart */}
      <div style={{ height: '200px', position: 'relative', marginBottom: '18px' }}>
        <canvas ref={chartRef} role="img" aria-label="Total commandes par client" />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(148,163,184,.08)', marginBottom: '14px' }} />

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(148,163,184,.08)' }}>
            {['#', 'Client', 'Commandes', 'Total (DT)'].map(h => (
              <th key={h} style={{ padding: '8px 10px', color: '#475569', fontWeight: 500, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => {
            const [rbg, rcol] = RANK_STYLE[i] || ['rgba(148,163,184,.07)', '#64748b'];
            return (
              <tr key={i} style={{ borderBottom: i < clients.length - 1 ? '1px solid rgba(148,163,184,.05)' : 'none' }}>
                <td style={{ padding: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '5px', background: rbg, color: rcol, fontSize: '10px', fontWeight: 600 }}>{i + 1}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: AVATAR_BG[i], color: COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0 }}>
                      {initials(c.name)}
                    </div>
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px', color: '#60a5fa', fontWeight: 600 }}>{c.count}</td>
                <td style={{ padding: '10px', color: '#34d399', fontWeight: 600 }}>{c.total.toLocaleString()} DT</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KpiTotalCommandeParClient;