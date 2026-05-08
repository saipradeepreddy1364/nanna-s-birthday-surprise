import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

// Shallow heart path as requested earlier
const HEART_SVG_PATH =
  "M300,140 C280,100 230,50 160,50 C70,50 0,120 0,210 C0,330 180,450 300,550 C420,450 600,330 600,210 C600,120 530,50 440,50 C370,50 320,100 300,140";

interface HeartSceneProps {
  onComplete: () => void;
}

const HeartScene = ({ onComplete }: HeartSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [showText, setShowText] = useState(false);

  const particleCount = 20000;

  useEffect(() => {
    if (!mountRef.current) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer;
    let geometry: THREE.BufferGeometry;
    let material: THREE.PointsMaterial;

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

    for (let i = 0; i < particleCount; i++) {
      const distance = Math.random() * pathLength;
      const point = path.getPointAtLength(distance);
      
      // Multiplier 1.05 to sit perfectly OUTSIDE the image
      const x = (point.x - 300) * 1.05;
      const y = (-(point.y - 276)) * 1.05;
      
      const vector = new THREE.Vector3(x, y + 40, 0); 
      vector.x += (Math.random() - 0.5) * 12;
      vector.y += (Math.random() - 0.5) * 12;
      vector.z += (Math.random() - 0.5) * 60;
      
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

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    setTimeout(() => {
      setShowClosing(true);
      gsap.fromTo("#portrait-reveal", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.5, ease: "power2.out" });
    }, 1500);

    setTimeout(() => setShowText(true), 4000);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animId) cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (mountRef.current && renderer?.domElement) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const maskUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 550'%3E%3Cpath fill='black' d='${HEART_SVG_PATH}'/%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}
    >
      <div ref={mountRef} className="absolute inset-0 z-20 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center" style={{ transform: "translateY(-40px)" }}>
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

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-30 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center text-secondary"
            style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}
          >
            Happy 21st Nanna 💝
          </h1>
        </div>
      )}
    </div>
  );
};

export default HeartScene;