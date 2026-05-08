import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

const HEART_SVG_PATH =
  "M300,140 C280,100 230,50 160,50 C70,50 0,120 0,210 C0,330 180,450 300,550 C420,450 600,330 600,210 C600,120 530,50 440,50 C370,50 320,100 300,140";

// ── Falling element types ─────────────────────────────────────────────────────
type FallingItem = {
  id: number;
  type: "petal" | "heart" | "sparkle";
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
};

const PETAL_COLORS   = ["hsl(342,82%,70%)", "hsl(350,90%,75%)", "hsl(330,80%,65%)", "hsl(355,85%,72%)"];
const HEART_COLORS   = ["hsl(342,82%,60%)", "hsl(38,70%,60%)",  "hsl(350,90%,70%)", "hsl(320,75%,65%)"];
const SPARKLE_COLORS = ["hsl(38,90%,65%)",  "hsl(50,95%,70%)",  "hsl(38,70%,55%)",  "hsl(55,100%,75%)"];

interface HeartSceneProps {
  onComplete: () => void;
}

const HeartScene = ({ onComplete }: HeartSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [showText, setShowText] = useState(false);

  const fallingItems = useMemo<FallingItem[]>(() =>
    Array.from({ length: 55 }, (_, i) => {
      const type: FallingItem["type"] = i < 22 ? "petal" : i < 42 ? "heart" : "sparkle";
      return {
        id: i,
        type,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 5,
        size: type === "sparkle" ? 4 + Math.random() * 6 : type === "heart" ? 10 + Math.random() * 14 : 12 + Math.random() * 16,
        opacity: 0.5 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 100,
      };
    }), []);

  useEffect(() => {
    if (!mountRef.current) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer;
    let geometry: THREE.BufferGeometry;
    let material: THREE.PointsMaterial;
    let onResize: () => void;
    let closingTimer: any;
    let textTimer: any;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 700;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const svgNS = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    const pathLength = path.getTotalLength();

    const vertices: THREE.Vector3[] = [];
    const originalPositions: THREE.Vector3[] = [];
    const particleCount = 20000;

    for (let i = 0; i < particleCount; i++) {
      const distance = Math.random() * pathLength;
      const point = path.getPointAtLength(distance);
      const x = (point.x - 300) * 1.05;
      const y = (-(point.y - 276)) * 1.05;
      const vector = new THREE.Vector3(x, y + 40, 0);
      vector.x += (Math.random() - 0.5) * 15;
      vector.y += (Math.random() - 0.5) * 15;
      vector.z += (Math.random() - 0.5) * 80;
      vertices.push(vector);
      originalPositions.push(vector.clone());
    }

    geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    material = new THREE.PointsMaterial({
      color: 0xff4d8d,
      size: 6,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.scale.set(0, 0, 0);
    scene.add(particles);

    gsap.to(particles.scale, { 
      x: 1, y: 1, z: 1, 
      duration: 3, 
      ease: "back.out(1.2)", 
      delay: 0.5 
    });

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const orig = originalPositions[i];
        positions[i3] = orig.x + Math.sin(time * 0.002 + i) * 2;
        positions[i3 + 1] = orig.y + Math.cos(time * 0.002 + i) * 2;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(render);

    onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    closingTimer = setTimeout(() => {
      setShowClosing(true);
      gsap.fromTo("#portrait-reveal", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.5, ease: "power2.out" });
    }, 1500);

    textTimer = setTimeout(() => setShowText(true), 4000);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animId) cancelAnimationFrame(animId);
      if (closingTimer) clearTimeout(closingTimer);
      if (textTimer) clearTimeout(textTimer);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (mountRef.current && renderer?.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const maskUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 550'%3E%3Cpath fill='black' d='${HEART_SVG_PATH}'/%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 z-40"
      style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}
    >
      <div ref={mountRef} className="absolute inset-0 z-20 pointer-events-none" />

      {showClosing && fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${item.left}%`,
            zIndex: 10,
            pointerEvents: "none",
            animation: `hs-fall ${item.duration}s ${item.delay}s linear infinite`,
            ["--hs-drift" as string]: `${item.drift}px`,
          }}
        >
          {item.type === "heart" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" opacity={item.opacity}>
              <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14 12 21 12 21Z" fill="pink" />
            </svg>
          )}
        </div>
      ))}

      <motion.img
        id="portrait-reveal"
        src={PORTRAIT_IMAGE}
        alt="Nanna"
        className="fixed z-15 pointer-events-none w-[280px] h-[256px] sm:w-[420px] sm:h-[385px] md:w-[560px] md:h-[513px] object-cover bg-transparent"
        style={{
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0)",
          opacity: 0,
          transformOrigin: "center center",
          maskImage: maskUrl,
          WebkitMaskImage: maskUrl,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-30 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center"
            style={{ color: "hsl(38, 70%, 55%)", textShadow: "0 0 20px rgba(0,0,0,0.8)" }}
          >
            Happy 21st Nanna 💝
          </h1>
        </div>
      )}
      <style>{`
        @keyframes hs-fall {
          0% { transform: translateY(-30px); opacity: 0; }
          6% { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--hs-drift)); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default HeartScene;