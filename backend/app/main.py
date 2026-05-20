from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .adapters import list_adapters, run_sync
from .compare_service import search_and_compare
from .models import SessionLocal, init_db
from .seed_data import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("data", exist_ok=True)
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="外婆闺蜜比价 API",
    description="奉贤区团购/民宿/餐饮比价",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "region": "奉贤区"}


@app.get("/api/meta/categories")
def categories():
    return [
        {"id": "stay", "name": "住", "icon": "🏨"},
        {"id": "food", "name": "吃", "icon": "🍜"},
        {"id": "travel", "name": "行", "icon": "🚌"},
        {"id": "play", "name": "玩", "icon": "🎯"},
    ]


@app.get("/api/deals/compare")
def compare_deals(
    district: str = Query("奉贤区"),
    category: Optional[str] = None,
    headcount: int = Query(4, ge=1, le=50),
    keyword: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_per_capita: Optional[float] = None,
    travel_date: Optional[str] = None,  # YYYY-MM-DD
    sort_by: str = Query("score", pattern="^(score|price_asc|price_desc|saving)$"),
    limit: int = Query(50, ge=1, le=100),
):
    td = None
    if travel_date:
        try:
            td = datetime.strptime(travel_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(400, "travel_date 格式应为 YYYY-MM-DD")

    db = SessionLocal()
    try:
        items = search_and_compare(
            db,
            district=district,
            category=category,
            headcount=headcount,
            keyword=keyword,
            min_rating=min_rating,
            max_per_capita=max_per_capita,
            travel_date=td,
            sort_by=sort_by,
            limit=limit,
        )
        return {
            "district": district,
            "headcount": headcount,
            "count": len(items),
            "items": items,
        }
    finally:
        db.close()


@app.get("/api/adapters")
def adapters():
    return {"adapters": list_adapters()}


@app.post("/api/sync")
async def sync_data(adapter: str = Query("sample")):
    db = SessionLocal()
    try:
        n = await run_sync(db, adapter)
        return {"synced": n, "adapter": adapter}
    except Exception as e:
        raise HTTPException(400, str(e))
    finally:
        db.close()
