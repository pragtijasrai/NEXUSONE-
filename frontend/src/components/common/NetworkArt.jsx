const nodes = [[60,80],[180,40],[300,110],[120,190],[260,230],[380,200],[430,70],[210,140]];
const links = [[0,1],[1,2],[0,3],[3,7],[7,2],[7,4],[4,5],[2,6],[5,6],[3,4],[1,7]];
export default function NetworkArt() {
  return (<svg className="network" viewBox="0 0 480 300" aria-hidden="true" focusable="false">
    {links.map(([a, b], i) => <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="network__edge" style={{ animationDelay: `${i * 0.25}s` }} />)}
    {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 7 ? 9 : 5} className={i === 7 ? 'network__hub' : 'network__node'} />)}</svg>);
}
