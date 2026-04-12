import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const PORTRAIT_IMAGE = "/placeholder.svg"; // Replace with Nanna's portrait

const HEART_SVG_PATH =
  "M300,107.77C284.68,55.67,239.76,0,162.31,0,64.83,0,0,82.08,0,171.71c0,.48,0,.95,0,1.43-.52,19.5,0,217.94,299.87,379.69v0l0,0,.05,0,0,0,0,0v0C600,391.08,600.48,192.64,600,173.14c0-.48,0-.95,0-1.43C600,82.08,535.17,0,437.69,0,360.24,0,315.32,55.67,300,107.77";

const HeartScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create hidden SVG to sample path
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 600 552");
    svg.style.position = "absolute";
    svg.style.display = "none";
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", HEART_SVG_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const length = path.getTotalLength();

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Particles
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    const vertices: THREE.Vector3[] = [];

    for (let i = 0; i < length; i += 0.1) {
      const point = path.getPointAtLength(i);
      const vector = new THREE.Vector3(point.x, -point.y, 0);
      vector.x += (Math.random() - 0.5) * 30;
      vector.y += (Math.random() - 0.5) * 30;
      vector.z += (Math.random() - 0.5) * 70;
      vertices.push(vector);

      tl.from(
        vector,
        {
          x: 600 / 2,
          y: -552 / 2,
          z: 0,
          ease: "power2.inOut",
          duration: 2 + Math.random() * 3,
        },
        i * 0.002
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({
      color: 0xee5282,
      blending: THREE.AdditiveBlending,
      size: 3,
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.x -= 600 / 2;
    particles.position.y += 552 / 2;
    scene.add(particles);

    gsap.fromTo(
      scene.rotation,
      { y: -0.2 },
      { y: 0.2, repeat: -1, yoyo: true, ease: "power2.inOut", duration: 3 }
    );

    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      geometry.setFromPoints(vertices);
      controls.update();
      renderer.render(scene, camera);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(render);

    // Show closing after 8s
    const closingTimer = setTimeout(() => {
      setShowClosing(true);
      setConfetti(
        Array.from({ length: 40 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: ["#ee5282", "#d4a843", "#f5c6d0", "#ffd700", "#ff69b4"][
            Math.floor(Math.random() * 5)
          ],
          delay: Math.random() * 2,
        }))
      );
    }, 8000);

    // Cleanup
    document.body.removeChild(svg);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      clearTimeout(closingTimer);
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
    <div className="fixed inset-0 z-40" style={{ background: "linear-gradient(135deg, hsl(340, 30%, 8%) 0%, hsl(342, 40%, 12%) 100%)" }}>
      <div ref={mountRef} className="absolute inset-0" />

      {/* Portrait in center of heart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden animate-heartbeat"
          style={{
            border: "3px solid hsl(342, 82%, 56%)",
            boxShadow: "0 0 30px hsl(342, 82%, 56%, 0.5)",
          }}
        >
          <img src={PORTRAIT_IMAGE} alt="Nanna" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Closing text */}
      {showClosing && (
        <>
          {/* Confetti */}
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute top-0 w-3 h-3 rounded-sm animate-confetti z-30"
              style={{
                left: `${c.left}%`,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}

          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{
              animation: "heartbeat 2s ease-in-out infinite",
            }}
          >
            <h1
              className="font-cursive text-5xl sm:text-7xl md:text-9xl text-center px-4 glow-gold"
              style={{
                color: "hsl(38, 70%, 55%)",
                opacity: 0,
                animation: "fade-in 2s ease forwards",
              }}
            >
              Happy 21st Nanna 💝
            </h1>
          </div>
        </>
      )}
    </div>
  );
};

export default HeartScene;