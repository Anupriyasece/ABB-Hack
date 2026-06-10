import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:programId");
  const [, navigate] = useLocation();
  const programId = params?.programId ? parseInt(params.programId) : 0;

  const { data: program, isLoading } = trpc.plc.getProgram.useQuery(
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

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Program not found</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{program.fileName}</h1>
          <p className="text-slate-600 mt-2">{program.description}</p>
        </div>

        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/home`)}>
            Home
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/narratives`)}>
            Narratives
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/knowledge-graph`)}>
            Knowledge Graph
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/process-flow`)}>
            Process Flow
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/safety`)}>
            Safety
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/${programId}/alarms`)}>
            Alarms
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Select a dashboard from above to view analysis</p>
        </div>
      </div>
    </div>
  );
}
