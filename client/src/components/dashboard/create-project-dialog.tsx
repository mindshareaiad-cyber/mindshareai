import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    brandName: string;
    brandDomain: string;
    competitors: string[];
  }) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");
  const [competitorsText, setCompetitorsText] = useState("");

  const handleSubmit = () => {
    if (name.trim() && brandName.trim() && brandDomain.trim()) {
      const competitors = competitorsText
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      onSubmit({
        name: name.trim(),
        brandName: brandName.trim(),
        brandDomain: brandDomain.trim(),
        competitors,
      });

      setName("");
      setBrandName("");
      setBrandDomain("");
      setCompetitorsText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Brand Tracking"
              data-testid="input-project-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input
              id="brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., Acme Corp"
              data-testid="input-brand-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-domain">Brand Domain</Label>
            <Input
              id="brand-domain"
              value={brandDomain}
              onChange={(e) => setBrandDomain(e.target.value)}
              placeholder="e.g., acmecorp.com"
              data-testid="input-brand-domain"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="competitors">Competitors (one per line or comma-separated)</Label>
            <Textarea
              id="competitors"
              value={competitorsText}
              onChange={(e) => setCompetitorsText(e.target.value)}
              placeholder="e.g., Competitor A&#10;Competitor B&#10;Competitor C"
              rows={4}
              data-testid="input-competitors"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !brandName.trim() || !brandDomain.trim()}
            data-testid="button-submit-project"
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
