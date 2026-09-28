import asyncio
from app.main import investigate_incident
import uuid
from app.main import incidents_db

async def main():
    try:
        iid = str(uuid.uuid4())
        incidents_db[iid] = {
            "service": "payment-service",
            "severity": "High",
            "error": "503",
            "description": "test",
            "environment": "prod",
            "logs": ""
        }
        res = await investigate_incident(iid)
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
