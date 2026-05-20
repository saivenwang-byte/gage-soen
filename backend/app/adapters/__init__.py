from .base import ScrapeAdapter, ScrapeResult
from .registry import get_adapter, list_adapters, run_sync

__all__ = [
    "ScrapeAdapter",
    "ScrapeResult",
    "get_adapter",
    "list_adapters",
    "run_sync",
]
