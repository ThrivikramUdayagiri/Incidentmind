import httpx

class Hindsight:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def arecall(self, bank_id: str, query: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/banks/{bank_id}/recall",
                headers=self.headers,
                json={"query": query}
            )
            response.raise_for_status()
            data = response.json()
            # Return an object that has 'results' list
            class ResultWrapper:
                def __init__(self, results):
                    self.results = results
            return ResultWrapper(data.get("results", []))

    async def aretain(self, bank_id: str, content: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/banks/{bank_id}/retain",
                headers=self.headers,
                json={"text": content}
            )
            response.raise_for_status()
            return True
