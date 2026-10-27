/* Shared dark-navy styles for all maintenance portal pages */
export const C = {
  bg:      '#0f1729',
  card:    '#1a2540',
  card2:   '#1e2d4a',
  border:  'rgba(255,255,255,.08)',
  text:    '#e2e8f0',
  muted:   '#94a3b8',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
};

export const css = `
  .mp { background:${C.bg}; min-height:100vh; color:${C.text}; padding:28px 30px; font-family:inherit; }
  .mp h1 { font-size:1.6rem; font-weight:700; color:#fff; margin:0 0 3px; }
  .mp h2 { font-size:1rem; font-weight:600; color:#fff; margin:0 0 14px; }
  .mp .mp-sub { font-size:.85rem; color:${C.muted}; margin:0; }

  /* Cards */
  .mp-card { background:${C.card}; border:1px solid ${C.border}; border-radius:14px; padding:20px; }

  /* Stat cards */
  .mp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:22px; }
  .mp-stat  { background:${C.card}; border:1px solid ${C.border}; border-radius:12px; padding:18px 20px; display:flex; align-items:center; gap:14px; }
  .mp-stat-icon { width:44px; height:44px; border-radius:11px; display:grid; place-items:center; flex-shrink:0; }
  .mp-stat-val  { font-size:1.75rem; font-weight:800; color:#fff; line-height:1; }
  .mp-stat-lbl  { font-size:.78rem; color:${C.muted}; margin-top:2px; }

  /* Table */
  .mp-tbl { width:100%; border-collapse:collapse; font-size:.85rem; }
  .mp-tbl th { padding:9px 12px; color:${C.muted}; font-size:.74rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid ${C.border}; text-align:left; }
  .mp-tbl td { padding:11px 12px; border-bottom:1px solid rgba(255,255,255,.04); color:${C.text}; vertical-align:middle; }
  .mp-tbl tr:last-child td { border:0; }
  .mp-tbl tr:hover td { background:rgba(255,255,255,.03); }

  /* Badges */
  .mp-badge { display:inline-block; padding:2px 10px; border-radius:5px; font-size:.73rem; font-weight:700; white-space:nowrap; }
  .mp-pending     { background:rgba(245,158,11,.2);  color:#fbbf24; }
  .mp-inprogress  { background:rgba(99,102,241,.25); color:#818cf8; }
  .mp-completed   { background:rgba(52,211,153,.2);  color:#34d399; }

  /* Buttons */
  .mp-btn { display:inline-flex; align-items:center; gap:7px; padding:0 16px; min-height:36px; border-radius:9px; border:0; cursor:pointer; font:inherit; font-size:.86rem; font-weight:600; transition:opacity .15s; }
  .mp-btn:hover { opacity:.85; }
  .mp-btn-primary { background:${C.primary}; color:#fff; }
  .mp-btn-ghost   { background:rgba(255,255,255,.07); color:${C.text}; border:1px solid ${C.border}; }
  .mp-btn-sm { min-height:30px; padding:0 12px; font-size:.8rem; }

  /* Tabs */
  .mp-tabs { display:flex; gap:4px; }
  .mp-tab  { padding:6px 16px; border:0; background:transparent; color:${C.muted}; font:inherit; font-size:.84rem; font-weight:500; cursor:pointer; border-radius:8px; transition:all .15s; }
  .mp-tab:hover { color:${C.text}; }
  .mp-tab-active { background:${C.primary}; color:#fff; font-weight:600; }

  /* Search */
  .mp-search { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.06); border:1px solid ${C.border}; border-radius:9px; padding:0 12px; }
  .mp-search input { background:none; border:0; color:${C.text}; font:inherit; font-size:.85rem; min-height:34px; width:100%; outline:none; }
  .mp-search input::placeholder { color:${C.muted}; }

  /* Pagination */
  .mp-pages { display:flex; gap:4px; align-items:center; }
  .mp-page  { width:28px; height:28px; border-radius:6px; border:1px solid ${C.border}; background:transparent; color:${C.muted}; font:inherit; font-size:.8rem; cursor:pointer; display:grid; place-items:center; }
  .mp-page:hover { background:rgba(99,102,241,.2); color:#818cf8; }
  .mp-page-on { background:${C.primary}; color:#fff; border-color:${C.primary}; }

  /* Modal overlay */
  .mp-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:grid; place-items:center; padding:20px; overflow-y:auto; }
  .mp-modal   { background:${C.card}; border:1px solid ${C.border}; border-radius:16px; width:min(580px,100%); padding:28px; box-shadow:0 20px 60px rgba(0,0,0,.5); }

  /* Form fields */
  .mp-field { display:grid; gap:5px; margin-bottom:15px; }
  .mp-field-lbl { font-size:.82rem; font-weight:600; color:#c5caf0; }
  .mp-field-req { color:#f87171; }
  .mp-input, .mp-select, .mp-textarea { background:rgba(255,255,255,.06); border:1px solid ${C.border}; border-radius:8px; color:${C.text}; font:inherit; font-size:.87rem; padding:0 12px; min-height:38px; width:100%; outline:none; transition:border-color .15s; }
  .mp-input:focus, .mp-select:focus, .mp-textarea:focus { border-color:${C.primary}; }
  .mp-input::placeholder, .mp-textarea::placeholder { color:${C.muted}; }
  .mp-textarea { padding:10px 12px; min-height:86px; resize:vertical; }
  .mp-select option { background:${C.card2}; }
  .mp-field-err { font-size:.75rem; color:#f87171; }

  /* Action icon buttons */
  .mp-action { width:28px; height:28px; border-radius:6px; border:1px solid; cursor:pointer; display:inline-grid; place-items:center; font-size:0; transition:opacity .15s; }
  .mp-action:hover { opacity:.75; }

  /* Grid helpers */
  .mp-g2 { display:grid; grid-template-columns:1fr 1fr; gap:0 14px; }
  .mp-g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

  @media (max-width:900px) {
    .mp-stats { grid-template-columns:1fr 1fr; }
    .mp { padding:16px; }
  }
  @media (max-width:560px) {
    .mp-stats { grid-template-columns:1fr 1fr; gap:10px; }
    .mp-g2 { grid-template-columns:1fr; }
  }
`;
