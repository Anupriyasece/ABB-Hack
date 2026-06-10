import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Motor Component - Realistic 3-phase AC motor (Z-aligned, sits on y=0)
export function Motor({ position, rotation, isRunning }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (rotorRef.current && isRunning) {
      rotorRef.current.rotation.z += 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Motor Housing (Main Body) - Centered at y=0.5, Z-aligned */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 1.0, 32]} />
        <meshStandardMaterial color="#3498db" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Cooling fins */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`fin-${i}`} position={[0, 0.5, (i - 2.5) * 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
          <meshStandardMaterial color="#2980b9" metalness={0.2} roughness={0.4} />
        </mesh>
      ))}

      {/* Motor Shaft (extending forward along Z) */}
      <mesh position={[0, 0.5, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rotor (spinning part inside casing) */}
      <group ref={rotorRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="#d35400" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* End Caps */}
      <mesh position={[0, 0.5, -0.52]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.05, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.52]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.05, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Connection box on top */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.25]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Mounting Feet - from y=0 to y=0.1 */}
      {[
        [-0.35, 0.05, -0.3],
        [0.35, 0.05, -0.3],
        [-0.35, 0.05, 0.3],
        [0.35, 0.05, 0.3],
      ].map((pos, i) => (
        <mesh key={`foot-${i}`} position={pos as any} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.2]} />
          <meshStandardMaterial color="#1a252f" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Pump Component - Centrifugal pump (Z-aligned, sits on y=0)
export function Pump({ position, rotation, isRunning }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const impellerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (impellerRef.current && isRunning) {
      impellerRef.current.rotation.z += 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Pump Base Plate - from y=0 to y=0.1 */}
      <mesh position={[0, 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.8, 0.1, 1.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Pump Casing (Volute) - centered at y=0.5, Z-aligned */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.35, 32]} />
        <meshStandardMaterial color="#e67e22" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Discharge Nozzle - pointing straight up */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#d35400" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Suction Nozzle - pointing forward (+Z) */}
      <mesh position={[0, 0.5, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
        <meshStandardMaterial color="#d35400" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Bearing Frame - behind casing, centered at y=0.5 */}
      <mesh position={[0, 0.5, -0.35]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Shaft (extending backward to couple with Motor) */}
      <mesh position={[0, 0.5, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Impeller (inside the casing) */}
      <group ref={impellerRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Valve Component - Ball valve (X-aligned, centered at y=0.3)
export function Valve({ position, rotation, isOpen }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Valve Body (spherical, centered at y=0.3) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Side pipes (along X-axis) */}
      <mesh position={[-0.35, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} />
        <meshStandardMaterial color="#c0392b" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0.35, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} />
        <meshStandardMaterial color="#c0392b" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Flanges */}
      <mesh position={[-0.45, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 12]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Handle (at y=0.65) */}
      <group position={[0, 0.65, 0]} rotation={[0, isOpen ? 0 : Math.PI / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.03, 0.06]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.25, 0.05, 0.08]} />
          <meshStandardMaterial color="#e67e22" metalness={0.1} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// Pressure Sensor Component (Dial faces forward, base at y=0)
export function PressureSensor({ position, rotation, value }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base NPT Thread */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hex adapter block */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 6]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Gauge Neck */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Dial Casing (yellow, face forward along +Z) */}
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 24]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Dial Face */}
      <mesh position={[0, 0.52, 0.052]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.01, 24]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Indicator needle */}
      <group position={[0, 0.52, 0.058]} rotation={[0, 0, -((value / 100) * Math.PI * 1.5) + (Math.PI * 0.75)]}>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.015, 0.14, 0.004]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// Temperature Sensor Component (Probe head at y=0.35)
export function TemperatureSensor({ position, rotation, value }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Probe insertion shaft */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Connection Head (orange, sits at y=0.35) */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.24, 16]} />
        <meshStandardMaterial color="#e67e22" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        <meshStandardMaterial color="#d35400" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Conduit elbow */}
      <mesh position={[0.14, 0.32, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 12]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* LED indicator */}
      <mesh position={[0, 0.32, 0.17]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={value > 60 ? "#e74c3c" : value > 40 ? "#f1c40f" : "#2ecc71"}
          emissive={value > 60 ? "#c0392b" : value > 40 ? "#d68910" : "#27ae60"}
          emissiveIntensity={1.0}
        />
      </mesh>
    </group>
  );
}

// Linear Actuator Component (Horizontal along Z, centered at y=0.3)
export function LinearActuator({ position, rotation, extended }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base clevis mount */}
      <mesh position={[0, 0.3, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Actuator Cylinder (pneumatic body) */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Cylinder cap bands */}
      <mesh position={[0, 0.3, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, -0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Piston Rod (extends out the front) */}
      <mesh position={[0, 0.3, extended ? 0.38 : 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.58, 12]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rod Clevis (Head) */}
      <mesh position={[0, 0.3, extended ? 0.65 : 0.35]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Rotary Actuator Component
export function RotaryActuator({ position, rotation, angle }: any) {
  return (
    <group position={position} rotation={rotation}>
      {/* Actuator Main Housing (yellow, sits at y=0.3) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Output Shaft */}
      <mesh position={[0, 0.58, 0]} rotation={[0, angle || 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Position indicator plate */}
      <mesh position={[0, 0.49, 0]} rotation={[0, angle || 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Piping adapter plates */}
      <mesh position={[0, 0.3, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Conveyor Belt Component - sits perfectly on y=0
export function ConveyorBelt({ position, rotation, isRunning }: any) {
  const beltRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (beltRef.current && isRunning) {
      beltRef.current.position.x = (beltRef.current.position.x + 0.02) % 0.8;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Side steel channels - centered at y=0.8 */}
      <mesh position={[0, 0.8, 0.35]} castShadow>
        <boxGeometry args={[3.2, 0.2, 0.04]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, -0.35]} castShadow>
        <boxGeometry args={[3.2, 0.2, 0.04]} />
        <meshStandardMaterial color="#95a5a6" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* End roller cylinders - at y=0.8 */}
      <mesh position={[-1.5, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.66, 32]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.5, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.66, 32]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Conveyor Rubber Bed - at y=0.9 */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[3.0, 0.02, 0.65]} />
        <meshStandardMaterial color="#1e272e" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Leg Supports - from y=0 to y=0.7 */}
      {[
        [-1.3, 0.35, -0.3],
        [-1.3, 0.35, 0.3],
        [1.3, 0.35, -0.3],
        [1.3, 0.35, 0.3],
      ].map((pos, i) => (
        <mesh key={`leg-${i}`} position={pos as any} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Conveyor motor drive unit - centered at y=0.8 */}
      <mesh position={[-1.5, 0.8, -0.48]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.25]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Active boxes on the belt */}
      <group ref={beltRef}>
        {[...Array(3)].map((_, i) => (
          <mesh key={`box-${i}`} position={[(i - 1) * 1.0, 1.02, 0]} castShadow>
            <boxGeometry args={[0.24, 0.18, 0.24]} />
            <meshStandardMaterial color="#d35400" metalness={0.1} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
