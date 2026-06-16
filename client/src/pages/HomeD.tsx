import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, TrendingUp, Zap, Shield, AlertTriangle, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";


export default function HomeD() {
  const [, params] = useRoute("/dashboard/:programId/home");
  const [, navigate] = useLocation();
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
              <CardTitle className="text-red-900 dark:text-red-400">Error Loading Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-red-800 dark:text-red-300">
            {error.message || "Failed to load PLC analysis data. Please try uploading again."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="p-8">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900 dark:text-yellow-400">No Data Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-yellow-800 dark:text-yellow-300">
            The PLC program has not been parsed yet. Please wait or try refreshing the page.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const equipmentData = [
    { name: "Motors", value: parsedData.equipmentCount || 0, fill: "#3b82f6" },
    { name: "Sensors", value: Math.ceil((parsedData.equipmentCount || 0) * 0.6), fill: "#10b981" },
    { name: "Actuators", value: Math.ceil((parsedData.equipmentCount || 0) * 0.4), fill: "#f59e0b" },
  ];

  const timeSeriesData = [
    { time: "00:00", active: 45, idle: 20 },
    { time: "04:00", active: 52, idle: 18 },
    { time: "08:00", active: 78, idle: 12 },
    { time: "12:00", active: 92, idle: 8 },
    { time: "16:00", active: 85, idle: 15 },
    { time: "20:00", active: 65, idle: 25 },
    { time: "24:00", active: 48, idle: 22 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">PLC System Overview</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time analysis of your PLC program</p>
        </div>
        <Button
          onClick={() => navigate("/upload")}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload PLC Program
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Logic Blocks */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Logic Blocks</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{parsedData.logicBlockCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total blocks detected</p>
          </CardContent>
        </Card>

        {/* Equipment Count */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Equipment</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{parsedData.equipmentCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connected devices</p>
          </CardContent>
        </Card>

        {/* Alarms */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Alarms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{parsedData.alarmCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active alerts</p>
          </CardContent>
        </Card>

        {/* Safety Rules */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Safety Rules</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{parsedData.safetyRuleCount || 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Safety interlocks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Distribution */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Equipment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="idle" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Program Details */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Program Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Conditions</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{Array.isArray(parsedData.conditions) ? parsedData.conditions.length : 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Control Loops</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{Array.isArray(parsedData.controlLoops) ? parsedData.controlLoops.length : 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Timers</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{Array.isArray(parsedData.timers) ? parsedData.timers.length : 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Counters</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{Array.isArray(parsedData.counters) ? parsedData.counters.length : 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
