from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


class Category(str, Enum):
    STAY = "stay"  # 住
    FOOD = "food"  # 吃
    TRAVEL = "travel"  # 行/游
    PLAY = "play"  # 玩


class Base(DeclarativeBase):
    pass


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(256))
    category: Mapped[str] = mapped_column(String(32), index=True)
    district: Mapped[str] = mapped_column(String(64), default="奉贤区", index=True)
    address: Mapped[str] = mapped_column(String(512), default="")
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    price: Mapped[float] = mapped_column(Float)  # 标价（整单或人均见 is_per_person）
    original_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_per_person: Mapped[bool] = mapped_column(Boolean, default=False)

    promo_text: Mapped[str] = mapped_column(String(512), default="")
    platform: Mapped[str] = mapped_column(String(64), default="sample")  # meituan/dianping/ctrip/sample
    source_url: Mapped[str] = mapped_column(String(1024), default="")
    cover_image: Mapped[str] = mapped_column(String(1024), default="")
    tags: Mapped[str] = mapped_column(String(256), default="")  # 逗号分隔：度假村,亲子,海景
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_people_hint: Mapped[int | None] = mapped_column(Integer, nullable=True)

    valid_from: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    valid_to: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


DATABASE_URL = "sqlite:///./data/deals.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
