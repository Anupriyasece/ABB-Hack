import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Equipment {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  status: "active" | "idle" | "error";
}

interface ThreeDSceneProps {
  equipment: Equipment[];
  isSimulating: boolean;
  simulationTime: number;
}

export default function ThreeDScene({ equipment, isSimulating, simulationTime }: ThreeDSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const equipmentMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 100, 1000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x475569, 0x334155);
    scene.add(gridHelper);

    // Create equipment meshes
    equipment.forEach((eq) => {
      const statusColors: Record<string, number> = {
        active: 0x10b981,
        idle: 0x94a3b8,
        error: 0xef4444,
      };

      const geometry = new THREE.BoxGeometry(4, 4, 4);
      const material = new THREE.MeshStandardMaterial({
        color: statusColors[eq.status] || 0x3b82f6,
        roughness: 0.4,
        metalness: 0.6,
        emissive: statusColors[eq.status],
        emissiveIntensity: eq.status === "active" ? 0.3 : 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(eq.x, 2, eq.y);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: eq.id, status: eq.status };

      scene.add(mesh);
      equipmentMeshesRef.current.set(eq.id, mesh);

      // Add label
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(eq.name, 128, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const labelGeometry = new THREE.PlaneGeometry(8, 4);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.set(eq.x, 6, eq.y);
      scene.add(labelMesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate equipment meshes
      equipmentMeshesRef.current.forEach((mesh) => {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;

        // Pulse effect for active equipment
        if (mesh.userData.status === "active") {
          const scale = 1 + Math.sin(simulationTime * 0.05) * 0.1;
          mesh.scale.set(scale, scale, scale);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      // Rotate camera around scene
      const angle = (simulationTime * 0.01) % (Math.PI * 2);
      camera.position.x = Math.cos(angle) * 50;
      camera.position.z = Math.sin(angle) * 50;
      camera.lookAt(0, 5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [equipment, simulationTime]);

  return <div ref={containerRef} className="w-full h-full" />;
}
