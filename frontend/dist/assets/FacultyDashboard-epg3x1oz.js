import{u as I,j as e}from"./index-FpIQGPKb.js";import{L as r}from"./vendor-react-lcEtrvJb.js";import{u as d}from"./useApi-CJ3wLtja.js";import{a as M}from"./dashboardService-BiLVm_Ff.js";import{g as O}from"./announcementService-CkwMTEBj.js";import{g as U,a as Y,b as E}from"./facultyService-Dek1DebR.js";import{R as H,c as G,U as k,F as K,M as w,g as N,a2 as z,D as X,A,ai as q}from"./vendor-icons-BnIvknkA.js";import{R as S,P as V,a as $,C as J,T as R,B as Q,X as Z,Y as ee,b as ae}from"./vendor-charts-4NvTVVYk.js";import"./vendor-socket-CzaOuUYR.js";const se=[{day:"Mon",rate:92},{day:"Tue",rate:88},{day:"Wed",rate:95},{day:"Thu",rate:84},{day:"Fri",rate:78}],p=`
  .fd { background:#0d1117; min-height:100vh; color:#c5caf0; font-family:inherit; padding:28px 32px; }

  /* header */
  .fd-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px; margin-bottom:26px; }
  .fd-header h1 { font-size:1.5rem; font-weight:800; color:#eceefb; margin:0 0 4px; }
  .fd-header p { font-size:.9rem; color:#7880a8; margin:0; }
  .fd-header-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .fd-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:10px; border:0; font:inherit; font-size:.85rem; font-weight:600; cursor:pointer; text-decoration:none; transition:all .18s; }
  .fd-btn--primary { background:linear-gradient(135deg,#4338ca,#6366f1); color:#fff; }
  .fd-btn--primary:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(67,56,202,.35); }
  .fd-btn--ghost { background:rgba(255,255,255,.07); color:#c5caf0; border:1px solid rgba(255,255,255,.12); }
  .fd-btn--ghost:hover { background:rgba(255,255,255,.12); }

  /* stat cards */
  .fd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .fd-stat { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px 20px; display:flex; align-items:center; gap:14px; }
  .fd-stat-icon { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; flex-shrink:0; }
  .fd-stat-val { font-size:1.8rem; font-weight:800; color:#eceefb; line-height:1; letter-spacing:-.02em; }
  .fd-stat-lbl { font-size:.78rem; color:#7880a8; margin-bottom:2px; }
  .fd-stat-sub { font-size:.72rem; color:#555a7a; margin-top:3px; }

  /* 2-col grid */
  .fd-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }

  /* cards */
  .fd-card { background:#161b2e; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; }
  .fd-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .fd-card-head h2 { font-size:1rem; font-weight:700; color:#eceefb; margin:0; }
  .fd-link { display:inline-flex; align-items:center; gap:5px; font-size:.8rem; color:#818cf8; text-decoration:none; padding:5px 10px; border-radius:7px; border:1px solid rgba(99,102,241,.3); background:rgba(99,102,241,.1); transition:all .15s; font-weight:600; }
  .fd-link:hover { background:rgba(99,102,241,.2); }

  /* class rows */
  .fd-class-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-class-row:last-child { border:0; padding-bottom:0; }
  .fd-class-bar { width:3px; height:44px; border-radius:3px; flex-shrink:0; }
  .fd-class-name { font-size:.9rem; font-weight:600; color:#eceefb; }
  .fd-class-meta { font-size:.76rem; color:#7880a8; margin-top:2px; }
  .fd-status { font-size:.7rem; font-weight:700; padding:3px 10px; border-radius:99px; white-space:nowrap; }
  .fd-status--done     { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-status--progress { background:rgba(99,102,241,.18); color:#818cf8; }
  .fd-status--upcoming { background:rgba(255,255,255,.06); color:#7880a8; }

  /* assignment rows */
  .fd-asgn-row { display:flex; justify-content:space-between; align-items:flex-start; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-asgn-row:last-child { border:0; padding-bottom:0; }
  .fd-asgn-title { font-size:.88rem; font-weight:600; color:#eceefb; }
  .fd-asgn-meta  { font-size:.75rem; color:#7880a8; margin-top:2px; }
  .fd-progress { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; margin-top:6px; width:100%; }
  .fd-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#4338ca,#818cf8); }
  .fd-badge { font-size:.7rem; font-weight:700; padding:3px 9px; border-radius:6px; white-space:nowrap; flex-shrink:0; }
  .fd-badge--warn { background:rgba(251,191,36,.13); color:#fbbf24; }
  .fd-badge--ok   { background:rgba(52,211,153,.13);  color:#34d399; }

  /* student table */
  .fd-table { width:100%; border-collapse:collapse; font-size:.84rem; }
  .fd-table th { text-align:left; padding:8px 10px; color:#7880a8; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid rgba(255,255,255,.06); }
  .fd-table td { padding:11px 10px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; background:#161b2e; }
  .fd-table tr:last-child td { border:0; }
  .fd-table tr:hover td { background:#1a2035 !important; }
  .fd-av { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#4338ca,#818cf8); display:inline-grid; place-items:center; font-size:.72rem; font-weight:700; color:#fff; flex-shrink:0; }
  .fd-mini-bar { height:4px; background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; width:52px; display:inline-block; vertical-align:middle; margin-right:5px; }
  .fd-mini-fill { height:100%; border-radius:99px; }
  .fd-grade { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .fd-grade-a { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-grade-b { background:rgba(96,165,250,.13); color:#60a5fa; }
  .fd-grade-c { background:rgba(251,191,36,.13); color:#fbbf24; }

  /* quick actions */
  .fd-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
  .fd-action-btn { display:flex; align-items:center; gap:10px; padding:14px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:#161b2e; color:#c5caf0; text-decoration:none; font:inherit; font-size:.85rem; font-weight:600; cursor:pointer; transition:all .18s; }
  .fd-action-btn:hover { border-color:rgba(99,102,241,.4); background:rgba(99,102,241,.1); color:#eceefb; transform:translateY(-1px); }
  .fd-action-icon { width:36px; height:36px; border-radius:9px; display:grid; place-items:center; flex-shrink:0; }

  /* announcements */
  .fd-ann-row { display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid rgba(255,255,255,.04); gap:10px; }
  .fd-ann-row:last-child { border:0; padding-bottom:0; }
  .fd-ann-title { font-size:.87rem; font-weight:600; color:#eceefb; }
  .fd-ann-meta  { font-size:.74rem; color:#7880a8; margin-top:2px; }
  .fd-ann-badge { font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:5px; }
  .fd-ann-published { background:rgba(52,211,153,.13); color:#34d399; }
  .fd-ann-draft     { background:rgba(251,191,36,.13); color:#fbbf24; }

  /* recharts overrides for dark bg */
  .fd-chart .recharts-cartesian-axis-tick text { fill:#7880a8 !important; }
  .fd-chart .recharts-tooltip-wrapper { z-index:10; }

  @media(max-width:1100px){.fd-stats{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:800px){.fd-grid{grid-template-columns:1fr;}.fd-actions{grid-template-columns:1fr;}.fd{padding:16px;}}
  @media(max-width:480px){.fd-stats{grid-template-columns:1fr 1fr;}}
`,re=()=>{const t=new Date().getHours();return t<12?"Good Morning":t<18?"Good Afternoon":"Good Evening"},T={background:"#161b2e",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,fontSize:12,color:"#c5caf0"};function pe(){const{user:t}=I(),C=t?.name?.split(" ").filter(a=>!a.endsWith(".")).find(Boolean)??t?.name?.split(" ")[0]??"Faculty",{data:L,loading:D,error:m,refetch:x}=d(M),{data:B}=d(O),{data:P}=d(U),{data:h}=d(Y),{data:i}=d(E),o=L??{},b=o.upcomingBookings??[],l=o.announcements??B?.rows??[],u=o.stats??{},F=P?.courses??[],y=Array.isArray(h)?h:[],n=Array.isArray(i)?[{name:"Present",value:i.reduce((a,s)=>a+s.present,0),color:"#059669"},{name:"Absent",value:i.reduce((a,s)=>a+s.absent,0),color:"#dc2626"},{name:"On Leave",value:i.reduce((a,s)=>a+s.on_leave,0),color:"#d97706"}]:[{name:"Present",value:128,color:"#059669"},{name:"Absent",value:18,color:"#dc2626"},{name:"On Leave",value:6,color:"#d97706"}],j=F.length;Number(u.total_students??0);const v=Number(u.upcoming_events??0),W=n.reduce((a,s)=>a+s.value,0);return D?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:p}),e.jsx("div",{className:"fd",style:{display:"grid",placeItems:"center",minHeight:300},children:e.jsxs("div",{style:{textAlign:"center",color:"#7880a8",display:"grid",gap:14},children:[e.jsx("div",{style:{width:36,height:36,border:"3px solid rgba(255,255,255,.1)",borderTopColor:"#818cf8",borderRadius:"50%",animation:"nexus-spin .7s linear infinite",margin:"0 auto"}}),e.jsx("span",{children:"Loading…"}),e.jsx("style",{children:"@keyframes nexus-spin{to{transform:rotate(360deg)}}"})]})})]}):m?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:p}),e.jsx("div",{className:"fd",style:{display:"grid",placeItems:"center",minHeight:300},children:e.jsxs("div",{style:{textAlign:"center",color:"#f87171"},children:[e.jsx("p",{children:m.message}),e.jsx("button",{onClick:x,style:{background:"#4338ca",color:"#fff",border:0,borderRadius:9,padding:"8px 20px",cursor:"pointer",fontWeight:600},children:"Retry"})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:p}),e.jsxs("div",{className:"fd",children:[e.jsxs("div",{className:"fd-header",children:[e.jsxs("div",{children:[e.jsxs("h1",{children:[re(),", ",C,"! 👋"]}),e.jsx("p",{children:"Here's an overview of your teaching activities."})]}),e.jsxs("div",{className:"fd-header-actions",children:[e.jsxs("button",{className:"fd-btn fd-btn--ghost",onClick:x,children:[e.jsx(H,{size:14})," Refresh"]}),e.jsx(r,{className:"fd-btn fd-btn--ghost",to:"/faculty/announcements",children:"Post Announcement"}),e.jsx(r,{className:"fd-btn fd-btn--primary",to:"/faculty/assignments",children:"Manage Assignments"})]})]}),e.jsx("div",{className:"fd-stats",children:[{icon:G,label:"My Courses",value:j,sub:"This semester",color:"#4338ca",bg:"rgba(67,56,202,.2)"},{icon:k,label:"Announcements",value:l.length,sub:"Published + drafts",color:"#0ea5e9",bg:"rgba(14,165,233,.18)"},{icon:K,label:"Assignments",value:y.length,sub:"Active this semester",color:"#f59e0b",bg:"rgba(245,158,11,.18)"},{icon:w,label:"Upcoming Events",value:v,sub:"Next 30 days",color:"#7c3aed",bg:"rgba(124,58,237,.18)"}].map(({icon:a,label:s,value:c,sub:f,color:g,bg:_})=>e.jsxs("div",{className:"fd-stat",children:[e.jsx("div",{className:"fd-stat-icon",style:{background:_},children:e.jsx(a,{size:20,color:g})}),e.jsxs("div",{children:[e.jsx("div",{className:"fd-stat-lbl",children:s}),e.jsx("div",{className:"fd-stat-val",children:c}),e.jsx("div",{className:"fd-stat-sub",children:f})]})]},s))}),e.jsx("div",{className:"fd-actions",children:[{icon:N,label:"Take Attendance",to:"/faculty/attendance",color:"#818cf8",bg:"rgba(99,102,241,.2)"},{icon:z,label:"Create Assignment",to:"/faculty/assignments",color:"#22d3ee",bg:"rgba(34,211,238,.18)"},{icon:w,label:"Post Announcement",to:"/faculty/announcements",color:"#34d399",bg:"rgba(52,211,153,.18)"},{icon:X,label:"Book a Room",to:"/faculty/rooms",color:"#fbbf24",bg:"rgba(251,191,36,.18)"}].map(({icon:a,label:s,to:c,color:f,bg:g})=>e.jsxs(r,{to:c,className:"fd-action-btn",children:[e.jsx("div",{className:"fd-action-icon",style:{background:g},children:e.jsx(a,{size:18,color:f})}),s]},s))}),e.jsxs("div",{className:"fd-grid",children:[e.jsxs("div",{className:"fd-card",children:[e.jsxs("div",{className:"fd-card-head",children:[e.jsx("h2",{children:"Upcoming Room Bookings"}),e.jsxs(r,{className:"fd-link",to:"/faculty/rooms",children:["Book Room ",e.jsx(A,{size:12})]})]}),b.length===0?e.jsxs("p",{style:{color:"#7880a8",fontSize:".86rem"},children:["No upcoming bookings. ",e.jsx(r,{to:"/faculty/rooms",style:{color:"#818cf8"},children:"Book a room"})]}):b.slice(0,4).map(a=>e.jsxs("div",{className:"fd-class-row",children:[e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center",flex:1,minWidth:0},children:[e.jsx("div",{className:"fd-class-bar",style:{background:"#818cf8"}}),e.jsxs("div",{children:[e.jsx("div",{className:"fd-class-name",children:a.room_name??a.room_code}),e.jsxs("div",{className:"fd-class-meta",children:[a.building," · ",a.purpose]}),e.jsx("div",{className:"fd-class-meta",children:new Date(a.start_time).toLocaleString([],{dateStyle:"short",timeStyle:"short"})})]})]}),e.jsx("span",{className:"fd-status fd-status--progress",children:"Confirmed"})]},a.id))]}),e.jsxs("div",{className:"fd-card",children:[e.jsxs("div",{className:"fd-card-head",children:[e.jsx("h2",{children:"Student Attendance"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:4,fontSize:".75rem",color:"#34d399",background:"rgba(52,211,153,.1)",padding:"4px 10px",borderRadius:6,fontWeight:600},children:[e.jsx(q,{size:12})," Today"]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"center"},children:[e.jsx("div",{className:"fd-chart",children:e.jsx(S,{width:"100%",height:150,children:e.jsxs(V,{children:[e.jsx($,{data:n,cx:"50%",cy:"50%",innerRadius:42,outerRadius:68,dataKey:"value",strokeWidth:0,children:n.map((a,s)=>e.jsx(J,{fill:a.color},s))}),e.jsx(R,{contentStyle:T,formatter:(a,s)=>[a,s]})]})})}),e.jsxs("div",{style:{display:"grid",gap:10},children:[n.map(a=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:9,height:9,borderRadius:"50%",background:a.color,flexShrink:0}}),e.jsx("span",{style:{fontSize:".8rem",color:"#7880a8"},children:a.name}),e.jsx("strong",{style:{marginLeft:"auto",fontSize:".88rem",color:"#eceefb"},children:a.value})]},a.name)),e.jsx("div",{style:{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:8},children:e.jsxs("strong",{style:{fontSize:".88rem",color:"#eceefb"},children:["Total: ",W]})})]})]}),e.jsxs("div",{style:{marginTop:14},children:[e.jsx("p",{style:{fontSize:".74rem",color:"#7880a8",marginBottom:8},children:"Weekly attendance rate"}),e.jsx("div",{className:"fd-chart",children:e.jsx(S,{width:"100%",height:70,children:e.jsxs(Q,{data:se,margin:{top:0,right:0,bottom:0,left:-30},children:[e.jsx(Z,{dataKey:"day",tick:{fontSize:10,fill:"#7880a8"},axisLine:!1,tickLine:!1}),e.jsx(ee,{domain:[60,100],tick:{fontSize:10,fill:"#7880a8"},axisLine:!1,tickLine:!1}),e.jsx(ae,{dataKey:"rate",fill:"#4338ca",radius:[4,4,0,0]}),e.jsx(R,{contentStyle:T,formatter:a=>[`${a}%`,"Rate"]})]})})})]})]})]}),e.jsxs("div",{className:"fd-grid",children:[e.jsxs("div",{className:"fd-card",children:[e.jsxs("div",{className:"fd-card-head",children:[e.jsx("h2",{children:"Recent Announcements"}),e.jsxs(r,{className:"fd-btn fd-btn--primary",to:"/faculty/announcements",style:{padding:"7px 14px",fontSize:".82rem"},children:[e.jsx(z,{size:14})," New Announcement"]})]}),l.length===0?e.jsx("p",{style:{color:"#7880a8",fontSize:".86rem"},children:"No announcements yet."}):e.jsx("div",{style:{display:"grid",gap:10},children:l.slice(0,5).map((a,s)=>e.jsxs("div",{style:{background:"#0d1117",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6},children:[e.jsx("span",{className:"fd-ann-badge fd-ann-published",children:a.status??"published"}),e.jsx("span",{style:{fontSize:".72rem",color:"#555a7a"},children:a.created_at?new Date(a.created_at).toLocaleDateString():""})]}),e.jsx("p",{style:{margin:"0 0 4px",fontSize:".87rem",fontWeight:600,color:"#eceefb"},children:a.title}),e.jsx("p",{style:{margin:0,fontSize:".74rem",color:"#7880a8"},children:a.category})]},a.id??s))})]}),e.jsxs("div",{className:"fd-card",children:[e.jsxs("div",{className:"fd-card-head",children:[e.jsx("h2",{children:"My Students"}),e.jsxs(r,{className:"fd-link",to:"/faculty/students",children:["View All ",e.jsx(A,{size:12})]})]}),e.jsxs("dl",{className:"facts",style:{margin:0},children:[e.jsxs("div",{children:[e.jsx("dt",{children:"Courses this semester"}),e.jsx("dd",{style:{color:"#818cf8"},children:j})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"Assignments active"}),e.jsx("dd",{children:y.length})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"Upcoming events"}),e.jsx("dd",{children:v})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"Present (all classes)"}),e.jsx("dd",{style:{color:"#34d399"},children:n.find(a=>a.name==="Present")?.value??0})]})]}),e.jsxs("div",{style:{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsxs(r,{className:"fd-btn fd-btn--ghost",to:"/faculty/students",style:{padding:"7px 14px",fontSize:".82rem",textDecoration:"none"},children:[e.jsx(k,{size:14})," All Students"]}),e.jsxs(r,{className:"fd-btn fd-btn--ghost",to:"/faculty/attendance",style:{padding:"7px 14px",fontSize:".82rem",textDecoration:"none"},children:[e.jsx(N,{size:14})," Take Attendance"]})]})]})]})]})]})}export{pe as default};
