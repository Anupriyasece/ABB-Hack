import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Zap, Activity, AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Asset {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "fault";
  health: number;
  description: string;
}

interface SystemExplorerProps {
  assets: Asset[];
  predictions: string[];
  onAssetSelect: (id: string) => void;
  selectedAssetId?: string;
}

export default function SystemExplorer({
  assets,
  predictions,
  onAssetSelect,
  selectedAssetId,
}: SystemExplorerProps) {
  const [expandedTab, setExpandedTab] = useState<"health" | "assets" | "predictions">(
    "health"
  );
  const { theme } = useTheme();

  const totalComponents = assets.length;
  const activeComponents = assets.filter((a) => a.status === "active").length;
  const idleComponents = assets.filter((a) => a.status === "idle").length;
  const faultedComponents = assets.filter((a) => a.status === "fault").length;
  const avgHealth = Math.round(
    assets.reduce((sum, a) => sum + a.health, 0) / Math.max(assets.length, 1)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "idle":
        return theme === "dark" ? "text-slate-400" : "text-slate-500";
      case "fault":
        return "text-red-500";
      default:
        return theme === "dark" ? "text-slate-400" : "text-slate-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    if (theme === "dark") {
      switch (status) {
        case "active":
          return "bg-green-900/20 border-green-700/50";
        case "idle":
          return "bg-slate-800/50 border-slate-700/50";
        case "fault":
          return "bg-red-900/20 border-red-700/50";
        default:
          return "bg-slate-800/50 border-slate-700/50";
      }
    } else {
      switch (status) {
        case "active":
          return "bg-green-50 border-green-200";
        case "idle":
          return "bg-slate-100 border-slate-200";
        case "fault":
          return "bg-red-50 border-red-200";
        default:
          return "bg-slate-100 border-slate-200";
      }
    }
  };

  const bgClass = theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const textClass = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const secondaryTextClass = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const accentClass = theme === "dark" ? "text-cyan-400" : "text-blue-600";
  const cardBgClass = theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200";

  return (
    <div className={`h-full ${bgClass} border-r overflow-y-auto p-4 space-y-4`}>
      {/* Tabs */}
      <div className={`flex gap-2 border-b ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
        {["health", "assets", "predictions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setExpandedTab(tab as any)}
            className={`px-3 py-2 text-sm font-mono transition-colors ${
              expandedTab === tab
                ? theme === "dark"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-blue-600 border-b-2 border-blue-600"
                : theme === "dark"
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-600 hover:text-slate-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* System Health Dashboard */}
      {expandedTab === "health" && (
        <div className="space-y-3">
          <h3 className={`text-sm font-mono ${accentClass} mb-3`}>System Health</h3>

          <Card className={cardBgClass}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-xs ${secondaryTextClass}`}>Total Components</span>
                <span className={`text-lg font-bold ${accentClass}`}>{totalComponents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${secondaryTextClass}`}>Active</span>
                <span className="text-lg font-bold text-green-500">{activeComponents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${secondaryTextClass}`}>Idle</span>
                <span className={`text-lg font-bold ${secondaryTextClass}`}>{idleComponents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${secondaryTextClass}`}>Faulted</span>
                <span className="text-lg font-bold text-red-500">{faultedComponents}</span>
              </div>
            </CardContent>
          </Card>

          <Card className={cardBgClass}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs ${secondaryTextClass}`}>Overall Health</span>
                  <span className="text-lg font-bold text-green-500">{avgHealth}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${
                      avgHealth > 80
                        ? "bg-green-500"
                        : avgHealth > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${avgHealth}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardBgClass}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <span className={`text-xs ${secondaryTextClass} block`}>Risk Level</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className={`text-sm font-mono ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                    MEDIUM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Asset Explorer */}
      {expandedTab === "assets" && (
        <div className="space-y-3">
          <h3 className={`text-sm font-mono ${accentClass} mb-3`}>Assets</h3>
          {assets.length === 0 ? (
            <Card className={cardBgClass}>
              <CardContent className="pt-3">
                <p className={`text-xs ${secondaryTextClass}`}>No assets available.</p>
              </CardContent>
            </Card>
          ) : (
            assets.map((asset) => (
              <Card
                key={asset.id}
                className={`cursor-pointer transition-all ${
                  selectedAssetId === asset.id
                    ? theme === "dark"
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                      : "border-blue-500 shadow-lg shadow-blue-500/20"
                    : theme === "dark"
                    ? "border-slate-700 hover:border-slate-600"
                    : "border-slate-300 hover:border-slate-400"
                } ${getStatusBgColor(asset.status)}`}
                onClick={() => onAssetSelect(asset.id)}
              >
                <CardContent className="pt-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-mono text-sm ${accentClass}`}>{asset.name}</p>
                      <p className={`text-xs ${secondaryTextClass}`}>{asset.type}</p>
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${getStatusColor(
                        asset.status
                      )}`}
                    >
                      {asset.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={secondaryTextClass}>Health</span>
                      <span className="text-green-500 font-mono">{asset.health}%</span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}>
                      <div
                        className={`h-1.5 rounded-full ${
                          asset.health > 80
                            ? "bg-green-500"
                            : asset.health > 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${asset.health}%` }}
                      />
                    </div>
                  </div>

                  <p className={`text-xs ${secondaryTextClass} leading-tight`}>{asset.description}</p>

                  <button
                    className={`w-full mt-2 px-2 py-1 text-xs rounded transition-colors ${
                      theme === "dark"
                        ? "bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-700"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssetSelect(asset.id);
                    }}
                  >
                    Highlight in Twin
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Predicted Issues */}
      {expandedTab === "predictions" && (
        <div className="space-y-3">
          <h3 className={`text-sm font-mono ${accentClass} mb-3`}>Predictions</h3>
          {predictions.length > 0 ? (
            predictions.map((prediction, idx) => (
              <Card
                key={idx}
                className={
                  theme === "dark"
                    ? "bg-yellow-900/20 border-yellow-700/50"
                    : "bg-yellow-50 border-yellow-200"
                }
              >
                <CardContent className="pt-3 flex gap-3">
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                  <p className={`text-xs ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                    {prediction}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className={cardBgClass}>
              <CardContent className="pt-3">
                <p className={`text-xs ${secondaryTextClass}`}>No predictions at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
