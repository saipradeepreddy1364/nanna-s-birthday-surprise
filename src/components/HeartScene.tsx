import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

const HEART_SVG_PATH =
  "M300,480 C150,380 20,280 20,170 C20,90 80,30 160,30 C210,30 255,55 300,100 C345,55 390,30 440,30 C520,30 580,90 580,170 C580,280 450,380 300,480 Z";

interface HeartSceneProps {
  onComplete: () => void;
}

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

const HeartScene = ({ onComplete }: HeartSceneProps) => {
  const mountRef    = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<SVGImageElement>(null);
  const [showText, setShowText]       = useState(false);
  const [showFalling, setShowFalling] = useState(false);

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

    const svgNS = "http://www.w3.org/2000/svg";
    const svg   = document.createElementNS(svgNS, "svg");
    const path  = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const length = path.getTotalLength();
    document.body.removeChild(svg);

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 20000;
    const vertices: THREE.Vector3[] = [];
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    for (let i = 0; i < particleCount; i++) {
      const distance = (i / particleCount) * length;
      const point    = path.getPointAtLength(distance);
      const x = (point.x - 300) * 0.63;
      const y = (-(point.y - 255)) * 0.63 + 20;
      const vector = new THREE.Vector3(x, y, (Math.random() - 0.5) * 14);
      vector.x += (Math.random() - 0.5) * 10;
      vector.y += (Math.random() - 0.5) * 10;
      vertices.push(vector);
      tl.from(vector, {
        x: 0, y: 20, z: 0,
        duration: 2 + Math.random() * 2,
        ease: "power2.inOut",
      }, i * 0.0001);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({
      color: 0xff4d8a, blending: THREE.AdditiveBlending,
      size: 6, transparent: true, opacity: 1.0,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    gsap.fromTo(scene.rotation,
      { y: -0.1 },
      { y: 0.1, repeat: -1, yoyo: true, ease: "sine.inOut", duration: 4 }
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
      if (portraitRef.current) {
        gsap.to(portraitRef.current, { opacity: 1, duration: 2.5, ease: "power2.out" });
      }
    }, 1500);

    const textTimer    = setTimeout(() => setShowText(true),    4000);
    const fallingTimer = setTimeout(() => setShowFalling(true), 4500);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(revealTimer);
      clearTimeout(textTimer);
      clearTimeout(fallingTimer);
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
      style={{
        background: "linear-gradient(135deg, #0d0520 0%, #160830 50%, #0a031a 100%)",
      }}
    >
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
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartbeat-scale {
          0%, 100% { transform: translateY(-20px) scale(1);     }
          15%      { transform: translateY(-20px) scale(1.035); }
          30%      { transform: translateY(-20px) scale(1);     }
          45%      { transform: translateY(-20px) scale(1.02);  }
          60%      { transform: translateY(-20px) scale(1);     }
        }
      `}</style>

      {/*
        Z-INDEX STACK (low → high):
          base             → dark background (this div)
          z-30             → Three.js particle heart (mountRef)
          z-50             → Heart portrait SVG
          z-55             → Falling petals / hearts / sparkles  ← FIX: was z-25 (behind particles & portrait)
          z-60             → Birthday text                        ← FIX: was z-40 (behind portrait)
      */}

      {/* Three.js canvas — sits behind portrait so particles glow around its edges */}
      <div ref={mountRef} className="absolute inset-0 z-30 pointer-events-none" />

      {/* Heart portrait */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <div style={{ animation: "heartbeat-scale 2.5s ease-in-out infinite" }}>
          <svg
            viewBox="0 0 600 510"
            className="w-[230px] h-[196px] sm:w-[340px] sm:h-[289px] md:w-[430px] md:h-[366px]"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="heart-clip-main">
                <path d={HEART_SVG_PATH} />
              </clipPath>
            </defs>

            <image
              ref={portraitRef}
              href={PORTRAIT_IMAGE}
              x="0"
              y="0"
              width="600"
              height="510"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#heart-clip-main)"
              style={{ opacity: 0 }}
            />
          </svg>
        </div>
      </div>

      {/* Falling petals / hearts / sparkles — FIX: z-index 55, in front of portrait */}
      {showFalling && fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${item.left}%`,
            zIndex: 55,                          // ← was 25
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

      {/* Birthday text — FIX: z-60, above everything */}
      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-60 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center"
            style={{
              color: "hsl(38, 70%, 55%)",
              opacity: 0,
              animation: "hs-fadein 2s ease forwards",
              textShadow:
                "0 0 20px rgba(0,0,0,0.9), 0 0 30px hsla(38,70%,55%,0.4), 0 0 60px hsla(342,82%,56%,0.3)",
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