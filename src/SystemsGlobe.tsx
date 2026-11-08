import { useEffect, useRef } from "react";

type Node3D = { x: number; y: number; z: number; label?: string };
type Projected = { x: number; y: number; z: number; scale: number };
type Packet = { from: number; to: number; t: number; speed: number };

const NODE_COUNT = 72;
const NEIGHBOURS = 3;
const PACKET_COUNT = 18;
const FOCAL = 2.6;

// Spreads nodes evenly on a sphere (Fibonacci lattice) and links each one to its nearest neighbours,
// which gives a mesh that reads as a network of services rather than a random cloud.
function buildGraph(labels: string[]) {
  const nodes: Node3D[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < NODE_COUNT; index += 1) {
    const y = 1 - (index / (NODE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    nodes.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }

  const step = NODE_COUNT / Math.max(labels.length, 1);
  labels.forEach((label, index) => {
    nodes[Math.floor(index * step + step / 2) % NODE_COUNT].label = label;
  });

  const edges: [number, number][] = [];
  const adjacency: number[][] = nodes.map(() => []);

  nodes.forEach((node, index) => {
    nodes
      .map((other, otherIndex) => ({
        otherIndex,
        distance: (node.x - other.x) ** 2 + (node.y - other.y) ** 2 + (node.z - other.z) ** 2,
      }))
      .filter(({ otherIndex }) => otherIndex !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, NEIGHBOURS)
      .forEach(({ otherIndex }) => {
        if (adjacency[index].includes(otherIndex)) return;
        adjacency[index].push(otherIndex);
        adjacency[otherIndex].push(index);
        edges.push([index, otherIndex]);
      });
  });

  return { nodes, edges, adjacency };
}

export default function SystemsGlobe({
  labels,
  theme,
  animate,
  ariaLabel,
}: {
  labels: string[];
  theme: string;
  animate: boolean;
  ariaLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelsKey = labels.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#0071e3";
    const ink = styles.getPropertyValue("--text").trim() || "#1d1d1f";
    const lineRgb = theme === "dark" ? "255, 255, 255" : "0, 0, 0";
    const fontFamily = getComputedStyle(document.body).fontFamily;

    const { nodes, edges, adjacency } = buildGraph(labelsKey ? labelsKey.split("|") : []);
    const projected: Projected[] = nodes.map(() => ({ x: 0, y: 0, z: 0, scale: 1 }));
    const order = nodes.map((_, index) => index);

    function createPacket(from = Math.floor(Math.random() * nodes.length)): Packet {
      const neighbours = adjacency[from];
      return {
        from,
        to: neighbours[Math.floor(Math.random() * neighbours.length)],
        t: Math.random() * 0.4,
        speed: 0.006 + Math.random() * 0.008,
      };
    }

    const packets = Array.from({ length: PACKET_COUNT }, () => createPacket());

    let width = 0;
    let height = 0;
    let rotation = 0.6;
    let tilt = -0.28;
    let pointerOffset = 0;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let running = false;
    let isVisible = true;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function project() {
      const radius = Math.min(width, height) * 0.38;
      const angle = rotation + pointerOffset;
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      nodes.forEach((node, index) => {
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;
        const scale = FOCAL / (FOCAL - z2);
        projected[index] = { x: width / 2 + x1 * radius * scale, y: height / 2 + y2 * radius * scale, z: z2, scale };
      });
    }

    function draw() {
      project();
      context!.clearRect(0, 0, width, height);

      context!.lineWidth = 1;
      for (const [from, to] of edges) {
        const a = projected[from];
        const b = projected[to];
        const depth = (a.z + b.z) / 2;
        context!.strokeStyle = `rgba(${lineRgb}, ${0.04 + (depth + 1) * 0.07})`;
        context!.beginPath();
        context!.moveTo(a.x, a.y);
        context!.lineTo(b.x, b.y);
        context!.stroke();
      }

      context!.fillStyle = accent;
      context!.shadowColor = accent;
      for (const packet of packets) {
        const a = projected[packet.from];
        const b = projected[packet.to];
        const depth = a.z + (b.z - a.z) * packet.t;
        context!.globalAlpha = 0.3 + (depth + 1) * 0.35;
        context!.shadowBlur = 6 + (depth + 1) * 6;
        context!.beginPath();
        context!.arc(a.x + (b.x - a.x) * packet.t, a.y + (b.y - a.y) * packet.t, 1.6 + (depth + 1) * 1.2, 0, Math.PI * 2);
        context!.fill();
      }
      context!.shadowBlur = 0;

      order.sort((a, b) => projected[a].z - projected[b].z);
      const labelBoxes: { x: number; y: number; width: number }[] = [];
      for (let position = order.length - 1; position >= 0; position -= 1) {
        const index = order[position];
        const point = projected[index];
        const label = nodes[index].label;
        if (!label || point.z <= -0.15) continue;
        const fontSize = Math.round(11 + ((point.z + 1) / 2) * 3);
        context!.font = `500 ${fontSize}px ${fontFamily}`;
        const width = context!.measureText(label).width;
        // Front-most labels win; a label hidden behind another one is simply skipped.
        if (labelBoxes.some((box) => Math.abs(box.y - point.y) < fontSize + 2 && point.x < box.x + box.width + 6 && point.x + width + 6 > box.x)) {
          continue;
        }
        labelBoxes.push({ x: point.x, y: point.y, width: width + 8 });
      }
      const visibleLabels = new Set(labelBoxes.map((box) => `${box.x}:${box.y}`));

      for (const index of order) {
        const point = projected[index];
        const node = nodes[index];
        const front = (point.z + 1) / 2;
        context!.globalAlpha = 0.2 + front * 0.8;
        context!.fillStyle = node.label ? accent : ink;
        context!.beginPath();
        context!.arc(point.x, point.y, (node.label ? 3.4 : 1.7) * point.scale, 0, Math.PI * 2);
        context!.fill();

        if (node.label && visibleLabels.has(`${point.x}:${point.y}`)) {
          context!.globalAlpha = Math.min(1, (point.z + 0.15) * 1.5);
          context!.fillStyle = ink;
          context!.font = `500 ${Math.round(11 + front * 3)}px ${fontFamily}`;
          context!.fillText(node.label, point.x + 8, point.y + 4);
        }
      }
      context!.globalAlpha = 1;
    }

    function tick() {
      rotation += 0.0016;
      tilt += (-0.28 + pointerY * 0.5 - tilt) * 0.05;
      pointerOffset += (pointerX * 0.9 - pointerOffset) * 0.05;
      packets.forEach((packet, index) => {
        packet.t += packet.speed;
        if (packet.t >= 1) {
          packets[index] = { ...createPacket(packet.to), t: 0 };
        }
      });
      draw();
      frame = requestAnimationFrame(tick);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function start() {
      if (running || !animate || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      pointerY = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stop();
      } else if (isVisible) {
        start();
      }
    }

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !document.hidden) {
        start();
      } else {
        stop();
      }
    });
    intersectionObserver.observe(canvas);

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (hasFinePointer) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [labelsKey, theme, animate]);

  return <canvas ref={canvasRef} className="systems-globe" role="img" aria-label={ariaLabel} />;
}
