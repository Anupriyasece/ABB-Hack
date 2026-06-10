import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SafetyDashboard() {
  const [, params] = useRoute("/dashboard/:programId/safety");
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
      <h2 className="text-xl font-bold text-slate-900">Safety Analysis</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Safety Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsedData?.safetyRules.map((rule: any, i: number) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold text-red-900">{rule.name}</p>
                  <p className="text-sm text-red-800 mt-1">{rule.description}</p>
                  <p className="text-xs text-red-700 mt-2">Protected: {rule.protectedAssets.join(", ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interlocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsedData?.interlocks.map((interlock: any, i: number) => (
                <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-semibold text-yellow-900">{interlock.name}</p>
                  <p className="text-sm text-yellow-800 mt-1">{interlock.description}</p>
                  <p className="text-xs text-yellow-700 mt-2">Prevents: {interlock.preventedAction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
