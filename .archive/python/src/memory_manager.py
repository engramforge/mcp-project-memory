"""
Memory Manager for Project Memory MCP Server
===========================================

Handles persistent storage and retrieval of project memory including:
- Project metadata and status
- Implementation progress tracking
- Architecture decisions with rationale
- Working solutions and troubleshooting notes
- Conversation context and history
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import re

class ProjectMemoryManager:
    """
    Manages persistent project memory storage and retrieval.
    
    Provides methods to:
    - Track implementation status across components
    - Record architecture decisions with rationale
    - Store working solutions for common problems
    - Maintain conversation context across sessions
    - Search through accumulated project knowledge
    """
    
    def __init__(
        self, 
        project_root: str,
        memory_dir: str = ".project_memory",
        config_file: Optional[str] = None,
        verbose: bool = False
    ):
        self.project_root = Path(project_root).resolve()
        self.memory_dir = self.project_root / memory_dir
        self.verbose = verbose
        
        # Ensure memory directory exists
        self.memory_dir.mkdir(exist_ok=True)
        
        # Memory file paths
        self.memory_file = self.memory_dir / "project_memory.json"
        self.context_file = self.memory_dir / "current_context.json"
        self.decisions_file = self.memory_dir / "architecture_decisions.json"
        self.solutions_file = self.memory_dir / "working_solutions.json"
        self.conversations_file = self.memory_dir / "conversations.json"
        
        # Load configuration
        self.config = self._load_config(config_file)
        
        # Initialize memory structure
        self.memory = self._load_memory()
        
        if self.verbose:
            print(f"📁 Memory directory: {self.memory_dir}", file=sys.stderr)
            print(f"📝 Memory files initialized", file=sys.stderr)
    
    def _load_config(self, config_file: Optional[str]) -> Dict[str, Any]:
        """Load configuration from file or use defaults."""
        default_config = {
            "max_conversation_history": 100,
            "backup_enabled": True,
            "backup_interval": 3600,
            "compression_enabled": False,
            "auto_detect_project_type": True
        }
        
        if config_file and Path(config_file).exists():
            try:
                with open(config_file, 'r') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                if self.verbose:
                    print(f"⚠️ Warning: Could not load config file {config_file}: {e}", file=sys.stderr)
        
        return default_config
    
    def _detect_project_info(self) -> Dict[str, Any]:
        """Auto-detect project information from common files."""
        project_info = {
            "name": self.project_root.name,
            "type": "unknown",
            "description": f"Development project in {self.project_root.name}",
            "detected_technologies": []
        }
        
        # Check for common project files
        files_to_check = {
            "package.json": ("node", "JavaScript/Node.js project"),
            "requirements.txt": ("python", "Python project"),
            "Cargo.toml": ("rust", "Rust project"),
            "go.mod": ("go", "Go project"),
            "pom.xml": ("java", "Java/Maven project"),
            "build.gradle": ("java", "Java/Gradle project"),
            "composer.json": ("php", "PHP project"),
            "Gemfile": ("ruby", "Ruby project"),
            "Dockerfile": ("docker", "Containerized project"),
            "docker-compose.yml": ("docker", "Docker Compose project"),
            ".git": ("git", "Git repository")
        }
        
        technologies = []
        for filename, (tech, description) in files_to_check.items():
            if (self.project_root / filename).exists():
                technologies.append(tech)
                if project_info["type"] == "unknown":
                    project_info["type"] = tech
                    project_info["description"] = description
        
        project_info["detected_technologies"] = technologies
        
        # Try to extract project name from package.json
        package_json = self.project_root / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    package_data = json.load(f)
                    if "name" in package_data:
                        project_info["name"] = package_data["name"]
                    if "description" in package_data:
                        project_info["description"] = package_data["description"]
            except Exception:
                pass
        
        return project_info
    
    def _load_memory(self) -> Dict[str, Any]:
        """Load project memory from persistent storage."""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r') as f:
                    memory = json.load(f)
                # Ensure all required sections exist
                return self._ensure_memory_structure(memory)
            except Exception as e:
                if self.verbose:
                    print(f"⚠️ Warning: Could not load memory file: {e}", file=sys.stderr)
        
        # Initialize new memory structure
        project_info = self._detect_project_info()
        
        return {
            "project_info": {
                **project_info,
                "version": "1.0.0",
                "created": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "project_root": str(self.project_root)
            },
            "implementation_status": {
                "overall_progress": "in_progress",
                "components": {},
                "last_assessment": datetime.now().isoformat()
            },
            "architecture": {
                "decisions": [],
                "technologies": project_info.get("detected_technologies", []),
                "patterns": []
            },
            "current_priorities": [],
            "working_solutions": {},
            "known_issues": {},
            "lessons_learned": [],
            "conversation_history": [],
            "metadata": {
                "total_conversations": 0,
                "total_decisions": 0,
                "total_solutions": 0,
                "last_active": datetime.now().isoformat()
            }
        }
    
    def _ensure_memory_structure(self, memory: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure memory has all required sections."""
        required_sections = [
            "project_info", "implementation_status", "architecture",
            "current_priorities", "working_solutions", "known_issues",
            "lessons_learned", "conversation_history", "metadata"
        ]
        
        for section in required_sections:
            if section not in memory:
                memory[section] = {} if section != "current_priorities" else []
        
        # Ensure subsections exist
        if "components" not in memory.get("implementation_status", {}):
            memory["implementation_status"]["components"] = {}
        
        if "decisions" not in memory.get("architecture", {}):
            memory["architecture"]["decisions"] = []
        
        return memory
    
    def _save_memory(self):
        """Save current memory state to persistent storage."""
        try:
            # Update metadata
            self.memory["project_info"]["last_updated"] = datetime.now().isoformat()
            self.memory["metadata"]["last_active"] = datetime.now().isoformat()
            
            # Save main memory file
            with open(self.memory_file, 'w') as f:
                json.dump(self.memory, f, indent=2)
            
            # Save current context snapshot
            context = self.get_current_context()
            with open(self.context_file, 'w') as f:
                json.dump(context, f, indent=2)
            
            # Create backup if enabled
            if self.config.get("backup_enabled", True):
                self._create_backup()
                
        except Exception as e:
            if self.verbose:
                print(f"❌ Error saving memory: {e}", file=sys.stderr)
            raise
    
    def _create_backup(self):
        """Create a backup of the memory files."""
        backup_dir = self.memory_dir / "backups"
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"memory_backup_{timestamp}.json"
        
        try:
            with open(backup_file, 'w') as f:
                json.dump(self.memory, f, indent=2)
            
            # Keep only last 10 backups
            backups = sorted(backup_dir.glob("memory_backup_*.json"))
            if len(backups) > 10:
                for old_backup in backups[:-10]:
                    old_backup.unlink()
                    
        except Exception as e:
            if self.verbose:
                print(f"⚠️ Warning: Could not create backup: {e}", file=sys.stderr)
    
    def get_current_context(self) -> Dict[str, Any]:
        """Get comprehensive current project context."""
        return {
            "project_name": self.memory["project_info"].get("name", "Unknown"),
            "project_type": self.memory["project_info"].get("type", "unknown"),
            "project_description": self.memory["project_info"].get("description", ""),
            "project_root": str(self.project_root),
            "overall_progress": self.memory["implementation_status"].get("overall_progress", "unknown"),
            "components": self.memory["implementation_status"].get("components", {}),
            "priorities": self.memory.get("current_priorities", []),
            "technologies": self.memory["architecture"].get("technologies", []),
            "recent_decisions": self.memory["architecture"]["decisions"][-5:] if self.memory["architecture"]["decisions"] else [],
            "solutions": self.memory.get("working_solutions", {}),
            "known_issues": self.memory.get("known_issues", {}),
            "recent_conversations": self.memory["conversation_history"][-3:] if self.memory["conversation_history"] else [],
            "last_updated": self.memory["project_info"].get("last_updated", "unknown"),
            "statistics": {
                "total_components": len(self.memory["implementation_status"].get("components", {})),
                "total_decisions": len(self.memory["architecture"]["decisions"]),
                "total_solutions": len(self.memory.get("working_solutions", {})),
                "total_conversations": len(self.memory["conversation_history"])
            }
        }
    
    def update_implementation_status(self, component: str, status: str, details: str = "", progress: Optional[int] = None):
        """Update implementation status for a component."""
        timestamp = datetime.now().isoformat()
        
        # Update component status
        self.memory["implementation_status"]["components"][component] = {
            "status": status,
            "details": details,
            "progress": progress,
            "last_updated": timestamp
        }
        
        # Update overall progress
        components = self.memory["implementation_status"]["components"]
        if components:
            completed = sum(1 for comp in components.values() if comp.get("status") == "complete")
            total = len(components)
            overall_progress = f"{completed}/{total} components complete"
            
            if completed == total:
                self.memory["implementation_status"]["overall_progress"] = "complete"
            elif completed > 0:
                self.memory["implementation_status"]["overall_progress"] = f"in_progress ({overall_progress})"
            else:
                self.memory["implementation_status"]["overall_progress"] = "not_started"
        
        self.memory["implementation_status"]["last_assessment"] = timestamp
        self._save_memory()
        
        if self.verbose:
            print(f"📊 Updated {component}: {status}", file=sys.stderr)
    
    def add_architecture_decision(self, decision: str, rationale: str, impact: str = "", alternatives: List[str] = None):
        """Record an architecture decision."""
        timestamp = datetime.now().isoformat()
        
        decision_record = {
            "id": len(self.memory["architecture"]["decisions"]) + 1,
            "timestamp": timestamp,
            "decision": decision,
            "rationale": rationale,
            "impact": impact,
            "alternatives_considered": alternatives or [],
            "status": "active",
            "tags": self._extract_tags(decision + " " + rationale)
        }
        
        self.memory["architecture"]["decisions"].append(decision_record)
        self.memory["metadata"]["total_decisions"] = len(self.memory["architecture"]["decisions"])
        
        self._save_memory()
        
        if self.verbose:
            print(f"🏗️ Recorded decision: {decision}", file=sys.stderr)
    
    def add_working_solution(self, problem: str, solution: str, command: str = "", tags: List[str] = None):
        """Record a working solution for future reference."""
        timestamp = datetime.now().isoformat()
        
        solution_key = self._generate_solution_key(problem)
        solution_record = {
            "problem": problem,
            "solution": solution,
            "command": command,
            "timestamp": timestamp,
            "verified": True,
            "tags": tags or self._extract_tags(problem + " " + solution),
            "usage_count": 1
        }
        
        # If solution already exists, update it and increment usage
        if solution_key in self.memory["working_solutions"]:
            existing = self.memory["working_solutions"][solution_key]
            solution_record["usage_count"] = existing.get("usage_count", 0) + 1
            solution_record["previous_versions"] = existing.get("previous_versions", [])
            solution_record["previous_versions"].append({
                "solution": existing["solution"],
                "timestamp": existing["timestamp"]
            })
        
        self.memory["working_solutions"][solution_key] = solution_record
        self.memory["metadata"]["total_solutions"] = len(self.memory["working_solutions"])
        
        self._save_memory()
        
        if self.verbose:
            print(f"🔧 Recorded solution: {problem}", file=sys.stderr)
    
    def update_priorities(self, new_priorities: List[str]):
        """Update current project priorities."""
        timestamp = datetime.now().isoformat()
        
        # Store previous priorities for history
        if self.memory["current_priorities"]:
            priority_change = {
                "timestamp": timestamp,
                "old_priorities": self.memory["current_priorities"].copy(),
                "new_priorities": new_priorities.copy()
            }
            
            if "priority_history" not in self.memory:
                self.memory["priority_history"] = []
            self.memory["priority_history"].append(priority_change)
        
        self.memory["current_priorities"] = new_priorities
        self._save_memory()
        
        if self.verbose:
            print(f"🎯 Updated priorities ({len(new_priorities)} items)", file=sys.stderr)
    
    def log_conversation_context(self, summary: str, decisions_made: List[str] = None, solutions_found: List[str] = None):
        """Log context from a conversation for future reference."""
        timestamp = datetime.now().isoformat()
        
        conversation_record = {
            "id": len(self.memory["conversation_history"]) + 1,
            "timestamp": timestamp,
            "summary": summary,
            "decisions_made": decisions_made or [],
            "solutions_found": solutions_found or [],
            "session_id": f"session_{timestamp.replace(':', '').replace('-', '')}"
        }
        
        self.memory["conversation_history"].append(conversation_record)
        self.memory["metadata"]["total_conversations"] = len(self.memory["conversation_history"])
        
        # Keep only the most recent conversations based on config
        max_history = self.config.get("max_conversation_history", 100)
        if len(self.memory["conversation_history"]) > max_history:
            self.memory["conversation_history"] = self.memory["conversation_history"][-max_history:]
        
        self._save_memory()
        
        if self.verbose:
            print(f"💬 Logged conversation: {summary[:50]}...", file=sys.stderr)
    
    def search_memory(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search through project memory for relevant information."""
        results = []
        query_lower = query.lower()
        query_words = re.findall(r'\w+', query_lower)
        
        # Search architecture decisions
        for decision in self.memory["architecture"]["decisions"]:
            score = self._calculate_relevance_score(query_words, decision, [
                "decision", "rationale", "impact"
            ])
            if score > 0:
                results.append({
                    "type": "architecture_decision",
                    "content": decision,
                    "relevance_score": score,
                    "summary": decision["decision"][:100] + "..."
                })
        
        # Search working solutions
        for key, solution in self.memory["working_solutions"].items():
            score = self._calculate_relevance_score(query_words, solution, [
                "problem", "solution", "command"
            ])
            if score > 0:
                results.append({
                    "type": "working_solution",
                    "content": solution,
                    "relevance_score": score,
                    "summary": solution["problem"][:100] + "..."
                })
        
        # Search conversation history
        for conversation in self.memory["conversation_history"]:
            score = self._calculate_relevance_score(query_words, conversation, [
                "summary"
            ])
            if score > 0:
                results.append({
                    "type": "conversation",
                    "content": conversation,
                    "relevance_score": score,
                    "summary": conversation["summary"][:100] + "..."
                })
        
        # Search implementation status
        for component, status in self.memory["implementation_status"]["components"].items():
            score = self._calculate_relevance_score(query_words, {
                "component": component,
                **status
            }, ["component", "details", "status"])
            if score > 0:
                results.append({
                    "type": "implementation_status",
                    "content": {"component": component, **status},
                    "relevance_score": score,
                    "summary": f"{component}: {status.get('status', 'unknown')}"
                })
        
        # Sort by relevance score and limit results
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:limit]
    
    def get_project_summary(self) -> str:
        """Get a comprehensive project summary formatted for AI context."""
        context = self.get_current_context()
        
        # Build summary sections
        sections = [
            f"PROJECT: {context['project_name']}",
            f"TYPE: {context['project_type']}",
            f"DESCRIPTION: {context['project_description']}",
            f"ROOT: {context['project_root']}",
            "",
            f"PROGRESS: {context['overall_progress']}",
            f"COMPONENTS: {context['statistics']['total_components']} tracked",
            f"DECISIONS: {context['statistics']['total_decisions']} recorded",
            f"SOLUTIONS: {context['statistics']['total_solutions']} available",
            ""
        ]
        
        # Add current priorities
        if context['priorities']:
            sections.append("CURRENT PRIORITIES:")
            for i, priority in enumerate(context['priorities'][:5], 1):
                sections.append(f"  {i}. {priority}")
            sections.append("")
        
        # Add technologies
        if context['technologies']:
            sections.append(f"TECHNOLOGIES: {', '.join(context['technologies'])}")
            sections.append("")
        
        # Add recent decisions
        if context['recent_decisions']:
            sections.append("RECENT DECISIONS:")
            for decision in context['recent_decisions']:
                sections.append(f"  • {decision['decision']}")
            sections.append("")
        
        # Add known issues
        if context['known_issues']:
            sections.append("KNOWN ISSUES:")
            for issue_key, issue in list(context['known_issues'].items())[:3]:
                sections.append(f"  • {issue}")
            sections.append("")
        
        return "\n".join(sections)
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extract relevant tags from text for categorization."""
        tech_keywords = {
            'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java',
            'docker', 'kubernetes', 'redis', 'postgresql', 'mongodb', 'api', 'rest',
            'graphql', 'fastapi', 'express', 'flask', 'django', 'spring', 'authentication',
            'database', 'cache', 'security', 'deployment', 'testing', 'performance'
        }
        
        words = re.findall(r'\w+', text.lower())
        tags = [word for word in words if word in tech_keywords]
        return list(set(tags))  # Remove duplicates
    
    def _generate_solution_key(self, problem: str) -> str:
        """Generate a consistent key for a solution based on the problem."""
        # Clean and normalize the problem text
        key = re.sub(r'[^\w\s]', '', problem.lower())
        key = re.sub(r'\s+', '_', key.strip())
        key = key[:50]  # Limit length
        return key
    
    def _calculate_relevance_score(self, query_words: List[str], item: Dict[str, Any], search_fields: List[str]) -> float:
        """Calculate relevance score for search results."""
        score = 0.0
        total_words = 0
        
        for field in search_fields:
            if field in item and item[field]:
                text = str(item[field]).lower()
                words = re.findall(r'\w+', text)
                total_words += len(words)
                
                # Exact matches get higher score
                for query_word in query_words:
                    if query_word in text:
                        score += 2.0 if query_word in words else 1.0
        
        # Normalize score by text length to avoid bias toward longer texts
        return score / max(total_words, 1) if total_words > 0 else 0.0
