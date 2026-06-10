import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ProcessFlowDashboard() {
  const [, params] = useRoute("/dashboard/:programId/process-flow");
  const programId = params?.programId ? parseInt(params.programId) : 0;

  const { data: parsedData, isLoading, error } = trpc.plc.getParsedData.useQuery(
    { programId },
    { enabled: !!programId }
  );

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
              <CardTitle className="text-red-900 dark:text-red-400">Error Loading Process Flow</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-red-800 dark:text-red-300">
            {error.message || "Failed to load process flow data."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const flowStages = [
    {
      title: "Initialization",
      description: "System startup and configuration",
      icon: "⚙️",
      color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
      textColor: "text-blue-900 dark:text-blue-100",
    },
    {
      title: "Condition Check",
      description: "Evaluate input conditions and sensors",
      icon: "🔍",
      color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
      textColor: "text-purple-900 dark:text-purple-100",
    },
    {
      title: "Logic Processing",
      description: "Execute control logic and decisions",
      icon: "⚡",
      color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
      textColor: "text-yellow-900 dark:text-yellow-100",
    },
    {
      title: "Action Execution",
      description: "Trigger actuators and outputs",
      icon: "🎯",
      color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
      textColor: "text-green-900 dark:text-green-100",
    },
    {
      title: "Monitoring",
      description: "Track system state and alarms",
      icon: "📊",
      color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
      textColor: "text-orange-900 dark:text-orange-100",
    },
    {
      title: "Shutdown",
      description: "Safe system termination",
      icon: "🛑",
      color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
      textColor: "text-red-900 dark:text-red-100",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Process Flow</h1>
        <p className="text-slate-600 dark:text-slate-400">Detailed flowchart of PLC program execution sequence</p>
      </div>

      {/* Main Horizontal Flowchart */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">System Execution Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-6">
            <div className="flex items-center gap-2 min-w-max px-4">
              {flowStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {/* Stage Box */}
                  <div className={`p-4 rounded-lg border-2 ${stage.color} min-w-[200px]`}>
                    <div className="text-2xl mb-2">{stage.icon}</div>
                    <h3 className={`font-bold text-sm ${stage.textColor}`}>{stage.title}</h3>
                    <p className={`text-xs ${stage.textColor} opacity-75 mt-1`}>{stage.description}</p>
                  </div>

                  {/* Arrow Connector */}
                  {idx < flowStages.length - 1 && (
                    <div className="flex items-center justify-center px-2">
                      <svg width="40" height="40" viewBox="0 0 40 40" className="text-slate-400 dark:text-slate-600">
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                          >
                            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                          </marker>
                        </defs>
                        <line
                          x1="0"
                          y1="20"
                          x2="30"
                          y2="20"
                          stroke="currentColor"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conditions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Input Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(parsedData?.conditions) && parsedData.conditions.length > 0 ? (
                parsedData.conditions.slice(0, 5).map((cond: any, idx: number) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{cond.name || `Condition ${idx + 1}`}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{cond.description || "Evaluates input state"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No conditions detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Output Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(parsedData?.actions) && parsedData.actions.length > 0 ? (
                parsedData.actions.slice(0, 5).map((action: any, idx: number) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.name || `Action ${idx + 1}`}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{action.description || "Executes control action"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No actions detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Elements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timers */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white text-sm">Timers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(parsedData?.timers) && parsedData.timers.length > 0 ? (
                parsedData.timers.slice(0, 4).map((timer: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{timer.name || `Timer ${idx + 1}`}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No timers detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Counters */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white text-sm">Counters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(parsedData?.counters) && parsedData.counters.length > 0 ? (
                parsedData.counters.slice(0, 4).map((counter: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{counter.name || `Counter ${idx + 1}`}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No counters detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interlocks */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white text-sm">Interlocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(parsedData?.interlocks) && parsedData.interlocks.length > 0 ? (
                parsedData.interlocks.slice(0, 4).map((interlock: any, idx: number) => (
                  <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs border border-red-200 dark:border-red-800">
                    <p className="font-semibold text-slate-900 dark:text-white">{interlock.name || `Interlock ${idx + 1}`}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No interlocks detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
