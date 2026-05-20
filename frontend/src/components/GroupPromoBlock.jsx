import { computeDealPricing, formatGroupPromoLabel } from '../utils/promoCalc';

/** 几人免几 / 人数优惠说明（民宿、餐饮通用） */
export default function GroupPromoBlock({ deal, headcount = 2, nights = 1, compact = false }) {
  if (!deal) return null;
  const pricing = computeDealPricing(deal, { headcount, nights });
  const rule = pricing.freePersonRule;
  if (!rule) return null;

  const label = formatGroupPromoLabel(rule);
  if (compact) {
    return (
      <p className="group-promo-compact">
        <span className="group-promo-badge">{label}</span>
        {headcount >= rule.minPeople ? (
          <>
            {' '}
            {headcount}人实付人均约 <strong>¥{pricing.perCapita}</strong>
            {pricing.savingPer > 0 && <span className="group-promo-save">（省¥{pricing.savingPer}/人）</span>}
          </>
        ) : (
          <span className="group-promo-hint"> · 满{rule.minPeople}人起生效，当前{headcount}人</span>
        )}
      </p>
    );
  }

  return (
    <section className="group-promo-card" aria-label="人数优惠">
      <p className="group-promo-title">
        <span className="group-promo-badge">{label}</span>
        <span>人数优惠</span>
      </p>
      <p className="group-promo-line">
        按 <strong>{headcount}</strong> 人入住{nights > 1 ? ` · ${nights} 晚` : ''}：
        {headcount >= rule.minPeople ? (
          <>
            实付人均约 <strong className="price-highlight">¥{pricing.perCapita}</strong>
            {nights > 1 && (
              <>
                {' '}
                · 每晚人均约 <strong>¥{pricing.perNightPerPerson}</strong>
              </>
            )}
            {pricing.savingPer > 0 && (
              <span className="group-promo-save">（每人省 ¥{pricing.savingPer}）</span>
            )}
          </>
        ) : (
          <span className="group-promo-hint">未满 {rule.minPeople} 人，按标价人均 ¥{deal.discountPrice}</span>
        )}
      </p>
      {pricing.promoNote && <p className="field-hint">{pricing.promoNote}</p>}
      <p className="field-hint">在奥扫顶部点「日期·人数」可改人数，价格会跟着变</p>
    </section>
  );
}
