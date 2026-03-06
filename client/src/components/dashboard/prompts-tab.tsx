import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronDown, ChevronRight, MessageSquare, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PromptSet, Prompt } from "@shared/schema";

interface PromptsTabProps {
  promptSets: (PromptSet & { prompts: Prompt[] })[];
  onCreatePromptSet: (data: { name: string; persona?: string; funnelStage?: string; country?: string }) => void;
  onAddPrompt: (promptSetId: string, text: string) => Promise<void> | void;
  onDeletePromptSet: (promptSetId: string) => void;
  onDeletePrompt: (promptId: string) => void;
}

export function PromptsTab({
  promptSets,
  onCreatePromptSet,
  onAddPrompt,
  onDeletePromptSet,
  onDeletePrompt,
}: PromptsTabProps) {
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
  const [newSetDialogOpen, setNewSetDialogOpen] = useState(false);
  const [newPromptDialogOpen, setNewPromptDialogOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  
  const [newSetName, setNewSetName] = useState("");
  const [newSetPersona, setNewSetPersona] = useState("");
  const [newSetFunnelStage, setNewSetFunnelStage] = useState("");
  const [newSetCountry, setNewSetCountry] = useState("");
  const [newPromptText, setNewPromptText] = useState("");

  const toggleExpand = (setId: string) => {
    const newExpanded = new Set(expandedSets);
    if (newExpanded.has(setId)) {
      newExpanded.delete(setId);
    } else {
      newExpanded.add(setId);
    }
    setExpandedSets(newExpanded);
  };

  const handleCreatePromptSet = () => {
    if (newSetName.trim()) {
      onCreatePromptSet({
        name: newSetName.trim(),
        persona: newSetPersona || undefined,
        funnelStage: newSetFunnelStage || undefined,
        country: newSetCountry || undefined,
      });
      setNewSetName("");
      setNewSetPersona("");
      setNewSetFunnelStage("");
      setNewSetCountry("");
      setNewSetDialogOpen(false);
    }
  };

  const [addingPrompts, setAddingPrompts] = useState(false);
  const [generatingPrompts, setGeneratingPrompts] = useState(false);
  const { toast } = useToast();

  const handleGeneratePrompts = async () => {
    if (!selectedSetId) return;
    setGeneratingPrompts(true);
    try {
      const response = await apiRequest("POST", `/api/prompt-sets/${selectedSetId}/generate-prompts`, { count: 10 });
      const data = await response.json();
      if (data.prompts && data.prompts.length > 0) {
        const existing = newPromptText.trim();
        const generated = data.prompts.join("\n");
        setNewPromptText(existing ? existing + "\n" + generated : generated);
        toast({ title: `Generated ${data.prompts.length} prompt suggestions` });
      } else {
        toast({ title: "No prompts generated", description: "Try again or add prompts manually", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to generate prompts", description: "Please try again", variant: "destructive" });
    } finally {
      setGeneratingPrompts(false);
    }
  };

  const handleAddPrompt = async () => {
    if (!newPromptText.trim() || !selectedSetId) return;
    const lines = newPromptText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;
    setAddingPrompts(true);
    try {
      for (const line of lines) {
        await onAddPrompt(selectedSetId, line);
      }
      setNewPromptText("");
      setNewPromptDialogOpen(false);
    } finally {
      setAddingPrompts(false);
    }
  };

  const openAddPromptDialog = (setId: string) => {
    setSelectedSetId(setId);
    setNewPromptDialogOpen(true);
  };

  const totalPrompts = promptSets.reduce((acc, set) => acc + set.prompts.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Prompts & Sets</h2>
          <p className="text-sm text-muted-foreground">
            {promptSets.length} sets, {totalPrompts} prompts total
          </p>
        </div>
        <Dialog open={newSetDialogOpen} onOpenChange={setNewSetDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-prompt-set">
              <Plus className="h-4 w-4" />
              New Prompt Set
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Prompt Set</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="set-name">Name</Label>
                <Input
                  id="set-name"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="e.g., CRM Questions"
                  data-testid="input-prompt-set-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-persona">Persona (optional)</Label>
                <Select value={newSetPersona} onValueChange={setNewSetPersona}>
                  <SelectTrigger id="set-persona" data-testid="select-persona">
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-funnel">Funnel Stage (optional)</Label>
                <Select value={newSetFunnelStage} onValueChange={setNewSetFunnelStage}>
                  <SelectTrigger id="set-funnel" data-testid="select-funnel-stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOFU">Top of Funnel (TOFU)</SelectItem>
                    <SelectItem value="MOFU">Middle of Funnel (MOFU)</SelectItem>
                    <SelectItem value="BOFU">Bottom of Funnel (BOFU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-country">Country (optional)</Label>
                <Input
                  id="set-country"
                  value={newSetCountry}
                  onChange={(e) => setNewSetCountry(e.target.value)}
                  placeholder="e.g., UK, US"
                  data-testid="input-country"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSetDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromptSet} data-testid="button-submit-prompt-set">
                Create Set
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {promptSets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No prompt sets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first prompt set to start tracking AI visibility.
            </p>
            <Button onClick={() => setNewSetDialogOpen(true)} data-testid="button-create-first-set">
              Create Prompt Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {promptSets.map((set) => (
            <Card key={set.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                    onClick={() => toggleExpand(set.id)}
                    data-testid={`toggle-prompt-set-${set.id}`}
                  >
                    {expandedSets.has(set.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <CardTitle className="text-base">{set.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      ({set.prompts.length} prompts)
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    {set.persona && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {set.persona}
                      </span>
                    )}
                    {set.funnelStage && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                        {set.funnelStage}
                      </span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openAddPromptDialog(set.id)}
                      data-testid={`button-add-prompt-${set.id}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDeletePromptSet(set.id)}
                      data-testid={`button-delete-set-${set.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedSets.has(set.id) && (
                <CardContent>
                  {set.prompts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No prompts in this set. Add some prompts to track.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {set.prompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                        >
                          <span className="text-sm">{prompt.text}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => onDeletePrompt(prompt.id)}
                            data-testid={`button-delete-prompt-${prompt.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={newPromptDialogOpen} onOpenChange={setNewPromptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prompts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-text">Prompt Questions</Label>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Enter one prompt per line. You can add multiple prompts at once.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrompts}
                  disabled={generatingPrompts || addingPrompts}
                  className="gap-1.5 shrink-0"
                  data-testid="button-generate-prompts"
                >
                  {generatingPrompts ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {generatingPrompts ? "Generating..." : "Auto-Generate"}
                </Button>
              </div>
              <Textarea
                id="prompt-text"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder={"What's the best CRM for startups in the UK?\nWhich project management tool do agencies recommend?\nWhat software do small businesses use for invoicing?"}
                rows={6}
                data-testid="input-prompt-text"
              />
              {newPromptText.trim() && (
                <p className="text-xs text-muted-foreground" data-testid="text-prompt-count">
                  {newPromptText.split("\n").filter((l) => l.trim().length > 0).length} prompt{newPromptText.split("\n").filter((l) => l.trim().length > 0).length === 1 ? "" : "s"} to add
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPromptDialogOpen(false)} disabled={addingPrompts}>
              Cancel
            </Button>
            <Button onClick={handleAddPrompt} disabled={addingPrompts} data-testid="button-submit-prompt">
              {addingPrompts ? "Adding..." : "Add Prompts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
