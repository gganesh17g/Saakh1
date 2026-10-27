import { CanvasTexture } from "three";
import { ErrorBoundary } from "./ErrorBoundary";
import { useState, useRef, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import type { Graph } from "../domain/model";
import { Maximize, RotateCcw, Pause, Play, Layers } from "lucide-react";
function NodeLabel({ text }: { text: string }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#c8dbe9";
    ctx.fillText(text, 256, 50);
    return new CanvasTexture(c);
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, -0.65, 0]} scale={[2.5, 0.47, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}
function Flow({
  a,
  b,
  paused,
  offset,
}: {
  a: [number, number, number];
  b: [number, number, number];
  paused: boolean;
  offset: number;
}) {
  const ref = useRef<import("three").Mesh>(null);
  const phase = useRef(offset);
  useFrame((_, dt) => {
    if (!paused) phase.current = (phase.current + dt * 0.15) % 1;
    if (ref.current)
      ref.current.position.set(
        a[0] + (b[0] - a[0]) * phase.current,
        a[1] + (b[1] - a[1]) * phase.current,
        a[2] + (b[2] - a[2]) * phase.current,
      );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color="#49D9FF" />
    </mesh>
  );
}
function Scene({
  graph,
  paused,
  filter,
  select,
  period,
}: {
  graph: Graph;
  paused: boolean;
  filter: string;
  select: (s: string) => void;
  period: number;
}) {
  const ref = useRef<import("three").Group>(null);
  const positions = useMemo(
    () =>
      graph.nodes.map((_, i) =>
        i === 0
          ? ([0, 0, 0] as [number, number, number])
          : ([
              Math.cos((i * Math.PI) / 3) * 3,
              Math.sin((i * Math.PI) / 3) * 2,
              Math.sin(i * 2) * 1.3,
            ] as [number, number, number]),
      ),
    [graph.nodes],
  );
  useFrame((_, dt) => {
    if (ref.current && !paused) ref.current.rotation.y += dt * 0.045;
  });
  return (
    <>
      <ambientLight intensity={1.2} />
      <pointLight position={[3, 4, 5]} intensity={35} />
      <group ref={ref}>
        {graph.edges
          .filter(
            (e) =>
              filter === "all" ||
              graph.nodes.find((n) => n.id === e.from || n.id === e.to)
                ?.kind === filter ||
              graph.nodes.find((n) => n.id === e.from)?.kind === filter ||
              graph.nodes.find((n) => n.id === e.to)?.kind === filter,
          )
          .map((e, i) => {
            const a = positions[graph.nodes.findIndex((n) => n.id === e.from)],
              b = positions[graph.nodes.findIndex((n) => n.id === e.to)];
            return (
              <group key={e.id}>
                <Line
                  points={[a, b]}
                  color={e.id.includes("loop") ? "#FF647C" : "#277c94"}
                  lineWidth={1.5}
                  onClick={() => select(e.id)}
                />
                <Flow
                  key={`${period}-${i}`}
                  a={a}
                  b={b}
                  paused={paused}
                  offset={((period + 12 + i) % 24) / 24}
                />
              </group>
            );
          })}
        {graph.nodes.map((n, i) => (
          <group position={positions[i]} key={n.id}>
            <mesh onClick={() => select(n.id)}>
              <icosahedronGeometry args={[i === 0 ? 0.5 : 0.23, 1]} />
              <meshStandardMaterial
                color={
                  i === 0
                    ? "#49D9FF"
                    : n.kind === "buyer"
                      ? "#8A7CFF"
                      : "#36D6A0"
                }
                emissive={i === 0 ? "#157a9a" : "#183949"}
                emissiveIntensity={0.5}
              />
            </mesh>
            <NodeLabel text={n.name} />
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.7, 0.008, 6, 90]} />
          <meshBasicMaterial color="#264353" />
        </mesh>
      </group>
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={15}
      />
    </>
  );
}
function Network2D({
  graph,
  filter,
  choose,
}: {
  graph: Graph;
  filter: string;
  choose: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 600 330" role="img" aria-label="Interactive trade graph">
      {graph.edges
        .filter(
          (e) =>
            filter === "all" ||
            graph.nodes.some(
              (n) => (n.id === e.from || n.id === e.to) && n.kind === filter,
            ),
        )
        .map((e) => {
          const a = graph.nodes.findIndex((n) => n.id === e.from),
            b = graph.nodes.findIndex((n) => n.id === e.to);
          const pos = (i: number) =>
            i === 0
              ? [300, 165]
              : [
                  300 + Math.cos((i * Math.PI) / 3) * 220,
                  165 + Math.sin((i * Math.PI) / 3) * 120,
                ];
          return (
            <line
              key={e.id}
              x1={pos(a)[0]}
              y1={pos(a)[1]}
              x2={pos(b)[0]}
              y2={pos(b)[1]}
              stroke={e.id.includes("loop") ? "#ff647c" : "#277c94"}
              strokeWidth="3"
              onClick={() => choose(e.id)}
            />
          );
        })}
      {graph.nodes.map((n, i) => (
        <g key={n.id} onClick={() => choose(n.id)}>
          <circle
            cx={i === 0 ? 300 : 300 + Math.cos((i * Math.PI) / 3) * 220}
            cy={i === 0 ? 165 : 165 + Math.sin((i * Math.PI) / 3) * 120}
            r={i === 0 ? 24 : 13}
            fill={n.kind === "buyer" ? "#8a7cff" : "#49d9ff"}
          />
          <text
            x={i === 0 ? 300 : 300 + Math.cos((i * Math.PI) / 3) * 220}
            y={(i === 0 ? 165 : 165 + Math.sin((i * Math.PI) / 3) * 120) + 30}
            fill="currentColor"
            fontSize="10"
            textAnchor="middle"
          >
            {n.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
export default function Network({
  graph,
  period = 0,
  onSelect,
}: {
  graph: Graph;
  period?: number;
  onSelect?: (s: string) => void;
}) {
  const [selected, select] = useState("");
  const [paused, pause] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [mode, setMode] = useState(false);
  const [filter, setFilter] = useState("all");
  const [reset, setReset] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const webgl = useMemo(() => {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  }, []);
  const choose = (s: string) => {
    select(s);
    onSelect?.(s);
  };
  return (
    <div className="network" ref={root}>
      <div className="network-toolbar">
        <span className="live-dot" /> LIVE SYNTHETIC GRAPH{" "}
        <div className="spacer" />
        <button aria-label="Toggle 2D graph" onClick={() => setMode(!mode)}>
          <Layers size={15} />
        </button>
        <button aria-label="Reset camera" onClick={() => setReset(reset + 1)}>
          <RotateCcw size={15} />
        </button>
        <button
          aria-label={paused ? "Resume graph" : "Pause graph"}
          onClick={() => pause(!paused)}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <button
          aria-label="Fullscreen graph"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else
              void root.current
                ?.requestFullscreen()
                .catch(() => select("Fullscreen unavailable in this browser"));
          }}
        >
          <Maximize size={15} />
        </button>
      </div>
      <div className="scene">
        {webgl && !mode ? (
          <ErrorBoundary
            key={reset}
            fallback={(error) => (
              <>
                <p role="status" style={{ padding: 10, fontSize: 10 }}>
                  3D unavailable: {error.message}. Use the interactive 2D graph
                  below.
                </p>
                <Network2D graph={graph} filter={filter} choose={choose} />
              </>
            )}
          >
            <Suspense fallback={<p>Loading credit network…</p>}>
              <Canvas
                key={reset}
                dpr={
                  navigator.hardwareConcurrency <= 4 || innerWidth < 768
                    ? 1
                    : [1, 1.5]
                }
                frameloop={paused ? "demand" : "always"}
                camera={{ position: [0, 1, 9], fov: 45 }}
              >
                <Scene
                  graph={graph}
                  paused={paused}
                  filter={filter}
                  select={choose}
                  period={period}
                />
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        ) : (
          <Network2D graph={graph} filter={filter} choose={choose} />
        )}
      </div>
      <div className="network-bottom">
        <select
          aria-label="Relationship filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All relationships</option>
          <option value="buyer">Buyers</option>
          <option value="supplier">Suppliers</option>
        </select>
        <span>
          ● Borrower <span className="purple">● Buyers</span>{" "}
          <span className="green">● Suppliers</span>
        </span>
      </div>
      <details>
        <summary>
          Keyboard inspection · {graph.nodes.length} nodes /{" "}
          {graph.edges.length} relationships
        </summary>
        <div className="chips">
          {graph.nodes.map((n) => (
            <button key={n.id} onClick={() => choose(n.id)}>
              {n.name}
            </button>
          ))}
          {graph.edges.map((e) => (
            <button key={e.id} onClick={() => choose(e.id)}>
              {e.id}
            </button>
          ))}
        </div>
      </details>
      {selected && (
        <div className="evidence">
          Selected: <b>{selected}</b>
          <p>
            {graph.edges.find((e) => e.id === selected)
              ? JSON.stringify(graph.edges.find((e) => e.id === selected))
              : graph.nodes.find((n) => n.id === selected)?.name}
          </p>
        </div>
      )}
    </div>
  );
}
