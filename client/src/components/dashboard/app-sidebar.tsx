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
import { Eye, Plus, FolderOpen, Settings, HelpCircle } from "lucide-react";
import type { Project } from "@shared/schema";

interface AppSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function AppSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">AEO Dashboard</span>
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
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      isActive={selectedProjectId === project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="w-full"
                      data-testid={`sidebar-project-${project.id}`}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            selectedProjectId === project.id
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
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
