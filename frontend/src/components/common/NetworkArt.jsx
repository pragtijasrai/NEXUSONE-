const nodes = [
  [60,80],[200,35],[340,100],[130,200],[280,240],
  [420,190],[480,60],[230,140],[380,290],[80,290],
];
const links = [
  [0,1],[1,2],[0,3],[3,7],[7,2],[7,4],[4,5],[2,6],
  [5,6],[3,4],[1,7],[4,8],[3,9],[8,5],[9,3],
];

export default function NetworkArt({ className = 'network' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 540 320"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="ng" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity=".8" />
          <stop offset="100%" stopColor="#4338ca" stopOpacity=".3" />
        </radialGradient>
      </defs>
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          className="network__edge"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y}
          r={i === 7 ? 9 : i === 0 ? 6 : 4.5}
          className={i === 7 ? 'network__hub' : 'network__node'}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </svg>
  );
}
