import asyncio
from app.main import investigate_incident, incidents_db, resolve_incident, IncidentResolution, hindsight_client
import uuid
import sys

async def main():
    print("Testing learning loop...")

    test3_iid = str(uuid.uuid4())
    incidents_db[test3_iid] = {
        "service": "notification-service",
        "severity": "High",
        "error": "429 Too Many Requests",
        "description": "Notification delivery has dropped sharply after deployment v2.5.0. The notification-service is sending a sudden burst of requests to the external messaging provider, which is returning rate-limit responses.",
        "environment": "production",
        "deployment_version": "v2.5.0",
        "logs": ""
    }

    res = IncidentResolution(
        actual_root_cause="Retry/burst behavior after deployment caused excessive outbound requests to the messaging provider.",
        action_taken="Rolled back the deployment and introduced request throttling and exponential backoff.",
        outcome="429 responses returned to normal levels.",
        resolution_time="15m",
        lessons_learned="Monitor outbound provider request rates and retry behavior after notification-service deployments."
    )

    print("Resolving incident...")
    await resolve_incident(test3_iid, res)

    print("\n--- Investigating identical new incident ---")
    new_iid = str(uuid.uuid4())
    incidents_db[new_iid] = {
        "service": "notification-service",
        "severity": "High",
        "error": "429 Too Many Requests",
        "description": "Notification delivery dropped after recent deployment.",
        "environment": "production",
        "deployment_version": "v2.5.1",
        "logs": ""
    }
    
    try:
        new_res = await investigate_incident(new_iid)
        print(f"Likely Root Cause: {new_res.likely_root_cause}")
        print("Historical Evidence:")
        for m in new_res.historical_evidence:
            print(f" - {getattr(m, 'category', 'None')}: {m.content[:100]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
