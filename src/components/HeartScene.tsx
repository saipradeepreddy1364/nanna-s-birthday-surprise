import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

const HEART_SVG_PATH =
  "M300,140 C280,100 230,50 160,50 C70,50 0,120 0,210 C0,330 180,450 300,550 C420,450 600,330 600,210 C600,120 530,50 440,50 C370,50 320,100 300,140";

interface HeartSceneProps {
  onComplete: () => void;
}

const HeartScene = ({ onComplete }: HeartSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<SVGImageElement>(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const length = path.getTotalLength();
    document.body.removeChild(svg);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = 20000; // Optimized count for performance
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const distance = (i / particleCount) * length;
      const point = path.getPointAtLength(distance);
      
      // Target position: Heart frame (1.18x larger)
      targetPositions[i3] = (point.x - 300) * 1.18;
      targetPositions[i3 + 1] = (-(point.y - 276)) * 1.18 + 40;
      targetPositions[i3 + 2] = (Math.random() - 0.5) * 50;

      // Start position: Center point
      positions[i3] = 0;
      positions[i3 + 1] = 40;
      positions[i3 + 2] = 0;

      originalPositions[i3] = targetPositions[i3];
      originalPositions[i3 + 1] = targetPositions[i3 + 1];
      originalPositions[i3 + 2] = targetPositions[i3 + 2];
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xee5282,
      blending: THREE.AdditiveBlending,
      size: 4,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Optimized Animation using GSAP on the positions directly
    const animObj = { progress: 0 };
    gsap.to(animObj, {
      progress: 1,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        const pos = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          pos[i3] = targetPositions[i3] * animObj.progress;
          pos[i3 + 1] = 40 + (targetPositions[i3 + 1] - 40) * animObj.progress;
          pos[i3 + 2] = targetPositions[i3 + 2] * animObj.progress;
        }
        geometry.attributes.position.needsUpdate = true;
      }
    });

    // Shimmer effect loop
    let animId: number;
    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (animObj.progress >= 0.9) {
        const pos = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          pos[i3] += Math.sin(time * 0.003 + i) * 0.1;
          pos[i3 + 1] += Math.cos(time * 0.003 + i) * 0.1;
        }
        geometry.attributes.position.needsUpdate = true;
      }
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
      if (portraitRef.current) {
        gsap.to(portraitRef.current, { opacity: 1, duration: 2.5, ease: "power2.out" });
      }
    }, 1500);

    const textTimer = setTimeout(() => setShowText(true), 4000);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(revealTimer);
      clearTimeout(textTimer);
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
        @keyframes hs-fadein {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div ref={mountRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Portrait Reveal - Using SVG ClipPath for sharp, zero-border perfection */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <svg 
          viewBox="0 0 600 550" 
          className="w-[280px] h-[256px] sm:w-[420px] sm:h-[385px] md:w-[560px] md:h-[513px]"
          style={{ transform: "translateY(-40px)", overflow: "visible" }}
        >
          <defs>
            <clipPath id="heart-clip">
              <path d={HEART_SVG_PATH} />
            </clipPath>
          </defs>
          <image
            ref={portraitRef}
            href={PORTRAIT_IMAGE}
            width="600"
            height="550"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#heart-clip)"
            style={{ opacity: 0 }}
          />
        </svg>
      </div>

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-40 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center"
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