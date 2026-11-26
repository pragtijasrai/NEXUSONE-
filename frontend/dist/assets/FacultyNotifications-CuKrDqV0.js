import{b as u,j as e}from"./index-FpIQGPKb.js";import{L as y}from"./vendor-react-lcEtrvJb.js";import{u as j}from"./useApi-CJ3wLtja.js";import{L as k,E as N,a as w}from"./ApiStates-sYCGm5oh.js";import{g as v,a as z,m as C}from"./notificationService-BGrgXK_Q.js";import{K as M,ac as m,M as I,am as _,h as A}from"./vendor-icons-BnIvknkA.js";import"./vendor-socket-CzaOuUYR.js";const c=`
  .fn{background:#0d1117;min-height:100vh;color:#c5caf0;font-family:inherit;padding:28px 32px;}
  .fn h1{font-size:1.4rem;font-weight:700;color:#eceefb;margin:0 0 4px;}
  .fn-sub{font-size:.88rem;color:#7880a8;margin:0 0 24px;}
  .fn-back{display:inline-flex;align-items:center;gap:6px;color:#7880a8;font-size:.83rem;text-decoration:none;margin-bottom:16px;transition:color .15s;}
  .fn-back:hover{color:#818cf8;}
  .fn-list{display:grid;gap:8px;}
  .fn-item{background:#161b2e;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;display:flex;align-items:flex-start;gap:12px;cursor:pointer;transition:border-color .18s;}
  .fn-item:hover{border-color:rgba(99,102,241,.25);}
  .fn-item--unread{border-left:3px solid #818cf8;}
  .fn-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;}
  .fn-title{font-size:.9rem;font-weight:600;color:#eceefb;margin:0 0 3px;}
  .fn-body{font-size:.82rem;color:#7880a8;margin:0 0 4px;}
  .fn-time{font-size:.72rem;color:#555a7a;}
  .fn-unread-dot{width:7px;height:7px;border-radius:50%;background:#818cf8;flex-shrink:0;margin-top:6px;}
  .fn-mark-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#7880a8;font:inherit;font-size:.82rem;cursor:pointer;transition:all .15s;}
  .fn-mark-btn:hover{color:#818cf8;border-color:#818cf8;}
  .fn-type-icon-info{background:rgba(99,102,241,.18);}
  .fn-type-icon-success{background:rgba(52,211,153,.15);}
  .fn-type-icon-warning{background:rgba(251,191,36,.15);}
  .fn-type-icon-error{background:rgba(248,113,113,.15);}
  @media(max-width:640px){.fn{padding:16px;}}
`,f={info:{Icon:A,bg:"rgba(99,102,241,.18)",col:"#818cf8"},success:{Icon:m,bg:"rgba(52,211,153,.15)",col:"#34d399"},warning:{Icon:_,bg:"rgba(251,191,36,.15)",col:"#fbbf24"},error:{Icon:I,bg:"rgba(248,113,113,.15)",col:"#f87171"}};function E(n){if(!n)return"";const o=Date.now()-new Date(n).getTime(),i=Math.floor(o/6e4);if(i<60)return`${i}m ago`;const a=Math.floor(i/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}function T(){const{notify:n}=u(),{data:o,loading:i,error:a,refetch:s}=j(v),t=o?.rows??[],l=o?.unreadCount??t.filter(r=>!r.is_read).length;async function d(r){try{await z(r),s()}catch{}}async function g(){try{await C(),n("All notifications marked as read","success"),s()}catch(r){n(r.message||"Failed","error")}}return i?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:c}),e.jsx("div",{className:"fn",children:e.jsx(k,{message:"Loading notifications…"})})]}):a?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:c}),e.jsx("div",{className:"fn",children:e.jsx(N,{error:a,onRetry:s})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:c}),e.jsxs("div",{className:"fn",children:[e.jsxs(y,{to:"/faculty/dashboard",className:"fn-back",children:[e.jsx(M,{size:15})," Back to Dashboard"]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:22},children:[e.jsxs("div",{children:[e.jsx("h1",{children:"Notifications"}),e.jsxs("p",{className:"fn-sub",children:[l," unread · ",t.length," total"]})]}),l>0&&e.jsxs("button",{className:"fn-mark-btn",onClick:g,children:[e.jsx(m,{size:15})," Mark all read"]})]}),t.length===0?e.jsx(w,{icon:"🔔",title:"No notifications",description:"You're all caught up."}):e.jsx("div",{className:"fn-list",children:t.map(r=>{const{Icon:p,bg:x,col:h}=f[r.type]??f.info;return e.jsxs("div",{className:`fn-item${r.is_read?"":" fn-item--unread"}`,onClick:()=>!r.is_read&&d(r.id),role:"button",tabIndex:0,onKeyDown:b=>b.key==="Enter"&&!r.is_read&&d(r.id),"aria-label":r.title,children:[e.jsx("div",{className:"fn-icon",style:{background:x},children:e.jsx(p,{size:16,color:h})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsx("p",{className:"fn-title",children:r.title}),r.body&&e.jsx("p",{className:"fn-body",children:r.body}),e.jsx("p",{className:"fn-time",children:E(r.created_at)})]}),!r.is_read&&e.jsx("div",{className:"fn-unread-dot","aria-label":"Unread"})]},r.id)})})]})]})}export{T as default};
