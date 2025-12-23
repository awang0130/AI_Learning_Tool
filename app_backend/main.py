import json
from fastapi import FastAPI, HTTPException
from app_backend.models import OutlineRequest
from app_backend.cache import cache_get, cache_set
from app_backend.search import search_resources
from app_backend.openai_client import client, MODEL
from app_backend.prompts import OUTLINE_SYSTEM_PROMPT, PLAN_SYSTEM_PROMPT
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path


app = FastAPI(title="30-Day Training Planner")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def parse_json_or_repair(text: str) -> dict:
    """
    Try to parse JSON. If it fails, try a simple cleanup and then ask the model to repair.
    """
    # 1) direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2) strip common markdown fences and retry
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        # sometimes "json\n{...}"
        cleaned = cleaned.replace("json\n", "", 1).replace("JSON\n", "", 1).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 3) last resort: ask model to return valid JSON only
    repair_system = "You are a JSON repair tool. Return ONLY valid JSON. No extra text."
    repair_user = f"""
Fix this so it becomes valid JSON. Keep the same structure and content as much as possible.
Return ONLY the corrected JSON.

BROKEN OUTPUT:
{cleaned}
"""
    resp = client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PLAN_SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
    )
    return json.loads(resp.choices[0].message.content)


@app.get("/")
def root():
    return {"message": "Server is running. Go to /docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/outline")
def outline(req: OutlineRequest):
    cache_payload = req.model_dump()
    cached = cache_get("outline", cache_payload, ttl_hours=72)
    if cached:
        return cached

    user_msg = f"""
Create a 30-day learning curriculum OUTLINE (not the day-by-day plan yet) for:

Topic: {req.topic}
Audience level: {req.level}
Time per day: {req.minutes_per_day} minutes
Preferred formats: {req.format_preferences}
Goal: {req.goal}
Constraints: {json.dumps(req.constraints)}

Requirements:
- Output MUST be valid JSON.
- Make 4 weekly themes, each with 4–8 subtopics.
- Each subtopic MUST include: name, why_it_matters, difficulty (easy|medium|hard), keywords_for_search (3–8 phrases), common_pitfalls.
- Include milestones at days 7, 14, 21, and 30 with: name, deliverable, self_test_questions.
- Include a capstone_project with: name, description, evaluation_rubric.
- Keep scope realistic for {req.minutes_per_day} minutes/day.
- Return only JSON. No extra text.
"""

    try:
        resp = client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": PLAN_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
        )
        data = parse_json_or_repair(resp.choices[0].message.content)
        cache_set("outline", cache_payload, data)
        return data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Outline model did not return valid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plan_with_links")
def plan_with_links(req: OutlineRequest):
    # 1) Outline (cached via /outline function + cache)
    outline_json = outline(req)

    # 2) Retrieval (cached)
    retrieval_cache_payload = {**req.model_dump(), "outline": outline_json}
    retrieved_cached = cache_get("retrieved", retrieval_cache_payload, ttl_hours=48)

    if retrieved_cached:
        retrieved = retrieved_cached
    else:
        retrieved = []
        weekly_themes = outline_json.get("weekly_themes", [])
        for week in weekly_themes:
            for sub in week.get("subtopics", []):
                keywords = sub.get("keywords_for_search", [])
                resources = search_resources(req.topic, keywords, max_results=5)
                retrieved.append({
                    "week": week.get("week"),
                    "subtopic": sub.get("name"),
                    "resources": resources
                })
        cache_set("retrieved", retrieval_cache_payload, retrieved)

    # 3) Final plan (cached)
    plan_cache_payload = {**req.model_dump(), "outline": outline_json, "retrieved": retrieved}
    plan_cached = cache_get("plan_with_links", plan_cache_payload, ttl_hours=24)
    if plan_cached:
        return plan_cached

    user_msg = f"""
Topic: {req.topic}
Audience level: {req.level}
Time per day: {req.minutes_per_day} minutes
Preferred formats: {req.format_preferences}
Goal: {req.goal}
Constraints: {json.dumps(req.constraints)}

OUTLINE JSON:
{json.dumps(outline_json)}

RETRIEVED RESOURCES (use ONLY these URLs):
{json.dumps(retrieved)}

Requirements:
- Output MUST be valid JSON.
- Create exactly 30 days.
- Each day MUST include:
  - day (number)
  - objective (1 sentence)
  - resources (1–3 links from retrieved resources, each with title + url)
  - key_points (3–5 bullets)
  - exercise (short, practical)
  - checkpoint_question (1 question)
- Keep each day realistic for {req.minutes_per_day} minutes.
- Do not invent URLs.
- Return JSON only. No extra text.
"""

    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": PLAN_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
        )
        plan = parse_json_or_repair(resp.choices[0].message.content)
        cache_set("plan_with_links", plan_cache_payload, plan)
        return plan
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Plan model did not return valid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
