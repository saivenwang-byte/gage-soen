from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ScrapeResult:
    title: str
    category: str
    address: str
    price: float
    original_price: Optional[float] = None
    is_per_person: bool = False
    promo_text: str = ""
    platform: str = ""
    source_url: str = ""
    cover_image: str = ""
    tags: str = ""
    rating: Optional[float] = None
    min_people_hint: Optional[int] = None
    district: str = "奉贤区"
    extra: dict = field(default_factory=dict)


class ScrapeAdapter(ABC):
    """各平台爬虫适配器基类。子类实现 fetch_deals，遵守 robots 与频率限制。"""

    name: str = "base"
    enabled: bool = False  # 默认关闭，避免未配置时误爬

    @abstractmethod
    async def fetch_deals(
        self,
        *,
        district: str = "奉贤区",
        keyword: Optional[str] = None,
        limit: int = 20,
    ) -> list[ScrapeResult]:
        ...
