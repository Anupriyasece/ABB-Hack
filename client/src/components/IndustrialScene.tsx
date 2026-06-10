'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { 
  Motor as RealMotor, 
  Pump as RealPump, 
  Valve as RealValve, 
  PressureSensor as RealPressureSensor, 
  TemperatureSensor as RealTemperatureSensor, 
  LinearActuator as RealLinearActuator, 
  RotaryActuator as RealRotaryActuator, 
  ConveyorBelt as RealConveyorBelt 
} from './IndustrialModels';

interface Equipment {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  status: 'active' | 'idle' | 'fault';
  health: number;
}

interface IndustrialSceneProps {
  equipment: Equipment[];
  selectedEquipmentId?: string;
  onEquipmentSelect?: (id: string) => void;
}

// 3D Pipe Routing Component
function Pipe({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const pStart = useMemo(() => new THREE.Vector3(...start), [start]);
  const pEnd = useMemo(() => new THREE.Vector3(...end), [end]);
  const distance = useMemo(() => pStart.distanceTo(pEnd), [pStart, pEnd]);
  const position = useMemo(() => pStart.clone().add(pEnd).multiplyScalar(0.5), [pStart, pEnd]);

  // Compute rotation alignment
  const quaternion = useMemo(() => {
    const direction = pEnd.clone().sub(pStart).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Quaternion().setFromUnitVectors(up, direction);
  }, [pStart, pEnd]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow>
      <cylinderGeometry args={[0.07, 0.07, distance, 16]} />
      <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// High-fidelity Storage Tank with Refracted Liquid level
function Tank({ position, rotation, status, health, selected, onClick }: any) {
  const fillLevel = status === 'active' ? 0.75 : 0.25;
  const statusColor = status === 'active' ? '#3498db' : status === 'idle' ? '#95a5a6' : '#e74c3c';
  const displayHealthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Tank transparent shell */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 2.4, 32]} />
        <meshPhysicalMaterial 
          color="#ecf0f1" 
          transparent 
          opacity={0.25} 
          roughness={0.1} 
          metalness={0.1} 
          transmission={0.7}
          ior={1.5}
        />
      </mesh>
      
      {/* Liquid volume inside */}
      <mesh position={[0, 1.2 * fillLevel, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 2.38 * fillLevel, 32]} />
        <meshStandardMaterial 
          color={statusColor} 
          transparent 
          opacity={0.8} 
          roughness={0.2} 
          metalness={0.1} 
          emissive={status === 'active' ? '#1d4ed8' : '#000'}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Structural support caps */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Support columns */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
          <meshStandardMaterial color="#34495e" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 2.6, 0]}>
          <torusGeometry args={[1.2, 0.04, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Health indicator bar */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.1]} />
        <meshStandardMaterial color={displayHealthColor} emissive={displayHealthColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 3D Motor Wrapper
function MotorWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const isRunning = status === 'active';
  const displayHealthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealMotor isRunning={isRunning} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.9, 0.04, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Health indicator bar */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.1]} />
        <meshStandardMaterial color={displayHealthColor} emissive={displayHealthColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 3D Pump Wrapper
function PumpWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const isRunning = status === 'active';
  const displayHealthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealPump isRunning={isRunning} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[1.0, 0.04, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Health indicator bar */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.1]} />
        <meshStandardMaterial color={displayHealthColor} emissive={displayHealthColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 3D Valve Wrapper
function ValveWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const isOpen = status === 'active';
  const displayHealthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealValve isOpen={isOpen} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.8, 0.04, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Health indicator bar */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.1]} />
        <meshStandardMaterial color={displayHealthColor} emissive={displayHealthColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// 3D Conveyor Wrapper
function ConveyorWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const isRunning = status === 'active';
  const displayHealthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealConveyorBelt isRunning={isRunning} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[1.7, 0.04, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}

      {/* Health indicator bar */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.1]} />
        <meshStandardMaterial color={displayHealthColor} emissive={displayHealthColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Pressure Sensor Wrapper
function PressureSensorWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const value = status === 'active' ? 75 : 10;
  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealPressureSensor value={value} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.4, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}
    </group>
  );
}

// Temperature Sensor Wrapper
function TemperatureSensorWrapper({ position, rotation, status, health, selected, onClick }: any) {
  const value = status === 'active' ? 65 : 22;
  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <RealTemperatureSensor value={value} />
      
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.4, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      )}
    </group>
  );
}

