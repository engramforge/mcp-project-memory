import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  ProjectMemory, 
  ProjectContext, 
  ComponentStatus, 
  ArchitectureDecision, 
  WorkingSolution, 
  ConversationContext, 
  ServerConfig,
  ServerOptions 
} from './types.js';

export class MemoryManager {
  private projectRoot: string;
  private memoryDir: string;
  private verbose: boolean;
  private config: ServerConfig;
  private memory!: ProjectMemory;
  
  private memoryFile: string;
  private contextFile: string;
  private decisionsFile: string;
  private solutionsFile: string;
  private conversationsFile: string;

  constructor(options: ServerOptions) {
    this.projectRoot = path.resolve(options.projectRoot);
    this.memoryDir = path.join(this.projectRoot, options.memoryDir);
    this.verbose = options.verbose;
    
    // Memory file paths
    this.memoryFile = path.join(this.memoryDir, 'project_memory.json');
    this.contextFile = path.join(this.memoryDir, 'current_context.json');
    this.decisionsFile = path.join(this.memoryDir, 'architecture_decisions.json');
    this.solutionsFile = path.join(this.memoryDir, 'working_solutions.json');
    this.conversationsFile = path.join(this.memoryDir, 'conversations.json');
    
    // Load configuration
    this.config = this.loadConfig(options.configFile);
    
    if (this.verbose) {
      console.error(`📁 Memory directory: ${this.memoryDir}`);
      console.error(`📝 Memory files initialized`);
    }
  }

  async initialize(): Promise<void> {
    // Ensure memory directory exists
    await fs.ensureDir(this.memoryDir);
    
    // Load or initialize memory
    this.memory = await this.loadMemory();
    
    if (this.verbose) {
      console.error('✅ Project memory initialized successfully!');
      console.error('');
      const context = this.getCurrentContext();
      console.error(`📊 Project: ${context.project_name}`);
      console.error(`📈 Components tracked: ${Object.keys(context.components).length}`);
      console.error(`🏗️ Architecture decisions: ${context.recent_decisions.length}`);
      console.error(`🔧 Working solutions: ${Object.keys(context.solutions).length}`);
      console.error(`💬 Conversation history: ${context.recent_conversations.length}`);
      console.error('');
    }
  }

  private loadConfig(configFile?: string): ServerConfig {
    const defaultConfig: ServerConfig = {
      max_conversation_history: 100,
      backup_enabled: true,
      backup_interval: 3600,
      compression_enabled: false,
      auto_detect_project_type: true
    };

    if (configFile && fs.existsSync(configFile)) {
      try {
        const userConfig = fs.readJsonSync(configFile);
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        if (this.verbose) {
          console.error(`⚠️ Warning: Could not load config file: ${error}`);
        }
      }
    }

    return defaultConfig;
  }
  private async loadMemory(): Promise<ProjectMemory> {
    if (await fs.pathExists(this.memoryFile)) {
      try {
        const loadedMemory = await fs.readJson(this.memoryFile);
        return this.validateAndMigrateMemory(loadedMemory);
      } catch (error) {
        if (this.verbose) {
          console.error(`⚠️ Warning: Could not load memory file: ${error}`);
        }
      }
    }

    // Initialize default memory structure
    const projectName = path.basename(this.projectRoot);
    const now = new Date().toISOString();
    
    return {
      project_info: {
        name: projectName,
        type: this.config.auto_detect_project_type ? this.detectProjectType() : 'unknown',
        description: '',
        createdAt: now,
        lastUpdated: now
      },
      implementation_status: {
        overall_progress: 'unknown',
        components: {}
      },
      architecture: {
        technologies: [],
        decisions: []
      },
      working_solutions: {},
      current_priorities: [],
      conversations: [],
      metadata: {
        version: '1.0.0',
        created_at: now,
        last_updated: now
      }
    };
  }

  private validateAndMigrateMemory(memory: any): ProjectMemory {
    const now = new Date().toISOString();
    const projectName = path.basename(this.projectRoot);

    // Ensure all required fields exist with proper types
    const validatedMemory: ProjectMemory = {
      project_info: {
        name: memory?.project_info?.name || projectName,
        type: memory?.project_info?.type || (this.config.auto_detect_project_type ? this.detectProjectType() : 'unknown'),
        description: memory?.project_info?.description || '',
        createdAt: memory?.project_info?.createdAt || now,
        lastUpdated: memory?.project_info?.lastUpdated || now
      },
      implementation_status: {
        overall_progress: memory?.implementation_status?.overall_progress || 'unknown',
        components: memory?.implementation_status?.components || {}
      },
      architecture: {
        technologies: Array.isArray(memory?.architecture?.technologies) ? memory.architecture.technologies : [],
        decisions: Array.isArray(memory?.architecture?.decisions) ? memory.architecture.decisions : []
      },
      working_solutions: (memory?.working_solutions && typeof memory.working_solutions === 'object') ? memory.working_solutions : {},
      current_priorities: Array.isArray(memory?.current_priorities) ? memory.current_priorities : [],
      conversations: Array.isArray(memory?.conversations) ? memory.conversations : [],
      metadata: {
        version: memory?.metadata?.version || '1.0.0',
        created_at: memory?.metadata?.created_at || now,
        last_updated: now
      }
    };

    if (this.verbose) {
      console.error('✅ Memory structure validated and migrated if necessary');
    }

    return validatedMemory;
  }

