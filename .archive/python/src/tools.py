"""
MCP Tools for Project Memory Server
==================================

Implements MCP tool definitions and handlers for project memory operations.
"""

import json
from typing import Any, Dict, List
import mcp.types as types
from memory_manager import ProjectMemoryManager

class MemoryTools:
    """MCP tools for project memory management."""
    
    def __init__(self, memory_manager: ProjectMemoryManager):
        self.memory_manager = memory_manager
    
    def get_tool_definitions(self) -> List[types.Tool]:
        """Get all tool definitions for the MCP server."""
        return [
            types.Tool(
                name="get_project_context",
                description="Get comprehensive current project context and status",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            ),
            types.Tool(
                name="update_implementation_status",
                description="Update implementation status for a project component",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "component": {
                            "type": "string",
                            "description": "Name of the component (e.g., 'frontend', 'api', 'database')"
                        },
                        "status": {
                            "type": "string",
                            "enum": ["not_started", "in_progress", "complete", "blocked", "deprecated"],
                            "description": "Current status of the component"
                        },
                        "details": {
                            "type": "string",
                            "description": "Additional details about the status or progress"
                        },
                        "progress": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Progress percentage (0-100)"
                        }
                    },
                    "required": ["component", "status"]
                }
            ),
            types.Tool(
                name="add_architecture_decision",
                description="Record an architecture decision with rationale and impact",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "decision": {
                            "type": "string",
                            "description": "The architecture decision that was made"
                        },
                        "rationale": {
                            "type": "string",
                            "description": "The reasoning behind this decision"
                        },
                        "impact": {
                            "type": "string",
                            "description": "Expected impact or consequences of this decision"
                        },
                        "alternatives": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Alternative approaches that were considered"
                        }
                    },
                    "required": ["decision", "rationale"]
                }
            ),
            types.Tool(
                name="add_working_solution",
                description="Record a working solution for a problem that can be referenced later",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "problem": {
                            "type": "string",
                            "description": "Description of the problem that was solved"
                        },
                        "solution": {
                            "type": "string",
                            "description": "The working solution or approach"
                        },
                        "command": {
                            "type": "string",
                            "description": "Command, code snippet, or exact steps to implement the solution"
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Tags for categorizing this solution"
                        }
                    },
                    "required": ["problem", "solution"]
                }
            ),
            types.Tool(
                name="update_priorities",
                description="Update the current project priorities in order of importance",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "priorities": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of current priorities in order of importance"
                        }
                    },
                    "required": ["priorities"]
                }
            ),
            types.Tool(
                name="search_memory",
                description="Search through project memory for relevant information",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query to find relevant decisions, solutions, or conversations"
                        },
                        "limit": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 50,
                            "default": 10,
                            "description": "Maximum number of results to return"
                        }
                    },
                    "required": ["query"]
                }
            ),
            types.Tool(
                name="log_conversation_context",
                description="Log the context and outcomes from the current conversation",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string",
                            "description": "Summary of what was discussed or accomplished in this conversation"
                        },
                        "decisions_made": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of decisions made during this conversation"
                        },
                        "solutions_found": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of solutions discovered or implemented"
                        }
                    },
                    "required": ["summary"]
                }
            ),
            types.Tool(
                name="get_project_summary",
                description="Get a comprehensive project summary formatted for AI context",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "include_details": {
                            "type": "boolean",
                            "default": True,
                            "description": "Include detailed information about components and decisions"
                        }
                    },
                    "required": []
                }
            )
        ]
    
    async def handle_tool_call(self, name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle tool calls and route to appropriate methods."""
        
        try:
            if name == "get_project_context":
                return await self._handle_get_project_context(arguments)
            
            elif name == "update_implementation_status":
                return await self._handle_update_implementation_status(arguments)
            
            elif name == "add_architecture_decision":
                return await self._handle_add_architecture_decision(arguments)
            
            elif name == "add_working_solution":
                return await self._handle_add_working_solution(arguments)
            
            elif name == "update_priorities":
                return await self._handle_update_priorities(arguments)
            
            elif name == "search_memory":
                return await self._handle_search_memory(arguments)
            
            elif name == "log_conversation_context":
                return await self._handle_log_conversation_context(arguments)
            
            elif name == "get_project_summary":
                return await self._handle_get_project_summary(arguments)
            
            else:
                raise ValueError(f"Unknown tool: {name}")
                
        except Exception as e:
            return [types.TextContent(
                type="text",
                text=f"Error executing {name}: {str(e)}"
            )]
    
    async def _handle_get_project_context(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle get_project_context tool call."""
        context = self.memory_manager.get_current_context()
        
        formatted_context = {
            "project_overview": {
                "name": context["project_name"],
                "type": context["project_type"],
                "description": context["project_description"],
                "progress": context["overall_progress"]
            },
            "current_priorities": context["priorities"],
            "recent_activity": {
                "recent_decisions": context["recent_decisions"],
                "recent_conversations": context["recent_conversations"]
            },
            "implementation_status": context["components"],
            "available_solutions": list(context["solutions"].keys()),
            "known_issues": context["known_issues"],
            "statistics": context["statistics"],
            "technologies": context["technologies"],
            "last_updated": context["last_updated"]
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(formatted_context, indent=2)
        )]
    
    async def _handle_update_implementation_status(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle update_implementation_status tool call."""
        component = arguments["component"]
        status = arguments["status"]
        details = arguments.get("details", "")
        progress = arguments.get("progress")
        
        self.memory_manager.update_implementation_status(component, status, details, progress)
        
        # Get updated context to show current state
        context = self.memory_manager.get_current_context()
        component_info = context["components"].get(component, {})
        
        result = {
            "success": True,
            "component": component,
            "updated_status": {
                "status": status,
                "details": details,
                "progress": progress,
                "last_updated": component_info.get("last_updated")
            },
            "overall_progress": context["overall_progress"]
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
    
    async def _handle_add_architecture_decision(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle add_architecture_decision tool call."""
        decision = arguments["decision"]
        rationale = arguments["rationale"]
        impact = arguments.get("impact", "")
        alternatives = arguments.get("alternatives", [])
        
        self.memory_manager.add_architecture_decision(decision, rationale, impact, alternatives)
        
        # Get updated statistics
        context = self.memory_manager.get_current_context()
        
        result = {
            "success": True,
            "decision_recorded": decision,
            "total_decisions": context["statistics"]["total_decisions"],
            "message": f"Architecture decision recorded successfully"
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
    
    async def _handle_add_working_solution(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle add_working_solution tool call."""
        problem = arguments["problem"]
        solution = arguments["solution"]
        command = arguments.get("command", "")
        tags = arguments.get("tags", [])
        
        self.memory_manager.add_working_solution(problem, solution, command, tags)
        
        # Get updated statistics
        context = self.memory_manager.get_current_context()
        
        result = {
            "success": True,
            "solution_recorded": problem,
            "total_solutions": context["statistics"]["total_solutions"],
            "message": f"Working solution recorded successfully"
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
    
    async def _handle_update_priorities(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle update_priorities tool call."""
        priorities = arguments["priorities"]
        
        self.memory_manager.update_priorities(priorities)
        
        result = {
            "success": True,
            "updated_priorities": priorities,
            "priority_count": len(priorities),
            "message": f"Updated project priorities with {len(priorities)} items"
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
    
    async def _handle_search_memory(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle search_memory tool call."""
        query = arguments["query"]
        limit = arguments.get("limit", 10)
        
        results = self.memory_manager.search_memory(query, limit)
        
        search_result = {
            "query": query,
            "total_results": len(results),
            "results": [
                {
                    "type": result["type"],
                    "summary": result["summary"],
                    "relevance_score": result["relevance_score"],
                    "content": result["content"]
                }
                for result in results
            ]
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(search_result, indent=2)
        )]
    
    async def _handle_log_conversation_context(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle log_conversation_context tool call."""
        summary = arguments["summary"]
        decisions_made = arguments.get("decisions_made", [])
        solutions_found = arguments.get("solutions_found", [])
        
        self.memory_manager.log_conversation_context(summary, decisions_made, solutions_found)
        
        # Get updated statistics
        context = self.memory_manager.get_current_context()
        
        result = {
            "success": True,
            "conversation_logged": summary,
            "total_conversations": context["statistics"]["total_conversations"],
            "decisions_recorded": len(decisions_made),
            "solutions_recorded": len(solutions_found),
            "message": "Conversation context logged successfully"
        }
        
        return [types.TextContent(
            type="text",
            text=json.dumps(result, indent=2)
        )]
    
    async def _handle_get_project_summary(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle get_project_summary tool call."""
        include_details = arguments.get("include_details", True)
        
        if include_details:
            summary = self.memory_manager.get_project_summary()
        else:
            context = self.memory_manager.get_current_context()
            summary = f"""
PROJECT: {context['project_name']}
TYPE: {context['project_type']}
PROGRESS: {context['overall_progress']}
COMPONENTS: {context['statistics']['total_components']}
DECISIONS: {context['statistics']['total_decisions']}
SOLUTIONS: {context['statistics']['total_solutions']}
PRIORITIES: {len(context['priorities'])}
""".strip()
        
        return [types.TextContent(
            type="text",
            text=summary
        )]
