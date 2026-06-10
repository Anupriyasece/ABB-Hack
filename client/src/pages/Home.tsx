import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload as UploadIcon, Zap, BarChart3, Shield, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: programs, isLoading: programsLoading } = trpc.plc.listPrograms.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">PLC Semantic Intelligence Platform</h1>
            <p className="text-xl text-slate-300 mb-8">
              Transform your IEC 61131-3 PLC programs into actionable intelligence
            </p>
            <Button
              size="lg"
              onClick={() => {
                const loginUrl = new URL(window.location.href);
                loginUrl.pathname = "/api/oauth/login";
                window.location.href = loginUrl.toString();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign In to Get Started
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Parse PLC Programs</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Upload Ladder Logic, Structured Text, FBD, or SFC programs and instantly extract operational intent.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Interactive Dashboards</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Visualize knowledge graphs, process flows, and control relationships with interactive visualizations.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Generate stakeholder-specific narratives and perform root cause, impact, and safety analysis.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">PLC Semantic Intelligence Platform</h1>
            <p className="text-slate-600 mt-2">Analyze and understand your industrial automation systems</p>
          </div>
          <Button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload PLC Program
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs?.slice(0, 5).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Analyses Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Narratives Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Your PLC Programs</h2>
          </div>
          {programsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/${program.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{program.fileName}</h3>
                      <p className="text-sm text-slate-600 mt-1">{program.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Format: {program.fileFormat}</span>
                        <span>Size: {(program.fileSize / 1024).toFixed(2)} KB</span>
                        <span>Created: {new Date(program.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Analysis
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No PLC programs uploaded yet</p>
              <Button onClick={() => navigate("/upload")} variant="outline">
                Upload Your First Program
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
