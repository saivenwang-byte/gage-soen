from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from ..models import Deal
from .base import ScrapeAdapter, ScrapeResult
from .meituan_stub import MeituanAdapter
from .sample_adapter import SampleAdapter

_ADAPTERS: dict[str, ScrapeAdapter] = {
    "sample": SampleAdapter(),
    "meituan": MeituanAdapter(),
}


def list_adapters() -> list[dict]:
    return [
        {"name": k, "enabled": v.enabled}
        for k, v in _ADAPTERS.items()
    ]


def get_adapter(name: str) -> ScrapeAdapter:
    if name not in _ADAPTERS:
        raise KeyError(f"未知适配器: {name}")
    return _ADAPTERS[name]


async def run_sync(session: Session, adapter_name: str = "sample") -> int:
    adapter = get_adapter(adapter_name)
    if not adapter.enabled:
        raise RuntimeError(f"适配器 {adapter_name} 未启用")

    items = await adapter.fetch_deals(district="奉贤区", limit=100)
    count = 0
    for item in items:
        _upsert_deal(session, item)
        count += 1
    session.commit()
    return count


def _upsert_deal(session: Session, item: ScrapeResult) -> None:
    existing = (
        session.query(Deal)
        .filter(Deal.title == item.title, Deal.platform == item.platform)
        .first()
    )
    now = datetime.utcnow()
    if existing:
        existing.price = item.price
        existing.promo_text = item.promo_text
        existing.updated_at = now
        return
    session.add(
        Deal(
            title=item.title,
            category=item.category,
            district=item.district,
            address=item.address,
            price=item.price,
            original_price=item.original_price,
            is_per_person=item.is_per_person,
            promo_text=item.promo_text,
            platform=item.platform or "unknown",
            source_url=item.source_url,
            cover_image=item.cover_image,
            tags=item.tags,
            rating=item.rating,
            min_people_hint=item.min_people_hint,
            updated_at=now,
            is_active=True,
        )
    )