import os
import httpx
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="IncidentMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
HINDSIGHT_BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "incidentmind")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not HINDSIGHT_API_KEY:
    raise RuntimeError("HINDSIGHT_API_KEY is missing. Real API credentials are required.")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing. Real API credentials are required.")

genai.configure(api_key=GEMINI_API_KEY)

# Models
class IncidentCreate(BaseModel):
    service: str
    severity: str
    error: str
    description: str
    logs: Optional[str] = None
    environment: str
    deployment_version: Optional[str] = None

class IncidentResolution(BaseModel):
    actual_root_cause: str
    action_taken: str
    outcome: str
    resolution_time: str
    lessons_learned: str

class Memory(BaseModel):
    id: str
    content: str
    metadata: dict
    category: Optional[str] = None

class InvestigationResult(BaseModel):
    likely_root_cause: str
    reasoning: str
    historical_evidence: List[Memory]
    recommended_investigation: str
    recommended_action: str
    confidence: str

# Services
from hindsight_client import Hindsight

class HindsightService:
    def __init__(self):
        self.client = Hindsight(
            base_url=HINDSIGHT_BASE_URL,
            api_key=HINDSIGHT_API_KEY
        )

    async def recall(self, query: str) -> List[Memory]:
        """Call Hindsight recall API using the official SDK."""
        try:
            results = await self.client.arecall(bank_id=HINDSIGHT_BANK_ID, query=query)
            if not results or not getattr(results, "results", None):
                return []
            memories = []
            for r in results.results:
                mem_id = getattr(r, "id", "") or (r.get("id", "") if isinstance(r, dict) else "")
                content = getattr(r, "text", "") or (r.get("text", "") if isinstance(r, dict) else "")
                metadata = getattr(r, "metadata", {}) or (r.get("metadata", {}) if isinstance(r, dict) else {})
                memories.append(Memory(id=mem_id, content=content, metadata=metadata))
            return memories
        except Exception as e:
            print(f"Hindsight API recall error: {e}")
            raise HTTPException(status_code=500, detail="Hindsight API recall failed")

    async def retain(self, data: dict) -> bool:
        """Call Hindsight retain API using the official SDK."""
        try:
            content_str = str(data)
            await self.client.aretain(bank_id=HINDSIGHT_BANK_ID, content=content_str)
            return True
        except Exception as e:
            print(f"Hindsight API retain error: {e}")
            raise HTTPException(status_code=500, detail="Hindsight API retain failed")

hindsight_client = HindsightService()

# In-memory store for incidents during MVP demo
# In production, this would be a real database.
incidents_db = {}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/incidents")
def create_incident(incident: IncidentCreate):
    incident_id = str(uuid.uuid4())
    incidents_db[incident_id] = incident.model_dump()
    return {"incident_id": incident_id, "status": "created"}

@app.get("/api/incidents")
def get_incidents():
    return [{"id": k, **v} for k, v in incidents_db.items()]

