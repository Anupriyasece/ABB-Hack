import { useRoute } from "wouter";
import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import IndustrialScene from "@/components/IndustrialScene";
import SystemExplorer from "@/components/SystemExplorer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

interface Asset {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "fault";
  health: number;
  description: string;
}

export default function DigitalTwinDashboard() {
  const [, params] = useRoute("/dashboard/:programId/digital-twin");
  const programId = params?.programId ? parseInt(params.programId) : 0;
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showFaults, setShowFaults] = useState(true);
  const { theme } = useTheme();

  const { data: parsedData, isLoading, error } = trpc.plc.getParsedData.useQuery(
    { programId },
    { enabled: !!programId }
  );

  // Generate assets from parsed data
  const { assets, predictions } = useMemo(() => {
    if (!parsedData) return { assets: [], predictions: [] };

    const generatedAssets: Asset[] = [];
    const generatedPredictions: string[] = [];

    // Generate equipment assets
    if (Array.isArray(parsedData.equipment)) {
      parsedData.equipment.forEach((eq: any, idx: number) => {
        generatedAssets.push({
          id: `eq-${idx}`,
          name: eq.name || `Equipment_${idx + 1}`,
          type: eq.type || "equipment",
          status: Math.random() > 0.8 ? "fault" : Math.random() > 0.3 ? "active" : "idle",
          health: Math.floor(Math.random() * 30) + 70,
          description: eq.description || `Industrial equipment unit ${idx + 1}`,
        });
      });
    }

    // Generate sensor assets
    if (Array.isArray(parsedData.sensors)) {
      parsedData.sensors.forEach((sensor: any, idx: number) => {
        generatedAssets.push({
          id: `sensor-${idx}`,
          name: sensor.name || `Sensor_${idx + 1}`,
          type: "sensor",
          status: "active",
          health: Math.floor(Math.random() * 20) + 80,
          description: sensor.description || `Sensor unit ${idx + 1}`,
        });
      });
    }

    // Generate actuator assets
    if (Array.isArray(parsedData.actuators)) {
      parsedData.actuators.forEach((actuator: any, idx: number) => {
        generatedAssets.push({
          id: `actuator-${idx}`,
          name: actuator.name || `Actuator_${idx + 1}`,
          type: "actuator",
          status: Math.random() > 0.9 ? "fault" : "active",
          health: Math.floor(Math.random() * 25) + 75,
          description: actuator.description || `Actuator unit ${idx + 1}`,
        });
      });
    }

    // Generate predictions from alarms
    if (Array.isArray(parsedData.alarms)) {
      parsedData.alarms.slice(0, 3).forEach((alarm: any) => {
        generatedPredictions.push(
          `⚠ ${alarm.name || "Equipment"} may experience operational issues.`
        );
      });
    }

    // Add sample predictions if none exist
    if (generatedPredictions.length === 0) {
      generatedPredictions.push(
        "⚠ Motor_M1 may experience overload conditions.",
        "⚠ Valve_V3 shows abnormal switching frequency.",
        "⚠ Conveyor_C1 exhibits excessive start-stop cycles."
      );
    }

    return { assets: generatedAssets, predictions: generatedPredictions };
  }, [parsedData]);

  // Convert assets to equipment format for 3D scene
  const sceneEquipment = useMemo(() => {
    // Group and categorize assets for semantic positioning
    const tanks = assets.filter(a => a.name.toLowerCase().includes("tank"));
    const motors = assets.filter(a => a.name.toLowerCase().includes("motor"));
    const pumps = assets.filter(a => a.name.toLowerCase().includes("pump"));
    const valves = assets.filter(a => a.name.toLowerCase().includes("valve"));
    const conveyors = assets.filter(a => a.name.toLowerCase().includes("conveyor"));
    
    const sensors = assets.filter(a => a.type === "sensor");
    const actuators = assets.filter(a => 
      a.type === "actuator" && 
      !a.name.toLowerCase().includes("motor") && 
      !a.name.toLowerCase().includes("pump") && 
      !a.name.toLowerCase().includes("valve")
    );

    const layoutList: any[] = [];
    const usedIds = new Set<string>();

    // 1. Tanks - Positioned in a back row
    tanks.forEach((tank, idx) => {
      const x = (idx - (tanks.length - 1) / 2) * 8;
      layoutList.push({
        id: tank.id,
        name: tank.name,
        type: "tank",
        position: [x, 0, -6] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        status: tank.status,
        health: tank.health,
        description: tank.description,
      });
      usedIds.add(tank.id);
    });

    // 2. Pumps - Positioned in the middle row, with paired Motors
    pumps.forEach((pump, idx) => {
      const x = (idx - (pumps.length - 1) / 2) * 6;
      layoutList.push({
        id: pump.id,
        name: pump.name,
        type: "pump",
        position: [x, 0, 0] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number],
        status: pump.status,
        health: pump.health,
        description: pump.description,
      });
      usedIds.add(pump.id);

      // Pair a Motor next to this Pump
      const pairedMotor = motors[idx];
      if (pairedMotor) {
        layoutList.push({
          id: pairedMotor.id,
          name: pairedMotor.name,
          type: "motor",
          position: [x, 0, 1.2] as [number, number, number],
          rotation: [0, Math.PI, 0] as [number, number, number],
          status: pairedMotor.status,
          health: pairedMotor.health,
          description: pairedMotor.description,
        });
        usedIds.add(pairedMotor.id);
      }
    });

    // 3. Unpaired Motors
    motors.forEach((motor) => {
      if (!usedIds.has(motor.id)) {
        const idx = layoutList.filter(item => item.type === "motor").length;
        const x = (idx - (motors.length - 1) / 2) * 4;
        layoutList.push({
          id: motor.id,
          name: motor.name,
          type: "motor",
          position: [x, 0, 3] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          status: motor.status,
          health: motor.health,
          description: motor.description,
        });
        usedIds.add(motor.id);
      }
    });

    // 4. Valves - Positioned in-line (e.g. between Pumps and Tanks)
    valves.forEach((valve, idx) => {
      const x = (idx - (valves.length - 1) / 2) * 5;
      layoutList.push({
        id: valve.id,
        name: valve.name,
        type: "valve",
        position: [x - 2, 0, -3] as [number, number, number],
        rotation: [0, Math.PI / 2, 0] as [number, number, number],
        status: valve.status,
        health: valve.health,
        description: valve.description,
      });
      usedIds.add(valve.id);
    });

    // 5. Conveyors - Positioned in the front row
    conveyors.forEach((conveyor, idx) => {
      const x = (idx - (conveyors.length - 1) / 2) * 8;
      layoutList.push({
        id: conveyor.id,
        name: conveyor.name,
        type: "conveyor",
        position: [x, 0, 5] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        status: conveyor.status,
        health: conveyor.health,
        description: conveyor.description,
      });
      usedIds.add(conveyor.id);
    });

    // 6. Sensors - Mounted on top of/close to the parent machine they monitor
    sensors.forEach((sensor) => {
      const descLower = (sensor.description || "").toLowerCase();
      // Try to match parent equipment name in description
      let parent = layoutList.find(item => descLower.includes(item.name.toLowerCase()));
      if (!parent) {
        // Fallback: match by sensor name words (e.g. "Motor Temp" -> parent contains "Motor")
        const words = sensor.name.toLowerCase().split(/[_\s]/);
        parent = layoutList.find(item => words.some(w => w.length > 2 && item.name.toLowerCase().includes(w)));
      }

      const refinedType = sensor.name.toLowerCase().includes("temp") ? "temp_sensor" : "pressure_sensor";

      if (parent) {
        // Mount it slightly offset on top of the parent
        layoutList.push({
          id: sensor.id,
          name: sensor.name,
          type: refinedType,
          position: [parent.position[0], parent.position[1] + 1.1, parent.position[2] - 0.4] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          status: sensor.status,
          health: sensor.health,
          description: sensor.description,
        });
      } else {
        // Position scattered in side control panel area
        const idx = layoutList.filter(item => item.type === "temp_sensor" || item.type === "pressure_sensor").length;
        layoutList.push({
          id: sensor.id,
          name: sensor.name,
          type: refinedType,
          position: [-8, 0, idx * 2 - 4] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          status: sensor.status,
          health: sensor.health,
          description: sensor.description,
        });
      }
      usedIds.add(sensor.id);
    });

    // 7. Actuators - Positioned near the parent machine they control
    actuators.forEach((actuator) => {
      const descLower = (actuator.description || "").toLowerCase();
      let parent = layoutList.find(item => descLower.includes(item.name.toLowerCase()));
      if (!parent) {
        const words = actuator.name.toLowerCase().split(/[_\s]/);
        parent = layoutList.find(item => words.some(w => w.length > 2 && item.name.toLowerCase().includes(w)));
      }

      if (parent) {
        layoutList.push({
          id: actuator.id,
          name: actuator.name,
          type: "linear_actuator",
          position: [parent.position[0] - 1.0, parent.position[1], parent.position[2]] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
          status: actuator.status,
          health: actuator.health,
          description: actuator.description,
        });
      } else {
        const idx = layoutList.filter(item => item.type === "linear_actuator").length;
        layoutList.push({
          id: actuator.id,
          name: actuator.name,
          type: "linear_actuator",
          position: [8, 0, idx * 2 - 4] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number],
          status: actuator.status,
          health: actuator.health,
          description: actuator.description,
        });
      }
      usedIds.add(actuator.id);
    });

    // 8. Fallback for any leftover assets
    assets.forEach((asset) => {
      if (!usedIds.has(asset.id)) {
        const idx = layoutList.length;
        layoutList.push({
          id: asset.id,
          name: asset.name,
          type: "motor",
          position: [Math.sin(idx) * 5, 0, Math.cos(idx) * 5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          status: asset.status,
          health: asset.health,
          description: asset.description,
        });
      }
    });

    return layoutList;
  }, [assets]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900 dark:text-red-400">
                Error Loading Digital Twin
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-red-800 dark:text-red-300">
            {error.message || "Failed to load digital twin data."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const bgClass = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900";
  const panelBgClass = theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200";
  const toolbarBgClass = theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const textColorClass = theme === "dark" ? "text-cyan-400" : "text-blue-600";
  const secondaryTextClass = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className={`flex h-screen ${bgClass} overflow-hidden`}>
      {/* Left Panel - System Explorer */}
      <div className={`w-96 flex-shrink-0 overflow-y-auto border-r ${panelBgClass}`}>
        <SystemExplorer
          assets={assets}
          predictions={predictions}
          onAssetSelect={setSelectedAssetId}
          selectedAssetId={selectedAssetId}
        />
      </div>

      {/* Right Panel - 3D Scene */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`border-b ${toolbarBgClass} px-4 py-3 flex items-center justify-between`}>
          <h1 className={`text-lg font-mono ${textColorClass}`}>Digital Twin Visualization</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded transition-colors ${
                theme === "dark"
                  ? "hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                  : "hover:bg-slate-100 text-slate-600 hover:text-blue-600"
              }`}
              title="Toggle Labels"
            >
              {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`p-2 rounded transition-colors ${
                theme === "dark"
                  ? "hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                  : "hover:bg-slate-100 text-slate-600 hover:text-blue-600"
              }`}
              title="Toggle Connections"
            >
              {showConnections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowFaults(!showFaults)}
              className={`p-2 rounded transition-colors ${
                theme === "dark"
                  ? "hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                  : "hover:bg-slate-100 text-slate-600 hover:text-blue-600"
              }`}
              title="Toggle Faults"
            >
              {showFaults ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3D Scene */}
        <div className={`flex-1 relative ${theme === "dark" ? "bg-slate-950" : "bg-slate-100"}`}>
          <IndustrialScene
            equipment={sceneEquipment}
            selectedEquipmentId={selectedAssetId}
            onEquipmentSelect={setSelectedAssetId}
          />

          {/* Equipment Details Panel */}
          {selectedAsset && (
            <div
              className={`absolute bottom-4 right-4 w-80 rounded-lg p-4 shadow-xl border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <h3 className={`text-sm font-mono ${textColorClass} mb-3`}>Equipment Details</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className={`${secondaryTextClass}`}>Asset Tag</p>
                  <p className={`font-mono ${textColorClass}`}>{selectedAsset.name}</p>
                </div>
                <div>
                  <p className={`${secondaryTextClass}`}>Type</p>
                  <p className={`font-mono ${textColorClass}`}>{selectedAsset.type}</p>
                </div>
                <div>
                  <p className={`${secondaryTextClass}`}>Status</p>
                  <p
                    className={`font-mono ${
                      selectedAsset.status === "active"
                        ? "text-green-500"
                        : selectedAsset.status === "fault"
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {selectedAsset.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className={`${secondaryTextClass}`}>Health Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex-1 rounded-full h-1.5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}>
                      <div
                        className={`h-1.5 rounded-full ${
                          selectedAsset.health > 80
                            ? "bg-green-500"
                            : selectedAsset.health > 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${selectedAsset.health}%` }}
                      />
                    </div>
                    <span className={`font-mono text-green-500 w-8 text-right`}>
                      {selectedAsset.health}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`${secondaryTextClass}`}>Description</p>
                  <p className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>
                    {selectedAsset.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
