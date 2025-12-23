from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any

class OutlineRequest(BaseModel):
    topic: str
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    minutes_per_day: int = Field(default=30, ge=10, le=180)
    format_preferences: List[Literal["video", "reading", "interactive"]] = ["video", "reading"]
    goal: Optional[str] = None
    constraints: Dict[str, Any] = {}
