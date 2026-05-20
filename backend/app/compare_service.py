from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Deal
from .promo_parser import parse_promo_text, per_capita_price


def _deal_score(per_capita: float, saving: float, rating: Optional[float]) -> float:
    """优惠力度分：节省比例 + 评分加权。"""
    if per_capita <= 0:
        return 0.0
    save_ratio = saving / (per_capita + saving) if (per_capita + saving) > 0 else 0
    r = (rating or 4.0) / 5.0
    return round(save_ratio * 70 + r * 30, 2)


def search_and_compare(
    session: Session,
    *,
    district: str = "奉贤区",
    category: Optional[str] = None,
    headcount: int = 4,
    keyword: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_per_capita: Optional[float] = None,
    travel_date: Optional[datetime] = None,
    sort_by: str = "score",  # score | price_asc | price_desc | saving
    limit: int = 50,
) -> list[dict]:
    q = select(Deal).where(Deal.is_active == True, Deal.district == district)  # noqa: E712

    if category:
        q = q.where(Deal.category == category)
    if min_rating is not None:
        q = q.where(Deal.rating >= min_rating)

    deals = list(session.scalars(q).all())
    results: list[dict] = []

    for d in deals:
        if keyword and keyword not in d.title and keyword not in d.tags and keyword not in d.address:
            continue
        if travel_date and d.valid_to and travel_date > d.valid_to:
            continue
        if travel_date and d.valid_from and travel_date < d.valid_from:
            continue

        promo = parse_promo_text(d.promo_text)
        per, saving, note = per_capita_price(
            d.price,
            headcount,
            promo,
            is_per_person_listing=d.is_per_person,
        )

        if max_per_capita is not None and per > max_per_capita:
            continue

        score = _deal_score(per, saving, d.rating)
        results.append(
            {
                "id": d.id,
                "title": d.title,
                "category": d.category,
                "district": d.district,
                "address": d.address,
                "price": d.price,
                "original_price": d.original_price,
                "is_per_person": d.is_per_person,
                "promo_text": d.promo_text,
                "parsed_promo": promo.promo_type.value,
                "per_capita": per,
                "saving_per_person": saving,
                "promo_note": note,
                "score": score,
                "platform": d.platform,
                "source_url": d.source_url,
                "cover_image": d.cover_image,
                "tags": [t.strip() for t in d.tags.split(",") if t.strip()],
                "rating": d.rating,
                "min_people_hint": d.min_people_hint,
                "updated_at": d.updated_at.isoformat() if d.updated_at else None,
            }
        )

    if sort_by == "price_asc":
        results.sort(key=lambda x: x["per_capita"])
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x["per_capita"], reverse=True)
    elif sort_by == "saving":
        results.sort(key=lambda x: x["saving_per_person"], reverse=True)
    else:
        results.sort(key=lambda x: x["score"], reverse=True)

    return results[:limit]
