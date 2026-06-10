import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload as UploadIcon, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Upload() {
  const [, navigate] = useLocation();
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState<"LD" | "ST" | "FBD" | "SFC" | "">("ST");
  const [description, setDescription] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadMutation = trpc.plc.upload.useMutation();
  const parseMutation = trpc.plc.parse.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.readAsText(file);

    // Auto-detect format from extension
    const ext = file.name.split(".").pop()?.toUpperCase();
    if (["LD", "ST", "FBD", "SFC"].includes(ext || "")) {
      setFileFormat(ext as "LD" | "ST" | "FBD" | "SFC");
    }
  };

  const handleUpload = async () => {
    if (!fileName || !fileFormat || !fileContent) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const uploadResult = await uploadMutation.mutateAsync({
        fileName,
        fileFormat: fileFormat as "LD" | "ST" | "FBD" | "SFC",
        fileContent,
        description,
      });

      toast.success("File uploaded successfully");

      // Parse the program
      await parseMutation.mutateAsync({
        programId: uploadResult.programId,
        fileContent,
        fileFormat: fileFormat as "LD" | "ST" | "FBD" | "SFC",
      });

      toast.success("Program parsed successfully");

      // Redirect to dashboard home
      navigate(`/dashboard/${uploadResult.programId}/home`);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error("Upload failed: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate("/")} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Upload PLC Program</h1>
          <p className="text-slate-600 mt-2">
            Upload your IEC 61131-3 PLC program for semantic analysis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select PLC File</CardTitle>
            <CardDescription>
              Supported formats: Ladder Logic (LD), Structured Text (ST), Function Block Diagram (FBD), Sequential Function Chart (SFC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">PLC Program File</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept=".ld,.st,.fbd,.sfc,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <UploadIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">PLC files up to 10MB</p>
                </label>
              </div>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <CheckCircle className="h-4 w-4" />
                  {fileName}
                </div>
              )}
            </div>

            {/* File Format */}
            <div className="space-y-2">
              <Label htmlFor="format">PLC Language Format</Label>
              <Select value={fileFormat} onValueChange={(value) => setFileFormat(value as any)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LD">Ladder Logic (LD)</SelectItem>
                  <SelectItem value="ST">Structured Text (ST)</SelectItem>
                  <SelectItem value="FBD">Function Block Diagram (FBD)</SelectItem>
                  <SelectItem value="SFC">Sequential Function Chart (SFC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and context of this PLC program..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* File Content Preview */}
            {fileContent && (
              <div className="space-y-2">
                <Label>File Content Preview</Label>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs max-h-48 overflow-y-auto">
                  {fileContent.split("\n").slice(0, 20).map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  {fileContent.split("\n").length > 20 && (
                    <div className="text-slate-500 mt-2">... ({fileContent.split("\n").length - 20} more lines)</div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleUpload}
                disabled={!fileName || !fileFormat || !fileContent || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload & Analyze
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What We Analyze</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>• Conditions and actions</p>
              <p>• Timers and counters</p>
              <p>• Alarms and interlocks</p>
              <p>• Process sequences</p>
              <p>• Equipment and sensors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What You Get</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>• Interactive knowledge graphs</p>
              <p>• Stakeholder narratives</p>
              <p>• Process flow diagrams</p>
              <p>• Safety analysis</p>
              <p>• AI-powered insights</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