  private detectProjectType(): string {
    try {
      if (fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
        return 'Node.js/JavaScript';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'requirements.txt')) || 
          fs.existsSync(path.join(this.projectRoot, 'pyproject.toml'))) {
        return 'Python';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'Cargo.toml'))) {
        return 'Rust';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'go.mod'))) {
        return 'Go';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'pom.xml'))) {
        return 'Java/Maven';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'build.gradle'))) {
        return 'Java/Gradle';
      }
      if (fs.existsSync(path.join(this.projectRoot, 'docker-compose.yml'))) {
        return 'Docker/Microservices';
      }
    } catch (error) {
      // Ignore errors in detection
    }
    return 'unknown';
  }
  async saveMemory(): Promise<void> {
    try {
      this.memory.metadata.last_updated = new Date().toISOString();
      await fs.writeJson(this.memoryFile, this.memory, { spaces: 2 });
      
      // Save current context snapshot
      const context = this.getCurrentContext();
      await fs.writeJson(this.contextFile, context, { spaces: 2 });
      
      // Create backup if enabled
      if (this.config.backup_enabled) {
        await this.createBackup();
      }
    } catch (error) {
      if (this.verbose) {
        console.error(`❌ Error saving memory: ${error}`);
      }
      throw error;
    }
  }

  private async createBackup(): Promise<void> {
    try {
      const backupDir = path.join(this.memoryDir, 'backups');
      await fs.ensureDir(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `memory_backup_${timestamp}.json`);
      
      await fs.writeJson(backupFile, this.memory, { spaces: 2 });
      
      // Keep only last 10 backups
      const backups = await fs.readdir(backupDir);
      const backupFiles = backups
        .filter(f => f.startsWith('memory_backup_') && f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (backupFiles.length > 10) {
        for (const oldBackup of backupFiles.slice(10)) {
          await fs.remove(path.join(backupDir, oldBackup));
        }
      }
    } catch (error) {
      if (this.verbose) {
        console.error(`⚠️ Warning: Could not create backup: ${error}`);
      }
    }
  }

  getCurrentContext(): ProjectContext {
    return {
      project_name: this.memory.project_info.name,
      project_type: this.memory.project_info.type,
      project_description: this.memory.project_info.description,
      project_root: this.projectRoot,
      overall_progress: this.memory.implementation_status.overall_progress,
      components: this.memory.implementation_status.components,
      priorities: this.memory.current_priorities || [],
      technologies: this.memory.architecture.technologies || [],
      recent_decisions: (this.memory.architecture.decisions || []).slice(-5),
      solutions: this.memory.working_solutions || {},
      recent_conversations: (this.memory.conversations || []).slice(-5),
      last_updated: this.memory.metadata.last_updated
    };
  }
  async updateImplementationStatus(
    component: string, 
    status: ComponentStatus['status'], 
    details?: string, 
    progress?: number
  ): Promise<void> {
    this.memory.implementation_status.components[component] = {
      status,
      progress: progress ?? 0,
      details,
      lastUpdated: new Date().toISOString()
    };
    
    await this.saveMemory();
    
    if (this.verbose) {
      console.error(`📈 Updated ${component}: ${status} (${progress ?? 0}%)`);
    }
  }

  async addArchitectureDecision(
    decision: string, 
    rationale: string, 
    impact?: string, 
    alternatives?: string[]
  ): Promise<void> {
    const newDecision: ArchitectureDecision = {
      id: this.generateId(),
      decision,
      rationale,
      impact,
      alternatives,
      date: new Date().toISOString(),
      tags: []
    };
    
    this.memory.architecture.decisions.push(newDecision);
    await this.saveMemory();
    
    if (this.verbose) {
      console.error(`🏗️ Added architecture decision: ${decision}`);
    }
  }

  async addWorkingSolution(
    problem: string, 
    solution: string, 
    command?: string, 
    tags?: string[]
  ): Promise<void> {
    const id = this.generateId();
    const newSolution: WorkingSolution = {
      id,
      problem,
      solution,
      command,
      tags: tags ?? [],
      date: new Date().toISOString(),
      successCount: 1
    };
    
    this.memory.working_solutions[id] = newSolution;
    await this.saveMemory();
    
    if (this.verbose) {
      console.error(`🔧 Added working solution: ${problem}`);
    }
  }

  async updatePriorities(priorities: string[]): Promise<void> {
    this.memory.current_priorities = priorities;
    await this.saveMemory();
    
    if (this.verbose) {
      console.error(`🎯 Updated priorities: ${priorities.length} items`);
    }
  }
  async logConversationContext(
    summary: string, 
    decisions_made?: string[], 
    solutions_found?: string[]
  ): Promise<void> {
    const context: ConversationContext = {
      id: this.generateId(),
      summary,
      decisions_made,
      solutions_found,
      date: new Date().toISOString()
    };
    
    this.memory.conversations.push(context);
    
    // Keep only the most recent conversations
    if (this.memory.conversations.length > this.config.max_conversation_history) {
      this.memory.conversations = this.memory.conversations.slice(-this.config.max_conversation_history);
    }
    
    await this.saveMemory();
    
    if (this.verbose) {
      console.error(`💬 Logged conversation: ${summary}`);
    }
  }

  searchMemory(query: string, limit: number = 10): any[] {
    const results: any[] = [];
    const queryLower = query.toLowerCase();
    
    // Search architecture decisions
    if (this.memory?.architecture?.decisions && Array.isArray(this.memory.architecture.decisions)) {
      for (const decision of this.memory.architecture.decisions) {
        if (decision?.decision?.toLowerCase().includes(queryLower) ||
            decision?.rationale?.toLowerCase().includes(queryLower)) {
          results.push({
            type: 'decision',
            relevance: this.calculateRelevance(queryLower, decision.decision + ' ' + decision.rationale),
            data: decision
          });
        }
      }
    }
    
    // Search working solutions
    if (this.memory?.working_solutions && typeof this.memory.working_solutions === 'object') {
      for (const solution of Object.values(this.memory.working_solutions)) {
        if (solution?.problem?.toLowerCase().includes(queryLower) ||
            solution?.solution?.toLowerCase().includes(queryLower)) {
          results.push({
            type: 'solution',
            relevance: this.calculateRelevance(queryLower, solution.problem + ' ' + solution.solution),
            data: solution
          });
        }
      }
    }
    
    // Search conversations
    if (this.memory?.conversations && Array.isArray(this.memory.conversations)) {
      for (const conversation of this.memory.conversations) {
        if (conversation?.summary?.toLowerCase().includes(queryLower)) {
          results.push({
            type: 'conversation',
            relevance: this.calculateRelevance(queryLower, conversation.summary),
            data: conversation
          });
        }
      }
    }
    
    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  private calculateRelevance(query: string, text: string): number {
    const textLower = text.toLowerCase();
    let score = 0;
    
    // Exact match bonus
    if (textLower.includes(query)) {
      score += 10;
    }
    
    // Word match scoring
    const queryWords = query.split(' ');
    const textWords = textLower.split(' ');
    
    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord)) {
          score += queryWord.length / textWord.length;
        }
      }
    }
    
    return score;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async clearMemory(scope: string = 'all', createBackup: boolean = true): Promise<string> {
    if (createBackup) {
      await this.createBackup();
    }

    const now = new Date().toISOString();
    const projectName = path.basename(this.projectRoot);

    switch (scope) {
      case 'all':
        // Reset to initial state
        this.memory = {
          project_info: {
            name: projectName,
            type: this.config.auto_detect_project_type ? this.detectProjectType() : 'unknown',
            description: '',
            createdAt: this.memory.project_info?.createdAt || now,
            lastUpdated: now
          },
          implementation_status: {
            overall_progress: 'unknown',
            components: {}
          },
          architecture: {
            technologies: [],
            decisions: []
          },
          working_solutions: {},
          current_priorities: [],
          conversations: [],
          metadata: {
            version: '1.0.0',
            created_at: this.memory.metadata?.created_at || now,
            last_updated: now
          }
        };
        break;

      case 'decisions':
        this.memory.architecture.decisions = [];
        break;

      case 'solutions':
        this.memory.working_solutions = {};
        break;

      case 'conversations':
        this.memory.conversations = [];
        break;

      case 'components':
        this.memory.implementation_status.components = {};
        this.memory.implementation_status.overall_progress = 'unknown';
        break;

      default:
        throw new Error(`Unknown scope: ${scope}. Use: all, decisions, solutions, conversations, or components`);
    }

    await this.saveMemory();

    if (this.verbose) {
      console.error(`🗑️ Cleared memory scope: ${scope}`);
    }

    const backupMsg = createBackup ? ' (backup created)' : '';
    return `✅ Successfully cleared ${scope} memory${backupMsg}`;
  }
}