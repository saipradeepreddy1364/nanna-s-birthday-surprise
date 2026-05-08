import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

const HEART_SVG_PATH =
  "M300,140 C280,100 230,50 160,50 C70,50 0,120 0,210 C0,330 180,450 300,550 C420,450 600,330 600,210 C600,120 530,50 440,50 C370,50 320,100 300,140";

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
  const portraitRef = useRef<HTMLImageElement>(null);
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

    // Dense particles: i += 0.04 for high resolution (~45,000 particles)
    for (let i = 0; i < length; i += 0.04) {
      const point = path.getPointAtLength(i);
      const x = (point.x - 300) * 1.18; // Slightly larger frame for zero overlap
      const y = (-(point.y - 276)) * 1.18;
      
      const vector = new THREE.Vector3(x, y + 40, 0);
      vector.x += (Math.random() - 0.5) * 15;
      vector.y += (Math.random() - 0.5) * 15;
      vector.z += (Math.random() - 0.5) * 70;
      vertices.push(vector);

      tl.from(vector, {
        x: 0,
        y: 40,
        z: 0,
        ease: "power2.inOut",
        duration: 2 + Math.random() * 3,
      }, i * 0.0004);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({
      color: 0xee5282,
      blending: THREE.AdditiveBlending,
      size: 3.5,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    gsap.fromTo(scene.rotation,
      { y: -0.15 },
      { y: 0.15, repeat: -1, yoyo: true, ease: "power2.inOut", duration: 3 }
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

    const revealTimer = setTimeout(() => {
      setShowClosing(true);
      if (portraitRef.current) {
        gsap.fromTo(portraitRef.current, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 2.5, ease: "power2.out" }
        );
      }
    }, 1500); 

    const textTimer = setTimeout(() => setShowText(true), 4000);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(revealTimer);
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

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0208 0%, #1a0209 100%)" }}
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

      {/* Persistent Clip Path for the Photo */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.25 C0.46,0.18 0.38,0.09 0.26,0.09 C0.11,0.09 0,0.21 0,0.38 C0,0.6 0.3,0.81 0.5,1 C0.7,0.81 1,0.6 1,0.38 C1,0.21 0.88,0.09 0.73,0.09 C0.61,0.09 0.53,0.18 0.5,0.25" />
          </clipPath>
        </defs>
      </svg>

      {/* Three.js Particle Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Portrait - Using CLIP-PATH for zero-border perfection (Z-50 to be on top) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <motion.img 
          ref={portraitRef}
          src={PORTRAIT_IMAGE} 
          alt="Nanna"
          className="w-[280px] h-[256px] sm:w-[420px] sm:h-[385px] md:w-[560px] md:h-[513px] object-cover"
          style={{
            opacity: 0,
            scale: 0,
            clipPath: "url(#heart-clip)",
            WebkitClipPath: "url(#heart-clip)",
            background: "none",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            boxShadow: "none",
            filter: "none",
            transform: "translateY(-40px)",
          }}
        />
      </div>

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-40 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center glow-gold"
            style={{
              color: "hsl(38, 70%, 55%)",
              opacity: 0,
              animation: "hs-fadein 2s ease forwards",
              textShadow: "0 0 20px rgba(0,0,0,0.9)",
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