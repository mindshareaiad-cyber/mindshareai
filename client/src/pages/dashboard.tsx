import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { PromptsTab } from "@/components/dashboard/prompts-tab";
import { ResultsTab } from "@/components/dashboard/results-tab";
import { SuggestionsTab } from "@/components/dashboard/suggestions-tab";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Project, PromptSet, Prompt, ScanResult, GapAnalysis } from "@shared/schema";

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  const { data: promptSetsData = [], isLoading: promptSetsLoading } = useQuery<
    (PromptSet & { prompts: Prompt[] })[]
  >({
    queryKey: ["/api/projects", selectedProjectId, "prompt-sets"],
    enabled: !!selectedProjectId,
  });

  const { data: latestScan } = useQuery<{
    visibilityScore: number;
    results: (ScanResult & { prompt: Prompt })[];
    scan: { createdAt: string };
    competitorScores: Record<string, number>;
  }>({
    queryKey: ["/api/projects", selectedProjectId, "scans", "latest"],
    enabled: !!selectedProjectId,
  });

  const { data: gaps = [] } = useQuery<GapAnalysis[]>({
    queryKey: ["/api/projects", selectedProjectId, "gaps"],
    enabled: !!selectedProjectId,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; brandName: string; brandDomain: string; competitors: string[] }) =>
      apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const createPromptSetMutation = useMutation({
    mutationFn: (data: { name: string; persona?: string; funnelStage?: string; country?: string }) =>
      apiRequest("POST", `/api/projects/${selectedProjectId}/prompt-sets`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "prompt-sets"] });
      toast({ title: "Prompt set created" });
    },
    onError: () => {
      toast({ title: "Failed to create prompt set", variant: "destructive" });
    },
  });

  const addPromptMutation = useMutation({
    mutationFn: ({ promptSetId, text }: { promptSetId: string; text: string }) =>
      apiRequest("POST", `/api/prompt-sets/${promptSetId}/prompts`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "prompt-sets"] });
      toast({ title: "Prompt added" });
    },
    onError: () => {
      toast({ title: "Failed to add prompt", variant: "destructive" });
    },
  });

  const deletePromptSetMutation = useMutation({
    mutationFn: (promptSetId: string) =>
      apiRequest("DELETE", `/api/prompt-sets/${promptSetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "prompt-sets"] });
      toast({ title: "Prompt set deleted" });
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: (promptId: string) =>
      apiRequest("DELETE", `/api/prompts/${promptId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "prompt-sets"] });
      toast({ title: "Prompt deleted" });
    },
  });

  const runScan = async () => {
    if (!selectedProjectId) return;
    
    setIsScanning(true);
    try {
      await apiRequest("POST", `/api/projects/${selectedProjectId}/scans`, {
        engines: ["gpt-4o-mini"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "scans", "latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "gaps"] });
      toast({ title: "Scan completed successfully" });
    } catch (error) {
      toast({ title: "Scan failed", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const generateSuggestion = async (promptId: string) => {
    setIsGeneratingSuggestion(true);
    try {
      await apiRequest("POST", `/api/gaps/${promptId}/suggest`);
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "gaps"] });
      toast({ title: "Suggestion generated" });
    } catch (error) {
      toast({ title: "Failed to generate suggestion", variant: "destructive" });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const promptCount = promptSetsData.reduce((acc, set) => acc + set.prompts.length, 0);

  if (projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={() => setCreateDialogOpen(true)}
        />
        
        <div className="flex flex-col flex-1 min-w-0">
          <DashboardHeader
            project={selectedProject}
            visibilityScore={latestScan?.visibilityScore ?? null}
            isScanning={isScanning}
            onRunScan={runScan}
          />
          
          <main className="flex-1 overflow-auto p-6">
            {!selectedProject ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-semibold mb-2">Welcome to AEO Dashboard</h2>
                  <p className="text-muted-foreground mb-6">
                    Select a project from the sidebar or create a new one to start tracking your AI visibility.
                  </p>
                  <button
                    onClick={() => setCreateDialogOpen(true)}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    data-testid="button-create-first-project"
                  >
                    Create Your First Project
                  </button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="prompts" data-testid="tab-prompts">Prompts</TabsTrigger>
                  <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
                  <TabsTrigger value="suggestions" data-testid="tab-suggestions">Suggestions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <OverviewTab
                    project={selectedProject}
                    visibilityScore={latestScan?.visibilityScore ?? null}
                    promptCount={promptCount}
                    engineCount={1}
                    lastScanDate={latestScan?.scan?.createdAt ? new Date(latestScan.scan.createdAt) : null}
                    competitorScores={latestScan?.competitorScores || {}}
                  />
                </TabsContent>
                
                <TabsContent value="prompts">
                  {promptSetsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <PromptsTab
                      promptSets={promptSetsData}
                      onCreatePromptSet={(data) => createPromptSetMutation.mutate(data)}
                      onAddPrompt={(promptSetId, text) =>
                        addPromptMutation.mutate({ promptSetId, text })
                      }
                      onDeletePromptSet={(id) => deletePromptSetMutation.mutate(id)}
                      onDeletePrompt={(id) => deletePromptMutation.mutate(id)}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="results">
                  <ResultsTab
                    results={latestScan?.results || []}
                    competitors={selectedProject.competitors}
                  />
                </TabsContent>
                
                <TabsContent value="suggestions">
                  <SuggestionsTab
                    gaps={gaps}
                    isGenerating={isGeneratingSuggestion}
                    onGenerateSuggestion={generateSuggestion}
                  />
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
      
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data) => createProjectMutation.mutate(data)}
      />
    </SidebarProvider>
  );
}
