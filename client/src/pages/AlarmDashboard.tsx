import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AlarmDashboard() {
  const [, params] = useRoute("/dashboard/:programId/alarms");
  const programId = params?.programId ? parseInt(params.programId) : 0;

  const { data: parsedData, isLoading } = trpc.plc.getParsedData.useQuery(
    { programId },
    { enabled: !!programId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <h2 className="text-xl font-bold text-slate-900">Alarm Intelligence</h2>

      <div className="space-y-4">
        {parsedData?.alarms.map((alarm: any, i: number) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${
                  alarm.severity === 'Critical' ? 'text-red-600' :
                  alarm.severity === 'High' ? 'text-orange-600' :
                  alarm.severity === 'Medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <CardTitle className="flex-1">{alarm.name}</CardTitle>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  alarm.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                  alarm.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                  alarm.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alarm.severity}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Trigger Condition</p>
                <p className="text-sm text-slate-600">{alarm.triggerCondition}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Affected Equipment</p>
                <p className="text-sm text-slate-600">{alarm.affectedEquipment.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Potential Causes</p>
                <ul className="text-sm text-slate-600 list-disc list-inside">
                  {alarm.potentialCauses.map((cause: string, j: number) => (
                    <li key={j}>{cause}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Recommended Actions</p>
                <ul className="text-sm text-slate-600 list-disc list-inside">
                  {alarm.recommendedActions.map((action: string, j: number) => (
                    <li key={j}>{action}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
