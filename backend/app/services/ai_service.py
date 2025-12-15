from anthropic import Anthropic
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from app.core.config import settings
from app.models.inventory import Inventory
from app.models.agent import Agent


class AIService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def generate_migration_plan(
        self, 
        source_agent_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """Generate a comprehensive migration plan using Claude AI"""
        
        # Get latest inventory
        inventory = db.query(Inventory).filter(
            Inventory.agent_id == source_agent_id
        ).order_by(Inventory.timestamp.desc()).first()
        
        if not inventory:
            raise ValueError("No inventory found for agent")
        
        # Prepare context for Claude
        context = self._prepare_inventory_context(inventory)
        
        # Call Claude API
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[
                {
                    "role": "user",
                    "content": f"""You are an expert IT migration specialist. Analyze this PC inventory and create a comprehensive migration plan.

INVENTORY DATA:
{json.dumps(context, indent=2)}

Please provide:
1. **Migration Plan**: Detailed step-by-step migration strategy
2. **Installation Order**: Optimal order for installing applications with dependencies
3. **Tasks**: Specific tasks with estimated times and instructions
4. **Hardware Recommendation**: Recommended PC specs based on usage patterns
5. **Optimization Suggestions**: How to improve the setup on the new machine
6. **Manual Steps**: What cannot be automated and requires manual intervention
7. **Risk Assessment**: Potential issues and mitigation strategies
8. **Estimated Duration**: Total time needed for migration

Return your response as a JSON object with these keys:
- plan: detailed migration strategy
- tasks: array of task objects with name, order, estimated_minutes, instructions, dependencies
- hardware_spec: CPU, RAM, storage, GPU recommendations with justification
- recommendations: optimization suggestions
- manual_steps: array of manual intervention items
- estimated_minutes: total estimated duration
- risks: potential issues and mitigations
"""
                }
            ]
        )
        
        # Parse response
        response_text = message.content[0].text
        
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                result = json.loads(response_text[json_start:json_end])
            else:
                # Fallback if no JSON found
                result = {
                    "plan": response_text,
                    "tasks": [],
                    "hardware_spec": {},
                    "recommendations": {},
                    "manual_steps": [],
                    "estimated_minutes": 0,
                    "risks": []
                }
        except json.JSONDecodeError:
            # Fallback parsing
            result = {
                "plan": response_text,
                "tasks": self._extract_tasks_from_text(response_text),
                "hardware_spec": self._generate_default_hardware_spec(inventory),
                "recommendations": {},
                "manual_steps": [],
                "estimated_minutes": 240,  # Default 4 hours
                "risks": []
            }
        
        return result
    
    def _prepare_inventory_context(self, inventory: Inventory) -> Dict[str, Any]:
        """Prepare inventory data for AI analysis"""
        
        return {
            "system_info": inventory.system_info,
            "applications": {
                "total": inventory.total_applications,
                "list": inventory.installed_applications[:50] if inventory.installed_applications else []
            },
            "usage_patterns": {
                "application_usage": inventory.application_usage[:30] if inventory.application_usage else [],
                "performance": inventory.system_performance
            },
            "data": {
                "total_size_mb": inventory.total_data_size_mb,
                "locations": inventory.user_data_locations
            },
            "certificates": len(inventory.certificates or []),
            "vpn_connections": len(inventory.vpn_connections or [])
        }
    
    def _extract_tasks_from_text(self, text: str) -> list:
        """Extract tasks from unstructured text"""
        # Simple task extraction
        tasks = []
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(marker in line.lower() for marker in ['1.', '2.', '3.', 'step', 'task']):
                tasks.append({
                    "name": line.strip(),
                    "order": len(tasks) + 1,
                    "estimated_minutes": 30,
                    "instructions": line.strip(),
                    "dependencies": []
                })
        return tasks
    
    def _generate_default_hardware_spec(self, inventory: Inventory) -> Dict[str, Any]:
        """Generate default hardware recommendations based on inventory"""
        
        current_ram = 8  # Default
        if inventory.system_info and 'total_memory_mb' in inventory.system_info:
            current_ram = inventory.system_info['total_memory_mb'] / 1024
        
        return {
            "cpu": {
                "recommendation": "Modern multi-core processor (Intel i5/i7 or AMD Ryzen 5/7)",
                "justification": "Based on application requirements"
            },
            "ram": {
                "recommendation_gb": max(16, int(current_ram * 1.5)),
                "justification": f"Current system has {current_ram:.0f}GB, recommended 50% increase"
            },
            "storage": {
                "recommendation_gb": max(512, inventory.total_data_size_mb * 2),
                "type": "NVMe SSD",
                "justification": "Fast storage for better performance"
            },
            "gpu": {
                "recommendation": "Integrated graphics sufficient",
                "justification": "No intensive graphics applications detected"
            }
        }


