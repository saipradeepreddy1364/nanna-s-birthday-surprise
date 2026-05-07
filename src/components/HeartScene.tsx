import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg"; // Updated to match user's filename (potrait typo)

const HEART_SVG_PATH =
  "M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69v0l0,0,.05,0,0,0,0,0v0C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77";

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

const HEART_CLIP_PATH = "M0.5,1 C0.5,1 0,0.7 0,0.35 C0,0.15 0.15,0 0.35,0 C0.45,0 0.5,0.05 0.5,0.05 C0.5,0.05 0.55,0 0.65,0 C0.85,0 1,0.15 1,0.35 C1,0.7 0.5,1 0.5,1 Z";

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

  // Pre-generate falling items once
  const fallingItems = useMemo<FallingItem[]>(() =>
    Array.from({ length: 55 }, (_, i) => {
      const type: FallingItem["type"] =
        i < 22 ? "petal" : i < 42 ? "heart" : "sparkle";
      const colors =
        type === "petal"   ? PETAL_COLORS :
        type === "heart"   ? HEART_COLORS : SPARKLE_COLORS;
      return {
        id: i,
        type,
        left:     Math.random() * 100,
        delay:    Math.random() * 4,
        duration: 4 + Math.random() * 5,
        size:
          type === "sparkle" ? 4 + Math.random() * 6 :
          type === "heart"   ? 10 + Math.random() * 14 :
                               12 + Math.random() * 16,
        opacity:  0.5 + Math.random() * 0.5,
        drift:    (Math.random() - 0.5) * 100,
        rotate:   Math.random() * 360,
        color:    colors[Math.floor(Math.random() * colors.length)],
      };
    }),
  []);

  useEffect(() => {
    if (!mountRef.current) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer;
    let geometry: THREE.BufferGeometry;
    let material: THREE.PointsMaterial;
    let tl: gsap.core.Timeline;
    let onResize: () => void;
    let closingTimer: any;
    let textTimer: any;
    let svg: any;

    const svgNS = "http://www.w3.org/2000/svg";
    svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 600 552");
    svg.style.cssText = "position:absolute;display:none;";
    const path  = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const length = path.getTotalLength(); // ~1800 units

    // ── Three.js setup ────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Explicitly set alpha to 0 for full transparency
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // ── Particles ─────
    const vertices: THREE.Vector3[] = [];
    const particleCount = 3500;

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      // Heart equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      
      const vector = new THREE.Vector3(x * 12, y * 12, 0);
      vector.x += (Math.random() - 0.5) * 20;
      vector.y += (Math.random() - 0.5) * 20;
      vector.z += (Math.random() - 0.5) * 100;
      vertices.push(vector);
    }

    geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    material = new THREE.PointsMaterial({
      color: 0xff4d8d,
      size: 4,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.scale.set(0, 0, 0);
    scene.add(particles);

    // Animations
    gsap.to(particles.scale, { 
      x: 1, y: 1, z: 1, 
      duration: 3, 
      ease: "back.out(1.2)", 
      delay: 0.5 
    });

    gsap.fromTo(scene.rotation,
      { y: -0.2 },
      { y: 0.2, repeat: -1, yoyo: true, ease: "power1.inOut", duration: 4 }
    );

    const render = () => {
      animId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Show portrait image after particles have started
    closingTimer = setTimeout(() => {
      setShowClosing(true);
      gsap.fromTo("#portrait-reveal", 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 3, ease: "power2.out" }
      );
    }, 800); 
    
    // Final navigation after 25s
    const finalTimer = setTimeout(onComplete, 25000);

    if (svg && document.body.contains(svg)) {
      document.body.removeChild(svg);
    }

    return () => {
      if (onResize) window.removeEventListener("resize", onResize);
      if (animId) cancelAnimationFrame(animId);
      if (closingTimer) clearTimeout(closingTimer);
      if (finalTimer) clearTimeout(finalTimer);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (mountRef.current && renderer?.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40"
      style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}
    >
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes hs-fall {
          0%   { transform: translateY(-30px) translateX(0) rotate(0deg) scale(1); opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 0.85; }
          100% { transform: translateY(105vh) translateX(var(--hs-drift)) rotate(var(--hs-spin)) scale(0.6); opacity: 0; }
        }
        @keyframes hs-sparkle-fall {
          0%   { transform: translateY(-10px) scale(0); opacity: 0; }
          15%  { transform: translateY(5vh) scale(1); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--hs-drift)) scale(0); opacity: 0; }
        }
        @keyframes hs-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 3px var(--hs-color)); }
          50%      { filter: drop-shadow(0 0 10px var(--hs-color)) drop-shadow(0 0 20px var(--hs-color)); }
        }
        @keyframes hs-fadein {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heartGrow {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Three.js canvas - moved to higher z-index to avoid being blocked by portrait */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 bg-transparent" 
        style={{ zIndex: 15, pointerEvents: "none" }}
      />

      {/* ── Beautiful falling elements (after 8s) ── */}
      {showClosing && fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${item.left}%`,
            zIndex: 25,
            pointerEvents: "none",
            animationName: item.type === "sparkle" ? "hs-sparkle-fall" : "hs-fall",
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationTimingFunction: item.type === "petal" ? "ease-in" : "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            ["--hs-drift" as string]: `${item.drift}px`,
            ["--hs-spin"  as string]: `${item.rotate * (Math.random() > 0.5 ? 1 : -1)}deg`,
            ["--hs-color" as string]: item.color,
          }}
        >
          {item.type === "petal" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24"
              style={{
                opacity: item.opacity,
                animationName: "hs-glow-pulse",
                animationDuration: `${1.5 + Math.random()}s`,
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
              }}
            >
              <ellipse cx="12" cy="11" rx="7" ry="10"
                fill={item.color} opacity="0.9" transform="rotate(15 12 11)" />
              <ellipse cx="12" cy="11" rx="4" ry="7"
                fill="hsl(350,100%,88%)" opacity="0.45" transform="rotate(15 12 11)" />
            </svg>
          )}

          {item.type === "heart" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24"
              style={{
                opacity: item.opacity,
                animationName: "hs-glow-pulse",
                animationDuration: `${1.2 + Math.random()}s`,
                animationIterationCount: "infinite",
                animationTimingFunction: "ease-in-out",
              }}
            >
              <path
                d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14 12 21 12 21Z"
                fill={item.color} opacity="0.95"
              />
              <path
                d="M12 18C12 18 5 12.5 5 8.5C5 6.57 6.57 5 8.5 5C10.07 5 11 6 12 7C13 6 13.93 5 15.5 5C17.43 5 19 6.57 19 8.5C19 12.5 12 18 12 18Z"
                fill="hsl(350,100%,85%)" opacity="0.3"
              />
            </svg>
          )}

          {item.type === "sparkle" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24"
              style={{ opacity: item.opacity }}
            >
              <path
                d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"
                fill={item.color} opacity="0.95"
              />
              <path
                d="M12 5L13 10.5L19 12L13 13.5L12 19L11 13.5L5 12L11 10.5Z"
                fill="hsl(50,100%,90%)" opacity="0.5"
              />
            </svg>
          )}
        </div>
      ))}

      {/* Portrait centered in heart, expanding from start */}
      <motion.img 
        id="portrait-reveal"
        src={PORTRAIT_IMAGE} 
        alt="Nanna"
        className="fixed z-10 pointer-events-none w-[310px] h-[310px] sm:w-[465px] sm:h-[465px] md:w-[620px] md:h-[620px] object-cover object-center !bg-transparent !border-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0)",
          opacity: 0,
          transformOrigin: "center center",
          maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 552'%3E%3Cpath fill='black' d='M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77'/%3E%3C/svg%3E")`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 552'%3E%3Cpath fill='black' d='M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77'/%3E%3C/svg%3E")`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </div>
  );
};

export default HeartScene;