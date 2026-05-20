"""从标题/描述中解析团购与满减规则，并计算人均实付。"""
from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class PromoType(str, Enum):
    NONE = "none"
    FREE_PERSON = "free_person"  # N人免M人（付 N-M 人的钱）
    FULL_REDUCTION = "full_reduction"  # 满X减Y
    DISCOUNT = "discount"  # X折
    GROUP_PRICE = "group_price"  # 团购价已标价


@dataclass
class ParsedPromo:
    promo_type: PromoType
    raw_text: str
    # free_person: 满几人、免几人
    min_people: Optional[int] = None
    free_count: Optional[int] = None
    # full_reduction
    threshold_amount: Optional[float] = None
    reduction_amount: Optional[float] = None
    # discount
    discount_rate: Optional[float] = None  # 0.8 = 8折


# 六人免一人 / 6人免1人 / 买五送一（近似为5人付4人份，需人工校正）
FREE_PERSON_PATTERNS = [
    re.compile(r"(\d+)\s*人\s*免\s*(\d+)\s*人"),
    re.compile(r"(\d+)\s*免\s*(\d+)"),  # 六免一 需中文数字另处理
    re.compile(r"满\s*(\d+)\s*人.*?免\s*(\d+)"),
    re.compile(r"买\s*(\d+)\s*送\s*(\d+)"),  # 买5送1 => 6人付5份
]

FULL_REDUCTION_PATTERNS = [
    re.compile(r"满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)"),
    re.compile(r"满\s*(\d+(?:\.\d+)?)\s*元.*?减\s*(\d+(?:\.\d+)?)"),
]

DISCOUNT_PATTERNS = [
    re.compile(r"(\d+(?:\.\d+)?)\s*折"),
]


_CN_NUM = {
    "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5,
    "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
}


def _normalize_cn_digits(text: str) -> str:
    """六人免一人 -> 6人免1人，便于正则匹配。"""
    out = []
    for ch in text:
        if ch in _CN_NUM:
            out.append(str(_CN_NUM[ch]))
        else:
            out.append(ch)
    return "".join(out)


def parse_promo_text(text: str) -> ParsedPromo:
    if not text:
        return ParsedPromo(PromoType.NONE, "")

    text = _normalize_cn_digits(text)

    for pat in FREE_PERSON_PATTERNS:
        m = pat.search(text)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            # 买5送1：总人数6，付5份
            if "送" in pat.pattern:
                total = a + b
                return ParsedPromo(
                    PromoType.FREE_PERSON,
                    m.group(0),
                    min_people=total,
                    free_count=b,
                )
            return ParsedPromo(
                PromoType.FREE_PERSON,
                m.group(0),
                min_people=a,
                free_count=b,
            )

    for pat in FULL_REDUCTION_PATTERNS:
        m = pat.search(text)
        if m:
            return ParsedPromo(
                PromoType.FULL_REDUCTION,
                m.group(0),
                threshold_amount=float(m.group(1)),
                reduction_amount=float(m.group(2)),
            )

    for pat in DISCOUNT_PATTERNS:
        m = pat.search(text)
        if m:
            rate = float(m.group(1))
            if rate > 10:  # 85折写法
                rate = rate / 10
            if rate > 1:
                rate = rate / 10
            return ParsedPromo(
                PromoType.DISCOUNT,
                m.group(0),
                discount_rate=rate,
            )

    return ParsedPromo(PromoType.NONE, text[:80] if text else "")


def per_capita_price(
    unit_price: float,
    headcount: int,
    promo: ParsedPromo,
    *,
    is_per_person_listing: bool = False,
) -> tuple[float, float, str]:
    """
    返回 (人均实付, 节省金额, 说明)
    unit_price: 套餐标价（整单）或人均标价
    """
    if headcount < 1:
        headcount = 1

    if is_per_person_listing:
        base_per = unit_price
        total = unit_price * headcount
    else:
        total = unit_price
        base_per = total / headcount

    paid = total
    note_parts: list[str] = []

    if promo.promo_type == PromoType.FREE_PERSON and promo.min_people and promo.free_count:
        need = promo.min_people
        if headcount >= need:
            pay_heads = max(1, headcount - promo.free_count)
            if is_per_person_listing:
                paid = unit_price * pay_heads
            else:
                # 整单价按人数比例摊
                paid = unit_price * (pay_heads / headcount)
            note_parts.append(promo.raw_text or f"{need}人起免{promo.free_count}人")
        else:
            note_parts.append(f"未达{need}人，按原价")

    elif promo.promo_type == PromoType.FULL_REDUCTION:
        th, red = promo.threshold_amount or 0, promo.reduction_amount or 0
        if total >= th:
            paid = total - red
            note_parts.append(promo.raw_text or f"满{th}减{red}")
        else:
            note_parts.append(f"未满{th}元")

    elif promo.promo_type == PromoType.DISCOUNT and promo.discount_rate:
        paid = total * promo.discount_rate
        note_parts.append(promo.raw_text or f"{promo.discount_rate*10:.1f}折")

    per = paid / headcount
    saving = max(0.0, base_per - per)
    note = "；".join(note_parts) if note_parts else "无额外规则"
    return round(per, 2), round(saving, 2), note
