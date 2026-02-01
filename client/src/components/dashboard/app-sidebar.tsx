import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Plus, 
  FolderOpen, 
  Settings, 
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import type { Project } from "@shared/schema";

export type DashboardSection = "overview" | "prompts" | "results" | "gaps" | "suggestions";

interface AppSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const sections = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "prompts" as const, label: "Prompts", icon: MessageSquare },
  { id: "results" as const, label: "Results", icon: BarChart3 },
  { id: "gaps" as const, label: "Gap Analysis", icon: AlertTriangle },
  { id: "suggestions" as const, label: "AEO Suggestions", icon: Lightbulb },
];

export function AppSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  activeSection,
  onSectionChange,
}: AppSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(selectedProjectId ? [selectedProjectId] : [])
  );

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
    setExpandedProjects(new Set([projectId]));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">Mindshare AI</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-2 gap-2">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCreateProject}
              data-testid="button-create-project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-xs">Create your first project to get started</p>
                </div>
              ) : (
                projects.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  const isExpanded = expandedProjects.has(project.id);
                  
                  return (
                    <div key={project.id}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isSelected && !isExpanded}
                          onClick={() => handleProjectClick(project.id)}
                          className="w-full"
                          data-testid={`sidebar-project-${project.id}`}
                        >
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProject(project.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  toggleProject(project.id);
                                }
                              }}
                              className="flex-shrink-0 cursor-pointer"
                              data-testid={`button-toggle-project-${project.id}`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                            <span className="truncate font-medium">{project.name}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      
                      {isSelected && isExpanded && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {sections.map((section) => (
                            <SidebarMenuItem key={section.id}>
                              <SidebarMenuButton
                                isActive={activeSection === section.id}
                                onClick={() => onSectionChange(section.id)}
                                className="w-full text-sm"
                                data-testid={`sidebar-section-${section.id}`}
                              >
                                <section.icon className="h-4 w-4" />
                                <span>{section.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="sidebar-settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="sidebar-help">
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
