import asyncio
from backend.app.main import investigate_incident
async def main():
    try:
        res = await investigate_incident("3eead2a3-41a1-4887-812b-516675361851")
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
