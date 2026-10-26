/**
 * AdminShell — dark-themed wrapper for all admin pages.
 * Wrap every admin page in this to get consistent dark background,
 * typography, and shared scoped CSS classes (.ap-*).
 */

const css = `
  .ap { background:#0d1117; min-height:100vh; color:#c5caf0; padding:28px 32px; font-family:inherit; }
  .ap h1 { font-size:1.4rem; font-weight:700; color:#eceefb; margin:0 0 2px; letter-spacing:-.01em; }
  .ap h2 { font-size:.93rem; font-weight:600; color:#eceefb; margin:0; letter-spacing:0; }
  .ap .ap-sub { font-size:.85rem; color:#7880a8; margin:0; }

  /* Page header row */
  .ap-hdr { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:22px; }

  /* Card */
  .ap-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; }

  /* Card header */
  .ap-card-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }

  /* Grids */
  .ap-g4  { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .ap-g3  { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .ap-g2  { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .ap-row { display:grid; grid-template-columns:1.4fr 1fr; gap:16px; }

  /* Stat card */
  .ap-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; }
  .ap-stat-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
  .ap-stat-icon { width:42px; height:42px; border-radius:11px; display:grid; place-items:center; flex-shrink:0; }
  .ap-stat-val  { font-size:1.8rem; font-weight:800; color:#eceefb; line-height:1; }
  .ap-stat-lbl  { font-size:.76rem; color:#7880a8; margin-bottom:6px; }
  .ap-stat-trend{ display:flex; align-items:center; gap:5px; font-size:.76rem; color:#34d399; }
  .ap-stat-note { color:#7880a8; }

  /* Table */
  .ap-table { width:100%; border-collapse:collapse; font-size:.86rem; }
  .ap-table th { text-align:left; padding:9px 12px; color:#7880a8; font-size:.74rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid rgba(255,255,255,.07); }
  .ap-table td { padding:11px 12px; border-bottom:1px solid rgba(255,255,255,.05); color:#c5caf0; vertical-align:middle; }
  .ap-table tr:last-child td { border:0; }
  .ap-table tr:hover td { background:rgba(255,255,255,.03); }
  .ap-table-wrap { overflow-x:auto; }

  /* Search + filter bar */
  .ap-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; align-items:center; }
  .ap-search { display:flex; align-items:center; gap:8px; background:#0d1117; border:1px solid rgba(255,255,255,.1); border-radius:9px; padding:0 12px; flex:1; min-width:180px; }
  .ap-search input { background:none; border:0; color:#c5caf0; font:inherit; font-size:.86rem; min-height:36px; width:100%; outline:none; }
  .ap-search input::placeholder { color:#7880a8; }
  .ap-select { background:#0d1117; border:1px solid rgba(255,255,255,.1); border-radius:9px; padding:0 12px; height:36px; color:#c5caf0; font:inherit; font-size:.84rem; cursor:pointer; }
  .ap-select option { background:#161b2e; }

  /* Button variants */
  .ap-btn { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 16px; border-radius:9px; border:0; cursor:pointer; font:inherit; font-size:.84rem; font-weight:600; transition:opacity .15s; text-decoration:none; white-space:nowrap; }
  .ap-btn:hover { opacity:.85; }
  .ap-btn-primary { background:#4338ca; color:#fff; }
  .ap-btn-ghost   { background:rgba(255,255,255,.07); color:#c5caf0; border:1px solid rgba(255,255,255,.1); }
  .ap-btn-sm { min-height:30px; padding:0 12px; font-size:.78rem; }
  .ap-btn-danger  { background:rgba(248,113,113,.15); color:#f87171; border:1px solid rgba(248,113,113,.25); }

  /* Badge */
  .ap-badge { display:inline-flex; align-items:center; gap:4px; font-size:.72rem; font-weight:700; padding:3px 10px; border-radius:99px; white-space:nowrap; }
  .ap-badge-green  { background:rgba(52,211,153,.15); color:#34d399; }
  .ap-badge-blue   { background:rgba(99,102,241,.2);  color:#818cf8; }
  .ap-badge-yellow { background:rgba(251,191,36,.15); color:#fbbf24; }
  .ap-badge-red    { background:rgba(248,113,113,.15); color:#f87171; }
  .ap-badge-gray   { background:rgba(255,255,255,.08); color:#7880a8; }
  .ap-badge-cyan   { background:rgba(34,211,238,.15); color:#22d3ee; }

  /* Dot indicator */
  .ap-dot { width:8px; height:8px; border-radius:50%; display:inline-block; flex-shrink:0; }
  .ap-dot-green  { background:#34d399; }
  .ap-dot-red    { background:#f87171; }
  .ap-dot-yellow { background:#fbbf24; }
  .ap-dot-blue   { background:#818cf8; }

  /* Avatar */
  .ap-avatar { width:32px; height:32px; border-radius:50%; display:inline-grid; place-items:center; font-size:.76rem; font-weight:700; color:#fff; flex-shrink:0; }

  /* Progress */
  .ap-progress { height:6px; background:rgba(255,255,255,.08); border-radius:99px; overflow:hidden; }
  .ap-progress-fill { height:100%; border-radius:99px; }

  /* Pagination */
  .ap-pages { display:flex; gap:4px; align-items:center; margin-top:14px; justify-content:flex-end; }
  .ap-page { min-width:30px; height:30px; border-radius:7px; border:1px solid rgba(255,255,255,.1); background:transparent; color:#7880a8; font:inherit; font-size:.8rem; cursor:pointer; display:grid; place-items:center; transition:all .15s; }
  .ap-page:hover { background:rgba(99,102,241,.2); color:#818cf8; }
  .ap-page-active { background:#4338ca; color:#fff; border-color:#4338ca; }
  .ap-page-info { font-size:.8rem; color:#7880a8; margin-right:auto; }

  /* Tabs */
  .ap-tabs { display:flex; gap:4px; border-bottom:1px solid rgba(255,255,255,.07); margin-bottom:16px; }
  .ap-tab { padding:9px 16px; border:0; background:none; font:inherit; font-size:.84rem; font-weight:500; color:#7880a8; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; }
  .ap-tab:hover { color:#c5caf0; }
  .ap-tab-active { color:#818cf8; border-bottom-color:#818cf8; font-weight:600; }

  /* View link */
  .ap-link { font-size:.8rem; color:#818cf8; text-decoration:none; display:inline-flex; align-items:center; gap:4px; }
  .ap-link:hover { text-decoration:underline; }

  /* Info item */
  .ap-info-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.05); font-size:.86rem; }
  .ap-info-row:last-child { border:0; }
  .ap-info-lbl { color:#7880a8; }
  .ap-info-val { color:#eceefb; font-weight:500; }

  /* Responsive */
  @media (max-width:1200px) {
    .ap-g4 { grid-template-columns:repeat(2,1fr); }
    .ap-row { grid-template-columns:1fr; }
  }
  @media (max-width:768px) {
    .ap { padding:16px; }
    .ap-g3,.ap-g2 { grid-template-columns:1fr; }
    .ap-g4 { grid-template-columns:1fr 1fr; gap:12px; }
  }
`;

export default function AdminShell({ children }) {
  return (
    <>
      <style>{css}</style>
      <div className="ap">{children}</div>
    </>
  );
}