@app.post("/api/incidents/{incident_id}/investigate", response_model=InvestigationResult)
async def investigate_incident(incident_id: str):
    if incident_id not in incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident = incidents_db[incident_id]
    
    # Construct query for Hindsight dynamically
    query_parts = [incident['service'], incident['error'], incident['description']]
    if incident.get('environment'):
        query_parts.append(incident['environment'])
    if incident.get('deployment_version'):
        query_parts.append(f"deployment {incident['deployment_version']}")
    
    query = " ".join(query_parts)
    
    # Recall memories
    raw_memories = await hindsight_client.recall(query)
    
    memories = []
    direct_matches = []
    related_technical = []
    organizational = []
    
    service_lower = incident['service'].lower()
    error_lower = incident['error'].lower()
    
    # Extract key words from error for related tech matching
    error_words = [w for w in error_lower.split() if len(w) > 3]
    
    for m in raw_memories:
        content = m.content.lower()
        same_service = service_lower in content
        
        # Check if error words match
        same_error = any(w in content for w in error_words) if error_words else error_lower in content
        
        is_deployment_related = "deploy" in content or (incident.get('deployment_version') and incident['deployment_version'].lower() in content)
        
        if same_service and same_error:
            m.category = 'DIRECT_MATCH'
            direct_matches.append(m)
        elif same_error:
            m.category = 'RELATED_TECHNICAL_PATTERN'
            related_technical.append(m)
        elif is_deployment_related or same_service:
            m.category = 'ORGANIZATIONAL_PATTERN'
            organizational.append(m)
        else:
            m.category = 'IRRELEVANT'
            
        memories.append(m)
    
    memory_text = ""
    if direct_matches:
        memory_text += "DIRECT HISTORICAL EVIDENCE:\n"
        memory_text += "\n\n".join([f"Memory ID: {m.id}\nContent: {m.content}" for m in direct_matches]) + "\n\n"
    else:
        memory_text += "DIRECT HISTORICAL EVIDENCE:\nNo direct historical incidents found for this service and error.\n\n"
        
    if related_technical:
        memory_text += "RELATED TECHNICAL PATTERNS:\n"
        memory_text += "\n\n".join([f"Memory ID: {m.id}\nContent: {m.content}" for m in related_technical]) + "\n\n"
        
    if organizational:
        memory_text += "BROADER ORGANIZATIONAL PATTERNS:\n"
        memory_text += "\n\n".join([f"Memory ID: {m.id}\nContent: {m.content}" for m in organizational]) + "\n\n"

    if not memory_text.strip() or (not direct_matches and not related_technical and not organizational):
        memory_text = "No relevant historical incidents were found. This may be a new incident pattern."

    prompt = f"""
    You are IncidentMind, an AI Incident Response Agent. Analyze the current incident using the provided historical evidence.
    
    CURRENT INCIDENT:
    Service: {incident['service']}
    Severity: {incident['severity']}
    Error: {incident['error']}
    Description: {incident['description']}
    Logs: {incident.get('logs', 'N/A')}
    Environment: {incident['environment']}
    Deployment Version: {incident.get('deployment_version', 'N/A')}
    
    HISTORICAL EVIDENCE FROM HINDSIGHT:
    {memory_text}
    
    Provide your analysis in structured JSON format with the following keys:
    - likely_root_cause: (string)
    - reasoning: (string) Explain how historical evidence influenced this.
    - recommended_investigation: (string)
    - recommended_action: (string)
    - confidence: (string) e.g., High, Medium, Low
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        import json
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        result = json.loads(raw_text.strip())
        
        return InvestigationResult(
            likely_root_cause=result.get("likely_root_cause", "Unknown"),
            reasoning=result.get("reasoning", "No reasoning provided"),
            historical_evidence=memories,
            recommended_investigation=result.get("recommended_investigation", "N/A"),
            recommended_action=result.get("recommended_action", "N/A"),
            confidence=result.get("confidence", "Medium")
        )
    except Exception as e:
        print(f"LLM Error: {e}")
        import traceback
        with open("/tmp/incidentmind_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to generate AI analysis")

@app.post("/api/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str, resolution: IncidentResolution):
    if incident_id not in incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident = incidents_db[incident_id]
    
    memory_data = {
        "incident_id": incident_id,
        "service": incident["service"],
        "error": incident["error"],
        "actual_root_cause": resolution.actual_root_cause,
        "action_taken": resolution.action_taken,
        "outcome": resolution.outcome,
        "resolution_time": resolution.resolution_time,
        "lessons_learned": resolution.lessons_learned
    }
    
    success = await hindsight_client.retain(memory_data)
    
    return {"status": "resolved", "memory_retained": success}

@app.post("/api/demo/seed")
async def seed_demo_data():
    demo_memories = [
        {
            "incident_id": "seed-1",
            "service": "payment-service",
            "error": "503 Service Unavailable",
            "actual_root_cause": "Connection pool exhausted due to connection leak introduced in deployment v2.4.1",
            "action_taken": "Rolled back to v2.4.0 and restarted service",
            "outcome": "Service recovered immediately",
            "resolution_time": "45m",
            "lessons_learned": "Always check connection pool config on payment-service deployments."
        },
        {
            "incident_id": "seed-2",
            "service": "database",
            "error": "Query timeout",
            "actual_root_cause": "Missing index on user table",
            "action_taken": "Added index concurrently",
            "outcome": "Query times returned to normal",
            "resolution_time": "1h",
            "lessons_learned": "Review query plans for large tables."
        },
        {
            "incident_id": "seed-3",
            "service": "authentication",
            "error": "Timeout",
            "actual_root_cause": "Redis cache failure",
            "action_taken": "Restarted Redis",
            "outcome": "Authentication returned to normal",
            "resolution_time": "15m",
            "lessons_learned": "Add alert for Redis memory limits."
        },
        {
            "incident_id": "seed-4",
            "service": "notification-service",
            "error": "429 Too Many Requests",
            "actual_root_cause": "Request batching/retry behavior caused excessive provider requests.",
            "action_taken": "Rolled back the deployment and introduced request throttling/backoff.",
            "outcome": "429 responses returned to normal levels",
            "resolution_time": "30m",
            "lessons_learned": "Inspect outbound request rate and retry behavior before escalating provider-side failures."
        }
    ]
    
    retained_count = 0
    for mem in demo_memories:
        try:
            success = await hindsight_client.retain(mem)
            if success:
                retained_count += 1
        except Exception as e:
            print(f"Error seeding memory: {e}")
            
    return {"status": "seeded", "count": retained_count}