// Scene Content Component
function SceneContent({ equipment, selectedEquipmentId, onEquipmentSelect }: IndustrialSceneProps) {
  const { camera } = useThree();

  // Auto-fit camera to equipment
  useMemo(() => {
    if (equipment.length > 0 && camera instanceof THREE.PerspectiveCamera) {
      const box = new THREE.Box3();
      equipment.forEach((eq) => {
        box.expandByPoint(new THREE.Vector3(...eq.position));
      });
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;
      camera.position.set(0, cameraZ * 0.8, cameraZ);
      camera.lookAt(0, 0, 0);
    }
  }, [equipment, camera]);

  // Dynamically calculate pipe routes connecting Tanks to Pumps, and Pumps to Valves
  const pipeRoutes = useMemo(() => {
    const routes: Array<{ start: [number, number, number]; end: [number, number, number]; id: string }> = [];
    const tanks = equipment.filter(e => e.type === 'tank');
    const pumps = equipment.filter(e => e.type === 'pump');
    const valves = equipment.filter(e => e.type === 'valve');
    
    // Connect each Tank to the nearest Pump
    tanks.forEach((tank, tIdx) => {
      let nearestPump: any = null;
      let minDist = Infinity;
      pumps.forEach(pump => {
        const d = new THREE.Vector3(...tank.position).distanceTo(new THREE.Vector3(...pump.position));
        if (d < minDist) {
          minDist = d;
          nearestPump = pump;
        }
      });
      if (nearestPump) {
        routes.push({
          id: `pipe-tank-pump-${tIdx}`,
          start: [tank.position[0], tank.position[1] + 0.5, tank.position[2]],
          end: [nearestPump.position[0], nearestPump.position[1] + 0.5, nearestPump.position[2]],
        });
      }
    });
    
    // Connect each Pump to the nearest Valve
    pumps.forEach((pump, pIdx) => {
      let nearestValve: any = null;
      let minDist = Infinity;
      valves.forEach(valve => {
        const d = new THREE.Vector3(...pump.position).distanceTo(new THREE.Vector3(...valve.position));
        if (d < minDist) {
          minDist = d;
          nearestValve = valve;
        }
      });
      if (nearestValve) {
        routes.push({
          id: `pipe-pump-valve-${pIdx}`,
          start: [pump.position[0], pump.position[1] + 0.5, pump.position[2]],
          end: [nearestValve.position[0], nearestValve.position[1] + 0.3, nearestValve.position[2]],
        });
      }
    });
    
    return routes;
  }, [equipment]);

  return (
    <>
      {/* Ambient Lighting */}
      <ambientLight intensity={1.4} />
      
      {/* Main Directional Light */}
      <directionalLight 
        position={[12, 20, 12]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      {/* Fill directional light from opposite side */}
      <directionalLight 
        position={[-12, 12, -12]} 
        intensity={0.9} 
      />

      {/* Camera-front key light */}
      <directionalLight 
        position={[0, 10, 15]} 
        intensity={1.2} 
      />

      <hemisphereLight args={['#ffffff', '#444444', 1.0]} />

      {/* Grid Floor */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f1f2f6" roughness={0.7} metalness={0.1} />
      </mesh>
      <Grid 
        args={[60, 60]} 
        cellSize={1} 
        cellColor="#ced6e0" 
        sectionSize={5} 
        sectionColor="#a4b0be" 
        fadeDistance={45} 
        fadeStrength={1} 
      />

      {/* Connecting pipelines */}
      {pipeRoutes.map((route) => (
        <Pipe key={route.id} start={route.start} end={route.end} />
      ))}

      {/* Equipment Renderer */}
      {equipment.map((eq) => {
        const isSelected = eq.id === selectedEquipmentId;
        const handleClick = () => onEquipmentSelect?.(eq.id);

        switch (eq.type) {
          case 'tank':
            return <Tank key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'motor':
            return <MotorWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'pump':
            return <PumpWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'valve':
            return <ValveWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'conveyor':
            return <ConveyorWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'pressure_sensor':
            return <PressureSensorWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
          
          case 'temp_sensor':
            return <TemperatureSensorWrapper key={eq.id} position={eq.position} rotation={eq.rotation} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;

          case 'linear_actuator':
            return (
              <group key={eq.id} position={eq.position} rotation={eq.rotation} onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                <RealLinearActuator extended={eq.status === 'active'} />
                {isSelected && (
                  <mesh position={[0, 0.4, 0]}>
                    <torusGeometry args={[0.7, 0.03, 16, 100]} />
                    <meshBasicMaterial color="#00d9ff" />
                  </mesh>
                )}
              </group>
            );

          default:
            // Fallback generic motor mesh
            return <MotorWrapper key={eq.id} position={eq.position} status={eq.status} health={eq.health} selected={isSelected} onClick={handleClick} />;
        }
      })}

      {/* Orbit Controls */}
      <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.05} enableZoom enablePan />
    </>
  );
}

// Main Component
export function IndustrialScene(props: IndustrialSceneProps) {
  return (
    <Canvas shadows style={{ width: '100%', height: '100%' }}>
      <SceneContent {...props} />
    </Canvas>
  );
}

export default IndustrialScene;
