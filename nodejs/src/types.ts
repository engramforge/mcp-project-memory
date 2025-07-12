export interface ProjectInfo {
  name: string;
  type: string;
  description: string;
  createdAt: string;
  lastUpdated: string;
}

export interface ComponentStatus {
  status: 'not_started' | 'in_progress' | 'complete' | 'blocked' | 'deprecated';
  progress: number;
  details?: string;
  lastUpdated: string;
}

export interface ArchitectureDecision {
  id: string;
  decision: string;
  rationale: string;
  impact?: string;
  alternatives?: string[];
  date: string;
  tags?: string[];
}

export interface WorkingSolution {
  id: string;
  problem: string;
  solution: string;
  command?: string;
  tags?: string[];
  date: string;
  successCount: number;
}

export interface ConversationContext {
  id: string;
  summary: string;
  decisions_made?: string[];
  solutions_found?: string[];
  date: string;
}

export interface ProjectMemory {
  project_info: ProjectInfo;
  implementation_status: {
    overall_progress: string;
    components: Record<string, ComponentStatus>;
  };
  architecture: {
    technologies: string[];
    decisions: ArchitectureDecision[];
  };
  working_solutions: Record<string, WorkingSolution>;
  current_priorities: string[];
  conversations: ConversationContext[];
  metadata: {
    version: string;
    created_at: string;
    last_updated: string;
  };
}

export interface ProjectContext {
  project_name: string;
  project_type: string;
  project_description: string;
  project_root: string;
  overall_progress: string;
  components: Record<string, ComponentStatus>;
  priorities: string[];
  technologies: string[];
  recent_decisions: ArchitectureDecision[];
  solutions: Record<string, WorkingSolution>;
  recent_conversations: ConversationContext[];
  last_updated: string;
}

export interface ServerOptions {
  projectRoot: string;
  memoryDir: string;
  verbose: boolean;
  configFile?: string;
}

export interface ServerConfig {
  max_conversation_history: number;
  backup_enabled: boolean;
  backup_interval: number;
  compression_enabled: boolean;
  auto_detect_project_type: boolean;
}