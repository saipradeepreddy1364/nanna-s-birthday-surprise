import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/nanna-potrait.jpeg";

interface HeartSceneProps {
  onComplete: () => void;
}

const HeartScene = ({ onComplete }: HeartSceneProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [showText, setShowText] = useState(false);

  // Particles count: 20000
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

    const vertices: THREE.Vector3[] = [];
    const originalPositions: THREE.Vector3[] = [];

    // Scale multiplier for particles to be OUTSIDE the image (1.05x)
    const scale = 25; 
    const margin = 1.05;

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      // Mathematical Heart Equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      
      const vector = new THREE.Vector3(x * scale * margin, (y * scale * margin) + 40, 0);
      vector.x += (Math.random() - 0.5) * 12;
      vector.y += (Math.random() - 0.5) * 12;
      vector.z += (Math.random() - 0.5) * 60;
      
      vertices.push(vector);
      originalPositions.push(vector.clone());
    }

    geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    material = new THREE.PointsMaterial({
      color: 0xff4d8d,
      size: 5,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.scale.set(0, 0, 0);
    scene.add(particles);

    // Animation: Start from point (scale 0) to full heart
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

  // Generate a matching SVG mask using the SAME mathematical heart equation
  // This ensures a 100% perfect fit with NO maroon borders
  const maskUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-20 -20 40 40'%3E%3Cpath fill='black' d='M0,13 C0,13 -16,13 -16,-5 C-16,-15 -8,-20 0,-10 C8,-20 16,-15 16,-5 C16,13 0,13 0,13 Z' transform='rotate(180) scale(1, 0.9)'/%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 z-40 bg-black flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}
    >
      {/* Background Particles Layer */}
      <div ref={mountRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* Centered Image Container */}
      <div className="relative z-10" style={{ transform: "translateY(-40px)" }}>
        <motion.img
          id="portrait-reveal"
          src={PORTRAIT_IMAGE}
          alt="Nanna"
          className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] object-cover !bg-transparent !border-none !shadow-none"
          style={{
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
      </div>

      {showText && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-30 px-4">
          <h1
            className="font-cursive text-4xl sm:text-5xl md:text-6xl text-center text-secondary animate-hs-fadein"
            style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}
          >
            Happy 21st Nanna 💝
          </h1>
        </div>
      )}

      <style>{`
        @keyframes hs-fadein {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default HeartScene;