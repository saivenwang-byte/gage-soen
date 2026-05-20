from app.promo_parser import parse_promo_text, per_capita_price, PromoType


def test_free_person():
    p = parse_promo_text("六人免一人")
    assert p.promo_type == PromoType.FREE_PERSON
    per, saving, _ = per_capita_price(1200, 6, p)
    assert per < 200


def test_full_reduction():
    p = parse_promo_text("满2000减300")
    assert p.promo_type == PromoType.FULL_REDUCTION
    per, saving, note = per_capita_price(2000, 4, p)
    assert per == 425.0
    assert saving > 0


def test_discount():
    p = parse_promo_text("8.5折")
    assert p.promo_type == PromoType.DISCOUNT
    per, _, _ = per_capita_price(1000, 5, p)
    assert per == 170.0
