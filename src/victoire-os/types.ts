export type ShellMode = "bash" | "python" | "powershell" | "node" | "sql";
export type PersonaMode = "recruiter" | "dev" | "mentor" | "playful";
export type MissionId = "recruiter" | "tech-lead" | "curious";
export type VisitorRole = "unknown" | "recruiter" | "developer" | "student" | "client";

export type VictoireMemory = {
  commands: string[];
  goal: string;
  persona: PersonaMode;
  mission: MissionId | "";
  missionStep: number;
  autopilot: boolean;
  coach: boolean;
  visitor: VisitorRole;
  visitedProjects: string[];
  lastActiveAt: string;
};

export type VirtualFileKind = "markdown" | "text" | "python" | "bash" | "docker" | "yaml" | "json" | "javascript";

export type VirtualFile = {
  kind: VirtualFileKind;
  executable?: boolean;
  description: string;
  content: string[];
};
