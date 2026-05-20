"""示例适配器：从内置种子扩展，不访问外网。"""
from __future__ import annotations

from typing import Optional

from ..seed_data import SAMPLE_DEALS
from .base import ScrapeAdapter, ScrapeResult


class SampleAdapter(ScrapeAdapter):
    name = "sample"
    enabled = True

    async def fetch_deals(
        self,
        *,
        district: str = "奉贤区",
        keyword: Optional[str] = None,
        limit: int = 20,
    ) -> list[ScrapeResult]:
        out: list[ScrapeResult] = []
        for row in SAMPLE_DEALS:
            if keyword and keyword not in row["title"] and keyword not in row.get("tags", ""):
                continue
            out.append(
                ScrapeResult(
                    title=row["title"],
                    category=row["category"],
                    address=row["address"],
                    price=row["price"],
                    original_price=row.get("original_price"),
                    is_per_person=row.get("is_per_person", False),
                    promo_text=row.get("promo_text", ""),
                    platform=self.name,
                    tags=row.get("tags", ""),
                    rating=row.get("rating"),
                    min_people_hint=row.get("min_people_hint"),
                    district=district,
                )
            )
            if len(out) >= limit:
                break
        return out
