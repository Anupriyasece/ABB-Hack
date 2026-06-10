import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import HomeD from "./pages/HomeD";
import NarrativeDashboard from "./pages/NarrativeDashboard";
import KnowledgeGraphDashboard from "./pages/KnowledgeGraphDashboard";
import ProcessFlowDashboard from "./pages/ProcessFlowDashboard";
import SafetyDashboard from "./pages/SafetyDashboard";
import AlarmDashboard from "./pages/AlarmDashboard";
import DigitalTwinDashboard from "./pages/DigitalTwinDashboard";
import DashboardShell from "./components/DashboardShell";

function DashboardRoutes() {
  return (
    <DashboardShell>
      <Switch>
        <Route path={"/dashboard/:programId/home"} component={HomeD} />
        <Route path={"/dashboard/:programId/narratives"} component={NarrativeDashboard} />
        <Route path={"/dashboard/:programId/knowledge-graph"} component={KnowledgeGraphDashboard} />
        <Route path={"/dashboard/:programId/process-flow"} component={ProcessFlowDashboard} />
        <Route path={"/dashboard/:programId/safety"} component={SafetyDashboard} />
        <Route path={"/dashboard/:programId/alarms"} component={AlarmDashboard} />
        <Route path={"/dashboard/:programId/digital-twin"} component={DigitalTwinDashboard} />
        <Route component={NotFound} />
      </Switch>
    </DashboardShell>
  );
}

function DashboardRedirect({ params }: { params: { programId: string } }) {
  return <Redirect to={`/dashboard/${params.programId}/home`} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/dashboard/:programId"} component={DashboardRedirect} />
      <Route path={"/dashboard/:programId/:page"} component={DashboardRoutes} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
