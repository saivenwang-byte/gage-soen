"""
美团适配器占位 — 需配置合法抓取策略后启用。

生产环境建议：
- 使用美团联盟 / 开放平台 API
- 或 Playwright 登录态 + 人工 Cookie 维护（见 setup-browser-cookies）
- 遵守 rate limit，仅奉贤区关键词
"""
from __future__ import annotations

from typing import Optional

from .base import ScrapeAdapter, ScrapeResult


class MeituanAdapter(ScrapeAdapter):
    name = "meituan"
    enabled = False  # 改为 True 并实现 fetch 后再开

    async def fetch_deals(
        self,
        *,
        district: str = "奉贤区",
        keyword: Optional[str] = None,
        limit: int = 20,
    ) -> list[ScrapeResult]:
        # TODO: httpx/playwright 抓取公开列表页，解析 JSON-LD 或 __NEXT_DATA__
        raise NotImplementedError(
            "美团适配器未实现。请配置 API 或启用 Playwright 抓取后再设置 enabled=True"
        )
