import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DEFAULT_DATA = [
  {
    name: 'Client Ahmed',
    total: 4500,
    commandes: 12,
    retour: 1,
    mois: [300, 450, 380, 500, 420, 550, 480, 600, 520, 580, 610, 650],
  },
  {
    name: 'Société Alpha',
    total: 3200,
    commandes: 8,
    retour: 0,
    mois: [200, 280, 310, 260, 340, 300, 380, 320, 290, 350, 370, 400],
  },
  {
    name: 'Client Moncef',
    total: 2800,
    commandes: 5,
    retour: 2,
    mois: [180, 220, 200, 250, 230, 270, 240, 290, 260, 310, 280, 320],
  },
  {
    name: 'Magasin Central',
    total: 2100,
    commandes: 9,
    retour: 1,
    mois: [150, 180, 160, 200, 190, 210, 180, 230, 200, 220, 240, 260],
  },
  {
    name: 'Client Sonia',
    total: 1500,
    commandes: 4,
    retour: 0,
    mois: [100, 120, 110, 140, 130, 150, 140, 160, 150, 170, 160, 180],
  },
];

const LABELS  = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
const COLORS  = ['#60a5fa','#34d399','#a78bfa','#f59e0b','#f87171'];
const AVATAR_BG = ['rgba(96,165,250,.15)','rgba(52,211,153,.15)','rgba(167,139,250,.15)','rgba(245,158,11,.15)','rgba(248,113,113,.15)'];
const RANK_STYLE = [
  ['rgba(245,158,11,.15)','#f59e0b'],
  ['rgba(148,163,184,.1)','#94a3b8'],
  ['rgba(180,138,100,.1)','#b48a64'],
];

const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const score = (c) =>
  Math.round((c.commandes * 10) - (c.retour * 8) + (c.total / 500));

// ─── Line Chart ───────────────────────────────────────────────────────────────
const FideliteLineChart = ({ clients, selected }) => {
  const ref      = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    if (instance.current) instance.current.destroy();

    const mkGradient = (color) => {
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0, color + '28');
      g.addColorStop(1, color + '02');
      return g;
    };

    const datasets = clients.map((c, i) => ({
      label: c.name,
      data: c.mois,
      borderColor: COLORS[i],
      backgroundColor: selected === i ? mkGradient(COLORS[i]) : 'transparent',
      fill: selected === i,
      tension: 0.4,
      borderWidth: selected === i ? 2.5 : 1.2,
      borderDash: selected === i ? [] : [4, 4],
      pointBackgroundColor: COLORS[i],
      pointBorderColor: '#0f172a',
      pointBorderWidth: 2,
      pointRadius: selected === i ? 4 : 2,
      pointHoverRadius: 6,
      order: selected === i ? 0 : 1,
    }));

    instance.current = new Chart(ctx, {
      type: 'line',
      data: { labels: LABELS, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: item => ` ${item.dataset.label} : ${item.parsed.y.toLocaleString()} DT`,
            },
          },
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
          },
        },
        animation: { duration: 600, easing: 'easeOutQuart' },
      },
    });

    return () => instance.current?.destroy();
  }, [clients, selected]);

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <canvas ref={ref} role="img" aria-label="Évolution achats clients fidèles" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const KpiClientFidele = ({ data }) => {
  const clients  = data || DEFAULT_DATA;
  const [selected, setSelected] = useState(0);

  const sorted = [...clients].sort((a, b) => score(b) - score(a));
  const sel    = sorted[selected];
  const color  = COLORS[selected];

  const s = {
    background: 'linear-gradient(145deg,#0f172a,#1e293b)',
    borderRadius: '16px', padding: '22px',
    border: '1px solid rgba(148,163,184,.1)',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  return (
    <div style={s}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Clients les plus fidèles
          </h3>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
            Classement par score de fidélité — 12 mois
          </p>
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sorted.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                background: selected === i ? COLORS[i] + '22' : 'transparent',
                border: `1px solid ${selected === i ? COLORS[i] : 'rgba(148,163,184,.15)'}`,
                borderRadius: '20px',
                color: selected === i ? COLORS[i] : '#64748b',
                fontSize: '11px', padding: '4px 11px',
                cursor: 'pointer', transition: '0.15s',
              }}
            >
              {c.name.split(' ')[1] || c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Line Chart ── */}
      <FideliteLineChart clients={sorted} selected={selected} />

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'rgba(148,163,184,.08)', margin: '18px 0 14px' }} />

      {/* ── Fiche client sélectionné ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: AVATAR_BG[selected],
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color,
          }}>
            {initials(sel.name)}
          </div>
          <div>
            <p style={{ margin: 0, color: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>{sel.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>
              Score fidélité :
              <span style={{ color, fontWeight: 700, marginLeft: '4px' }}>{score(sel)} pts</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          {[
            { label: 'CA total',    value: sel.total.toLocaleString() + ' DT', col: '#34d399' },
            { label: 'Commandes',   value: sel.commandes,                       col: '#60a5fa' },
            { label: 'Retours',     value: sel.retour,                          col: sel.retour > 0 ? '#f87171' : '#34d399' },
          ].map(({ label, value, col }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: col }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'rgba(148,163,184,.08)', marginBottom: '14px' }} />

      {/* ── Table classement ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(148,163,184,.08)' }}>
            {['#', 'Client', 'CA (DT)', 'Commandes', 'Retours', 'Score'].map(h => (
              <th key={h} style={{
                padding: '8px 10px', color: '#475569', fontWeight: 500,
                fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '.06em', textAlign: 'left',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const [rbg, rcol] = RANK_STYLE[i] || ['rgba(148,163,184,.07)', '#64748b'];
            const isSelected  = i === selected;
            return (
              <tr
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  borderBottom: i < sorted.length - 1 ? '1px solid rgba(148,163,184,.05)' : 'none',
                  background: isSelected ? COLORS[i] + '0a' : 'transparent',
                  cursor: 'pointer',
                  transition: '0.15s',
                }}
              >
                <td style={{ padding: '10px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '5px',
                    background: rbg, color: rcol, fontSize: '10px', fontWeight: 600,
                  }}>
                    {i + 1}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: AVATAR_BG[i], color: COLORS[i],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 600, flexShrink: 0,
                    }}>
                      {initials(c.name)}
                    </div>
                    <span style={{ color: isSelected ? COLORS[i] : '#e2e8f0', fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px', color: '#34d399', fontWeight: 600 }}>{c.total.toLocaleString()}</td>
                <td style={{ padding: '10px', color: '#60a5fa', fontWeight: 600 }}>{c.commandes}</td>
                <td style={{ padding: '10px', color: c.retour > 0 ? '#f87171' : '#64748b', fontWeight: 600 }}>{c.retour}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    background: COLORS[i] + '22',
                    border: `1px solid ${COLORS[i]}44`,
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '11px', fontWeight: 700, color: COLORS[i],
                  }}>
                    {score(c)} pts
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default KpiClientFidele;