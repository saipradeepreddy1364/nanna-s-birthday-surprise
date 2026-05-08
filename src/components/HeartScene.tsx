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

    // Particle timeline: NO repeat (stay formed)
    const tl = gsap.timeline();
    const vertices: THREE.Vector3[] = [];
    const originalPositions: THREE.Vector3[] = [];

    // Dense particles from your reference logic
    for (let i = 0; i < length; i += 0.1) {
      const point = path.getPointAtLength(i);
      // Particle multiplier 1.15 to sit perfectly outside the image
      const x = (point.x - 300) * 1.15;
      const y = (-(point.y - 276)) * 1.15;
      
      const vector = new THREE.Vector3(x, y + 40, 0);
      vector.x += (Math.random() - 0.5) * 12;
      vector.y += (Math.random() - 0.5) * 12;
      vector.z += (Math.random() - 0.5) * 60;
      vertices.push(vector);
      originalPositions.push(vector.clone());

      tl.from(vector, {
        x: 0,
        y: 40,
        z: 0,
        ease: "power2.out",
        duration: 2 + Math.random() * 2,
      }, i * 0.001); // Faster reveal
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

    // Shimmer and Sway loop
    gsap.fromTo(scene.rotation,
      { y: -0.1 },
      { y: 0.1, repeat: -1, yoyo: true, ease: "sine.inOut", duration: 5 }
    );

    let animId: number;
    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      // Add subtle shimmering movement to particles
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < vertices.length; i++) {
        const i3 = i * 3;
        const orig = vertices[i];
        // Minor shimmer offset
        positions[i3] = orig.x + Math.sin(time * 0.003 + i) * 1.5;
        positions[i3 + 1] = orig.y + Math.cos(time * 0.003 + i) * 1.5;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    render(0);

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
          { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }
        );
      }
    }, 2000); 

    const textTimer = setTimeout(() => setShowText(true), 4500);

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

  const maskUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 550'%3E%3Cpath fill='black' d='${HEART_SVG_PATH}'/%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 z-40"
      style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}
    >
      <style>{`
        @keyframes hs-fall {
          0%   { transform: translateY(-30px) translateX(0) opacity: 0; }
          6%   { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--hs-drift)) opacity: 0; }
        }
        @keyframes hs-fadein {
          0%   { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Three.js canvas for particles */}
      <div ref={mountRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Falling elements */}
      {showClosing && fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${item.left}%`,
            zIndex: 20,
            pointerEvents: "none",
            animation: `hs-fall ${item.duration}s ${item.delay}s linear infinite`,
            ["--hs-drift" as string]: `${item.drift}px`,
          }}
        >
          {item.type === "heart" && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" opacity={item.opacity}>
              <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14 12 21 12 21Z" fill={item.color} />
            </svg>
          )}
          {item.type === "petal" && (
            <div style={{ width: item.size, height: item.size, borderRadius: '50% 0 50% 0', background: item.color, opacity: item.opacity }} />
          )}
        </div>
      ))}

      {/* Portrait - Sized slightly smaller to fit PERFECTLY inside the shimmering ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="relative !bg-transparent" style={{ transform: "translateY(-40px)" }}>
          <motion.img 
            ref={portraitRef}
            src={PORTRAIT_IMAGE} 
            alt="Nanna"
            className="w-[260px] h-[238px] sm:w-[390px] sm:h-[358px] md:w-[520px] md:h-[478px] object-cover !bg-transparent !border-none !outline-none !shadow-none !p-0 !m-0"
            style={{
              opacity: 0,
              scale: 0,
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

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-40 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center"
            style={{
              color: "hsl(38, 70%, 55%)",
              opacity: 0,
              animation: "hs-fadein 2s ease forwards",
              textShadow: "0 0 20px rgba(0,0,0,0.8)",
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