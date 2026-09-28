import asyncio
from app.main import investigate_incident, incidents_db, hindsight_client, seed_demo_data
import uuid
import sys

async def main():
    print("Seeding demo data...")
    await seed_demo_data()

    tests = [
        {
            "name": "TEST 1",
            "service": "payment-service",
            "severity": "High",
            "error": "503",
            "description": "connection pool exhaustion",
            "environment": "production",
            "deployment_version": "v2.5.0",
            "logs": ""
        },
        {
            "name": "TEST 2",
            "service": "database",
            "severity": "High",
            "error": "504 Query timeout",
            "description": "slow database queries",
            "environment": "production",
            "deployment_version": "v2.5.0",
            "logs": ""
        },
        {
            "name": "TEST 3",
            "service": "notification-service",
            "severity": "High",
            "error": "429 Too Many Requests",
            "description": "Notification delivery has dropped sharply after deployment v2.5.0. The notification-service is sending a sudden burst of requests to the external messaging provider, which is returning rate-limit responses.",
            "environment": "production",
            "deployment_version": "v2.5.0",
            "logs": ""
        }
    ]

    for t in tests:
        name = t.pop("name")
        print(f"\n--- Running {name} ---")
        iid = str(uuid.uuid4())
        incidents_db[iid] = t
        try:
            res = await investigate_incident(iid)
            print(f"Likely Root Cause: {res.likely_root_cause}")
            print("Historical Evidence:")
            for m in res.historical_evidence:
                print(f" - {getattr(m, 'category', 'None')}: {m.content[:100]}...")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
