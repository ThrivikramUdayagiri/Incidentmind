import asyncio
import os
import uuid
import json
from app.main import hindsight_client
import google.generativeai as genai

async def run_verification():
    hindsight_api_key = os.getenv("HINDSIGHT_API_KEY")
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    
    if not hindsight_api_key or hindsight_api_key == "test":
        print("FAIL: Missing real HINDSIGHT_API_KEY")
        return
        
    if not gemini_api_key or gemini_api_key == "test":
        print("FAIL: Missing real GEMINI_API_KEY")
        return

    print("STEP A: Retaining a unique synthetic incident into Hindsight...")
    unique_id = str(uuid.uuid4())
    synthetic_incident = {
        "incident_id": unique_id,
        "service": "VerificationService",
        "error": "SyntheticVerificationError",
        "actual_root_cause": f"This is a test incident for verification run {unique_id}",
        "action_taken": "Verified integration",
        "outcome": "Success",
        "resolution_time": "1m",
        "lessons_learned": "Hindsight integration works"
    }
    
    retain_success = await hindsight_client.retain(synthetic_incident)
    print(f"Retain success: {retain_success}")
    if not retain_success:
        print("FAIL: Could not retain memory.")
        return
        
    # Wait a bit for indexing
    print("Waiting 10 seconds for indexing...")
    await asyncio.sleep(10)
    
    print("\nSTEP B: Querying Hindsight with a related incident...")
    query = f"VerificationService SyntheticVerificationError run {unique_id}"
    memories = await hindsight_client.recall(query)
    
    print("\nSTEP C: Verifying that the previously retained information is actually returned...")
    found = False
    for memory in memories:
        print(f"Checking memory {memory.id}: {memory.content[:100]}...")
        if unique_id in memory.content:
            found = True
            print(f"SUCCESS: Found the retained memory! ID: {memory.id}")
            print(f"Content snippet: {memory.content[:150]}...")
            break
            
    if not found:
        print("FAIL: Could not find the retained memory.")
        return
        
    print("\nSTEP D: Feeding the recalled memory into Gemini...")
    memory_text = "\\n\\n".join([f"Memory ID: {m.id}\\nContent: {m.content}" for m in memories])
    prompt = f"""
    You are an AI assistant verifying a system. Look at the historical evidence and tell me the unique ID.
    
    HISTORICAL EVIDENCE:
    {memory_text}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        print("Gemini Output:")
        print(response.text)
    except Exception as e:
        print(f"FAIL: Gemini integration failed. Error: {e}")
        return
        
    print("\nVERIFICATION COMPLETE: ALL STEPS PASSED")

if __name__ == "__main__":
    asyncio.run(run_verification())
