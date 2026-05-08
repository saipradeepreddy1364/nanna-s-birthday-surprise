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
  rotate: number;
  color: string;
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
      const colors = type === "petal" ? PETAL_COLORS : type === "heart" ? HEART_COLORS : SPARKLE_COLORS;
      return {
        id: i,
        type,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 5,
        size: type === "sparkle" ? 4 + Math.random() * 6 : type === "heart" ? 10 + Math.random() * 14 : 12 + Math.random() * 16,
        opacity: 0.5 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 100,
        rotate: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }), []);

  useEffect(() => {
    if (!mountRef.current) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 600 550");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    const length = path.getTotalLength();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    const vertices: THREE.Vector3[] = [];

    // Particle density as per your reference snippet
    for (let i = 0; i < length; i += 0.1) {
      const point = path.getPointAtLength(i);
      // Synchronized scaling to sit OUTSIDE the portrait (1.1x)
      const x = (point.x - 300) * 1.1;
      const y = (-(point.y - 276)) * 1.1;
      
      const vector = new THREE.Vector3(x, y + 40, 0);
      vector.x += (Math.random() - 0.5) * 15;
      vector.y += (Math.random() - 0.5) * 15;
      vector.z += (Math.random() - 0.5) * 70;
      vertices.push(vector);

      // Start from center point animation
      tl.from(vector, {
        x: 0,
        y: 40,
        z: 0,
        ease: "power2.inOut",
        duration: 2 + Math.random() * 3,
      }, i * 0.002);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({
      color: 0xee5282,
      blending: THREE.AdditiveBlending,
      size: 4,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    gsap.fromTo(scene.rotation,
      { y: -0.2 },
      { y: 0.2, repeat: -1, yoyo: true, ease: "power2.inOut", duration: 3 }
    );

    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      geometry.setFromPoints(vertices);
      renderer.render(scene, camera);
    };
    render();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const closingTimer = setTimeout(() => setShowClosing(true), 1500);
    const textTimer = setTimeout(() => setShowText(true), 4000);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(closingTimer);
      clearTimeout(textTimer);
      tl.kill();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
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
      <style>{`
        @keyframes hs-fall {
          0%   { transform: translateY(-30px) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 0.85; }
          100% { transform: translateY(105vh) translateX(var(--hs-drift)) rotate(var(--hs-spin)) scale(0.6); opacity: 0; }
        }
        @keyframes hs-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 3px var(--hs-color)); }
          50%      { filter: drop-shadow(0 0 10px var(--hs-color)) drop-shadow(0 0 20px var(--hs-color)); }
        }
        @keyframes hs-fadein {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0 z-20" />

      {/* Falling elements */}
      {showClosing && fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${item.left}%`,
            zIndex: 25,
            pointerEvents: "none",
            animationName: "hs-fall",
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            ["--hs-drift" as string]: `${item.drift}px`,
            ["--hs-spin"  as string]: `${item.rotate * (Math.random() > 0.5 ? 1 : -1)}deg`,
            ["--hs-color" as string]: item.color,
          }}
        >
          {item.type === "heart" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" style={{ animation: "hs-glow-pulse 1.2s infinite" }}>
              <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14 12 21 12 21Z" fill={item.color} />
            </svg>
          )}
          {item.type === "petal" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" style={{ animation: "hs-glow-pulse 1.5s infinite" }}>
              <ellipse cx="12" cy="11" rx="7" ry="10" fill={item.color} transform="rotate(15 12 11)" />
            </svg>
          )}
        </div>
      ))}

      {/* Portrait - Perfectly sized to be INSIDE the particle ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative" style={{ transform: "translateY(-40px)" }}>
          <motion.img 
            id="portrait-reveal"
            src={PORTRAIT_IMAGE} 
            alt="Nanna"
            className="w-[280px] h-[256px] sm:w-[420px] sm:h-[385px] md:w-[560px] md:h-[513px] object-cover !bg-transparent !border-none !shadow-none"
            style={{
              opacity: 0,
              maskImage: maskUrl,
              WebkitMaskImage: maskUrl,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
        </div>
      </div>

      {/* Closing text */}
      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-30 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center glow-gold"
            style={{
              color: "hsl(38, 70%, 55%)",
              opacity: 0,
              animation: "hs-fadein 2s ease forwards",
            }}
          >
            Happy 21st Nanna 💝
          </h1>
        </div>
      )}
    </div>
  );
};

export default HeartScene;