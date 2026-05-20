"""奉贤区示例团购数据 — 用于演示筛选与比价逻辑。"""
from datetime import datetime, timedelta

SAMPLE_DEALS = [
    {
        "title": "奉贤海湾森林公园旁民宿·周末双人套餐",
        "category": "stay",
        "address": "上海市奉贤区海湾镇海思路88号附近",
        "price": 598.0,
        "original_price": 798.0,
        "is_per_person": False,
        "promo_text": "四人同行一人免单，六人免两人",
        "platform": "sample",
        "tags": "民宿,周末,亲子",
        "rating": 4.6,
        "min_people_hint": 4,
    },
    {
        "title": "碧海金沙度假村·海景房+早餐",
        "category": "stay",
        "address": "上海市奉贤区海湾旅游区海涵路6号",
        "price": 1280.0,
        "original_price": 1680.0,
        "is_per_person": False,
        "promo_text": "六人免一人 满3000减200",
        "platform": "sample",
        "tags": "度假村,海景,团购",
        "rating": 4.4,
        "min_people_hint": 6,
    },
    {
        "title": "奉贤渔人码头·本帮海鲜十人宴",
        "category": "food",
        "address": "上海市奉贤区海湾旅游区渔人码头",
        "price": 1888.0,
        "original_price": 2288.0,
        "is_per_person": False,
        "promo_text": "满2000减300",
        "platform": "sample",
        "tags": "海鲜,聚餐,团购",
        "rating": 4.5,
        "min_people_hint": 8,
    },
    {
        "title": "南桥龙湖天街·江浙菜4-6人餐",
        "category": "food",
        "address": "上海市奉贤区南桥镇百齐路",
        "price": 298.0,
        "original_price": 458.0,
        "is_per_person": False,
        "promo_text": "买四送一",
        "platform": "sample",
        "tags": "商场,聚餐",
        "rating": 4.3,
        "min_people_hint": 4,
    },
    {
        "title": "奉贤巴士·海湾森林公园一日游（含门票）",
        "category": "travel",
        "address": "上海市奉贤区集散至海湾森林公园",
        "price": 128.0,
        "original_price": 168.0,
        "is_per_person": True,
        "promo_text": "6人同行8.5折",
        "platform": "sample",
        "tags": "一日游,门票",
        "rating": 4.2,
        "min_people_hint": 1,
    },
    {
        "title": "庄行郊野公园·采摘+农家饭套餐",
        "category": "play",
        "address": "上海市奉贤区庄行镇潘垫公路",
        "price": 98.0,
        "original_price": 128.0,
        "is_per_person": True,
        "promo_text": "满500减80",
        "platform": "sample",
        "tags": "采摘,亲子,郊野",
        "rating": 4.7,
        "min_people_hint": 2,
    },
    {
        "title": "申隆生态园度假酒店·会议团建套餐",
        "category": "stay",
        "address": "上海市奉贤区拓林镇申隆生态园",
        "price": 388.0,
        "original_price": 488.0,
        "is_per_person": True,
        "promo_text": "十人免两人",
        "platform": "sample",
        "tags": "团建,度假村",
        "rating": 4.1,
        "min_people_hint": 10,
    },
    {
        "title": "奉贤博物馆周边·咖啡下午茶双人",
        "category": "food",
        "address": "上海市奉贤区金海街道湖畔路",
        "price": 88.0,
        "original_price": 128.0,
        "is_per_person": False,
        "promo_text": "第二份半价",
        "platform": "sample",
        "tags": "下午茶,打卡",
        "rating": 4.8,
        "min_people_hint": 2,
    },
]


def seed_if_empty(session) -> int:
    from .models import Deal

    if session.query(Deal).count() > 0:
        return 0
    now = datetime.utcnow()
    valid_to = now + timedelta(days=90)
    for row in SAMPLE_DEALS:
        session.add(
            Deal(
                **row,
                district="奉贤区",
                valid_from=now,
                valid_to=valid_to,
                is_active=True,
            )
        )
    session.commit()
    return len(SAMPLE_DEALS)
