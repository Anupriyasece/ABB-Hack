import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function NarrativeDashboard() {
  const [, params] = useRoute("/dashboard/:programId/narratives");
  const programId = params?.programId ? parseInt(params.programId) : 0;
  const [selectedType, setSelectedType] = useState<"Engineer" | "Operator" | "Management" | "Training" | "Maintenance">("Engineer");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: narratives, refetch } = trpc.plc.getNarratives.useQuery(
    { programId },
    { enabled: !!programId }
  );

  const generateMutation = trpc.plc.generateNarrative.useMutation();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        programId,
        stakeholderType: selectedType,
      });
      toast.success("Narrative generated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to generate narrative");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedNarrative = narratives?.find(n => n.stakeholderType === selectedType);

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <h2 className="text-xl font-bold text-slate-900">Functional Narratives</h2>

      <div className="flex gap-2 flex-wrap">
        {(["Engineer", "Operator", "Management", "Training", "Maintenance"] as const).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !!selectedNarrative}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Narrative"
          )}
        </Button>
      </div>

      {selectedNarrative ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedNarrative.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Streamdown>{selectedNarrative.content}</Streamdown>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600 text-center">No narrative generated yet. Click "Generate Narrative" to create one.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
