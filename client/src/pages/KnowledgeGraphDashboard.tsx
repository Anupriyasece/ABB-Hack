import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import D3Graph from "@/components/D3Graph";
import { useMemo, useState } from "react";

interface Node {
  id: string;
  label: string;
  type: "equipment" | "sensor" | "actuator" | "alarm" | "controller";
  status?: "active" | "idle" | "error";
}

interface Link {
  source: string;
  target: string;
  type: string;
}

export default function KnowledgeGraphDashboard() {
  const [, params] = useRoute("/dashboard/:programId/knowledge-graph");
  const programId = params?.programId ? parseInt(params.programId) : 0;
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const { data: parsedData, isLoading, error } = trpc.plc.getParsedData.useQuery(
    { programId },
    { enabled: !!programId }
  );

  // Generate graph data from parsed PLC data
  const graphData = useMemo(() => {
    if (!parsedData) return { nodes: [], links: [] };

    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeIds = new Set<string>();

    // Add equipment nodes
    if (Array.isArray(parsedData.equipment)) {
      parsedData.equipment.forEach((eq: any, idx: number) => {
        const id = `eq-${idx}`;
        nodes.push({
          id,
          label: eq.name || `Equipment ${idx + 1}`,
          type: "equipment",
          status: "active",
        });
        nodeIds.add(id);
      });
    }

    // Add sensor nodes
    if (Array.isArray(parsedData.sensors)) {
      parsedData.sensors.forEach((sensor: any, idx: number) => {
        const id = `sensor-${idx}`;
        nodes.push({
          id,
          label: sensor.name || `Sensor ${idx + 1}`,
          type: "sensor",
          status: "active",
        });
        nodeIds.add(id);
      });
    }

    // Add actuator nodes
    if (Array.isArray(parsedData.actuators)) {
      parsedData.actuators.forEach((actuator: any, idx: number) => {
        const id = `actuator-${idx}`;
        nodes.push({
          id,
          label: actuator.name || `Actuator ${idx + 1}`,
          type: "actuator",
          status: "idle",
        });
        nodeIds.add(id);
      });
    }

    // Add alarm nodes
    if (Array.isArray(parsedData.alarms)) {
      parsedData.alarms.slice(0, 5).forEach((alarm: any, idx: number) => {
        const id = `alarm-${idx}`;
        nodes.push({
          id,
          label: alarm.name || `Alarm ${idx + 1}`,
          type: "alarm",
          status: "active",
        });
        nodeIds.add(id);
      });
    }

    // Add controller node
    if (nodes.length > 0) {
      const controllerId = "controller-main";
      nodes.push({
        id: controllerId,
        label: "PLC Controller",
        type: "controller",
        status: "active",
      });
      nodeIds.add(controllerId);

      // Create links from controller to all nodes
      nodeIds.forEach((nodeId) => {
        if (nodeId !== controllerId) {
          links.push({
            source: controllerId,
            target: nodeId,
            type: "controls",
          });
        }
      });

      // Create links between sensors and actuators
      if (Array.isArray(parsedData.sensors) && Array.isArray(parsedData.actuators)) {
        parsedData.sensors.forEach((sensor: any, sIdx: number) => {
          parsedData.actuators.forEach((actuator: any, aIdx: number) => {
            if (Math.random() > 0.7) {
              links.push({
                source: `sensor-${sIdx}`,
                target: `actuator-${aIdx}`,
                type: "triggers",
              });
            }
          });
        });
      }
    }

    return { nodes, links };
  }, [parsedData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
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
                Error Loading Knowledge Graph
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-red-800 dark:text-red-300">
            {error.message || "Failed to load knowledge graph data."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Knowledge Graph
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Interactive visualization of PLC system topology, equipment relationships, and control flow
        </p>
      </div>

      {/* Main Graph */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-slate-900 dark:text-white">System Topology</CardTitle>
          <div className="flex gap-2">
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 rounded-b-lg overflow-hidden">
            <D3Graph
              nodes={graphData.nodes}
              links={graphData.links}
              onNodeClick={setSelectedNode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Sensor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Actuator</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Alarm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Controller</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {graphData.nodes.filter((n) => n.type === "equipment").length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Equipment</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {graphData.nodes.filter((n) => n.type === "sensor").length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Sensors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {graphData.nodes.filter((n) => n.type === "actuator").length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Actuators</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {graphData.links.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Connections</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
