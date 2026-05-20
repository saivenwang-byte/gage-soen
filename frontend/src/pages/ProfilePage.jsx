import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ValueCard from '../components/ValueCard';
import DealDetailSheet from '../components/DealDetailSheet';
import FavoriteTripModal from '../components/FavoriteTripModal';
import { SCENE_TAXONOMY } from '../data/sceneTaxonomy';
import { normalizeDeal } from '../utils/normalizeDeal';
import { isWarehouseVisit, itemsWithCoords } from '../utils/visitRoute';

const WISH_PLACEHOLDER =
  '例：周六晚上 6 人团建，想在海湾包栋海景别墅，预算人均 300 左右，最好带烧烤和 KTV。\n（写清：什么时候 · 几个人 · 想做什么 · 大概预算）';

const UGC_SCENES = ['coffee', 'pet', 'expiring', 'stay', 'entertainment', 'life', 'dining'];

export default function ProfilePage() {
  const {
    favorites,
    toggleFavorite,
    bottleCollected,
    compareList,
    preferences,
    setPreferences,
    submitUgc,
    fetchWishes,
    submitWish,
    supportWish,
    requestAosoSearch,
    userLocation,
    toggleCompare,
    isFavorite,
    profile,
    updateProfile,
  } = useApp();

  const [detailItem, setDetailItem] = useState(null);
  const [tripModal, setTripModal] = useState(null);

  const warehouseFavorites = useMemo(
    () => itemsWithCoords(favorites.filter(isWarehouseVisit)),
    [favorites]
  );
  const [quickKeyword, setQuickKeyword] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const avatarInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('favorites');
  const [showUgc, setShowUgc] = useState(false);
  const [ugcForm, setUgcForm] = useState({
    scene: 'expiring',
    merchantName: '',
    address: '',
    promoText: '',
    price: '',
    submitter: '',
  });
  const [ugcMsg, setUgcMsg] = useState('');

  const [wishes, setWishes] = useState([]);
  const [wishText, setWishText] = useState('');
  const [wishScene, setWishScene] = useState('all');
  const [wishMsg, setWishMsg] = useState('');

  useEffect(() => {
    if (activeTab === 'wish') {
      fetchWishes().then(setWishes).catch(() => setWishes([]));
    }
  }, [activeTab, fetchWishes]);

  const handleUgcSubmit = async () => {
    if (!ugcForm.merchantName.trim()) return;
    setUgcMsg('提交中…');
    try {
      const res = await submitUgc({
        ...ugcForm,
        submitter: ugcForm.submitter.trim() || profile.nickname || '家人',
        price: Number(ugcForm.price) || 0,
      });
      setUgcMsg(res.message || '已收录');
      setUgcForm({ scene: 'expiring', merchantName: '', address: '', promoText: '', price: '', submitter: '' });
      setTimeout(() => {
        setShowUgc(false);
        setUgcMsg('');
      }, 1500);
    } catch (e) {
      setUgcMsg(e.message || '提交失败');
    }
  };

  const handleWishSubmit = async () => {
    if (!wishText.trim()) return;
    try {
      await submitWish({ text: wishText, scene: wishScene });
      setWishMsg('许愿投进海里啦～');
      setWishText('');
      const list = await fetchWishes();
      setWishes(list);
    } catch (e) {
      setWishMsg(e.message || '提交失败');
    }
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 900_000) {
      window.alert('图片请小于 900KB，可换一张小一点的');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveNickname = () => {
    const name = nameDraft.trim() || '嘎算达人';
    updateProfile({ nickname: name });
    setEditingName(false);
  };

  const handleSupport = async (id) => {
    try {
      await supportWish(id);
      const list = await fetchWishes();
      setWishes(list);
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: '80px' }}>
      <div className="header-mosaic" style={{ padding: '30px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={() => avatarInputRef.current?.click()}
            title="点击上传头像"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-placeholder">👤</span>
            )}
            <span className="profile-avatar-badge">📷</span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarPick}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={16}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                  placeholder="昵称"
                />
                <button
                  type="button"
                  onClick={saveNickname}
                  style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'var(--brand-honey)', color: '#fff', fontSize: 12 }}
                >
                  保存
                </button>
              </div>
            ) : (
              <>
                <h2
                  style={{ margin: 0, fontSize: '20px', color: 'var(--color-text)', fontFamily: 'var(--font-title)', cursor: 'pointer' }}
                  onClick={() => {
                    setNameDraft(profile.nickname || '嘎算达人');
                    setEditingName(true);
                  }}
                  title="点击改昵称"
                >
                  侬好，{profile.nickname || '嘎算达人'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>点头像换照片 · 点昵称可改</p>
              </>
            )}
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              收藏 {favorites.length} · 捞过 {bottleCollected.length} 只瓶
              {compareList.length > 0 ? ` · 对比中 ${compareList.length}` : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setUgcMsg('');
            setUgcForm((p) => ({
              ...p,
              submitter: p.submitter || profile.nickname || '',
            }));
            setShowUgc(true);
          }}
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '10px',
            border: '2px solid var(--brand-stone)',
            borderRadius: '12px',
            background: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          📷 上传嘎算优惠（家人发现的好价）
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          margin: '16px 16px 0',
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {[
          { key: 'favorites', label: '📦 收藏', count: favorites.length },
          { key: 'history', label: '🍾 捞瓶', count: bottleCollected.length },
          { key: 'wish', label: '✨ 许愿', count: wishes.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'tab-mosaic-active' : ''}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '12px 6px',
              border: 'none',
              background: activeTab === tab.key ? undefined : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--color-secondary)',
              fontSize: '12px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {tab.label}
            <span style={{ display: 'block', fontSize: '10px', opacity: 0.8 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'favorites' && (
          <>
            {favorites.length === 0 ? (
              <EmptyState icon="📦" text="还呒没收藏过优惠" hint="奥扫或暇兜兜里点收藏，好价都攒这里" />
            ) : (
              <>
                {warehouseFavorites.length >= 2 && (
                  <div className="favorites-trip-banner">
                    <p>
                      <strong>🏭 工厂 / 二手一日游</strong>
                      <br />
                      已收藏 {warehouseFavorites.length} 家有坐标，可按顺序看「先走哪、后走哪」。
                    </p>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        setTripModal({
                          items: warehouseFavorites,
                          title: '工厂·二手 一日游',
                        })
                      }
                    >
                      看串联路线（1→2→3）
                    </button>
                  </div>
                )}
                {favorites.map((item) => (
                <ValueCard
                  key={item.id}
                  data={item}
                  mode={preferences.defaultMode}
                  isCompared={compareList.some((i) => i.id === item.id)}
                  onToggleCompare={toggleCompare}
                  isFavorited
                  onToggleFavorite={toggleFavorite}
                  onOpen={(it) => setDetailItem(it)}
                  showRemove
                  onRemove={() => toggleFavorite(item)}
                />
              ))}
              </>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {bottleCollected.length === 0 ? (
              <EmptyState
                icon="🍾"
                text="还呒没捞过瓶子"
                hint="暇兜兜随便捞，看中就去店里成交"
              />
            ) : (
              bottleCollected
                .slice()
                .reverse()
                .map((item, index) =>
                  item.empty ? (
                    <div
                      key={index}
                      style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginBottom: '10px',
                        boxShadow: 'var(--shadow-card)',
                        display: 'flex',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>🫙</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>空瓶</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{item.fortuneText || ''}</p>
                      </div>
                    </div>
                  ) : (
                    <ValueCard
                      key={item.id || index}
                      data={item}
                      mode={preferences.defaultMode}
                      isCompared={compareList.some((i) => i.id === item.id)}
                      onToggleCompare={toggleCompare}
                      isFavorited={isFavorite(item)}
                      onToggleFavorite={toggleFavorite}
                      onOpen={(it) => setDetailItem(it)}
                    />
                  )
                )
            )}
          </>
        )}

        {activeTab === 'wish' && (
          <>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#666' }}>
              想找但奥扫里还没有？按下面格式写清需求，街坊可助力，我们也会优先收录。
            </p>
            <p
              style={{
                margin: '0 0 10px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#5a4a00',
                background: '#fff8e1',
                borderRadius: '8px',
                lineHeight: 1.5,
              }}
            >
              💡 许愿会进入街坊心愿池；入驻商户可能看到同类需求并主动联系（是否留电话由你决定）。介嘎算不代收费用、不保证一定有人联系。
            </p>
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder={WISH_PLACEHOLDER}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {['all', ...UGC_SCENES].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWishScene(key)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '14px',
                    border: wishScene === key ? '2px solid var(--color-primary)' : '1px solid #ddd',
                    background: wishScene === key ? 'var(--color-highlight-bg)' : '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {key === 'all' ? '不限' : SCENE_TAXONOMY[key]?.label || key}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleWishSubmit}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: wishMsg ? 8 : 16,
              }}
            >
              投进许愿瓶
            </button>
            {wishMsg && <p style={{ fontSize: '12px', color: 'var(--color-accent)', margin: '0 0 12px' }}>{wishMsg}</p>}
            {wishes.map((w) => (
              <div
                key={w.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '8px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>{w.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>
                    {w.nickname} · {w.supports || 0} 人助力
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSupport(w.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-primary)',
                      background: '#fff',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    助力一下
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div
        style={{
          margin: '0 16px',
          background: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#888' }}>🔍 用默认设置去奥扫</h4>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#999' }}>
          下面「默认距离/模式」会带到奥扫；填关键词后点搜索即可。
        </p>
        <input
          type="search"
          value={quickKeyword}
          onChange={(e) => setQuickKeyword(e.target.value)}
          placeholder="搜民宿、火锅、咖啡…可留空"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px',
            marginBottom: '10px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        />
        <button
          type="button"
          onClick={() =>
            requestAosoSearch({
              keyword: quickKeyword,
              distance: preferences.defaultDistance,
              mode: preferences.defaultMode,
            })
          }
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          去奥扫搜索
        </button>

        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#888' }}>⚙️ 默认偏好</h4>
        <PrefRow label="默认价值模式">
          <select
            value={preferences.defaultMode}
            onChange={(e) => setPreferences((prev) => ({ ...prev, defaultMode: e.target.value }))}
            style={selectStyle}
          >
            <option value="cheap">💰 比便宜</option>
            <option value="value">⚖️ 比性价比</option>
            <option value="experience">✨ 比质价比</option>
          </select>
        </PrefRow>
        <PrefRow label="默认搜索范围">
          <select
            value={preferences.defaultDistance}
            onChange={(e) => setPreferences((prev) => ({ ...prev, defaultDistance: Number(e.target.value) }))}
            style={selectStyle}
          >
            <option value={5}>5公里</option>
            <option value={10}>10公里</option>
            <option value={15}>15公里</option>
            <option value={30}>30公里</option>
          </select>
        </PrefRow>

      </div>

      <div style={{ textAlign: 'center', padding: '30px 0 16px', color: '#ccc', fontSize: '12px' }}>
        <p style={{ margin: 0 }}>介嘎算 ga-ge-soen</p>
        <p style={{ margin: '4px 0 0 0' }}>奉贤生活，样样介嘎算</p>
      </div>

      {detailItem && (
        <DealDetailSheet
          item={detailItem}
          userLocation={userLocation}
          onClose={() => setDetailItem(null)}
          isFavorited={isFavorite(detailItem)}
          onToggleFavorite={toggleFavorite}
          isCompared={compareList.some((i) => i.id === detailItem.id)}
          onToggleCompare={toggleCompare}
        />
      )}

      {tripModal && (
        <FavoriteTripModal
          items={tripModal.items}
          title={tripModal.title}
          userLocation={userLocation}
          onClose={() => setTripModal(null)}
        />
      )}

      {showUgc && (
        <UgcModal
          form={ugcForm}
          setForm={setUgcForm}
          onClose={() => setShowUgc(false)}
          onSubmit={handleUgcSubmit}
          message={ugcMsg}
        />
      )}
    </div>
  );
}

const selectStyle = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '12px',
};

function PrefRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ fontSize: '13px' }}>{label}</span>
      {children}
    </div>
  );
}

function EmptyState({ icon, text, hint }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>{icon}</p>
      <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-secondary)', fontWeight: 'bold' }}>{text}</p>
      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#aaa' }}>{hint}</p>
    </div>
  );
}

function UgcModal({ form, setForm, onClose, onSubmit, message }) {
  const fields = [
    { key: 'merchantName', label: '店名', required: true, type: 'text', placeholder: '例：夏小姐的花店' },
    { key: 'address', label: '地址', type: 'text', placeholder: '例：海马路 4333 号' },
    { key: 'promoText', label: '优惠说明', type: 'text', placeholder: '例：狗来人可以不来、满减活动等' },
    { key: 'price', label: '参考价格（元）', type: 'number', placeholder: '例：80' },
    {
      key: 'submitter',
      label: '谁提供的（昵称）',
      type: 'text',
      placeholder: '例：夏老板、张阿姨、我 — 不必是店主本人',
      hint: '任何家人/朋友都能传，不要求商家自己上传',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '360px', maxHeight: '85vh', overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 6px', textAlign: 'center', fontFamily: 'var(--font-title)' }}>上传嘎算优惠</h3>
        <p className="ugc-modal-intro">
          这是<strong>家庭自用</strong>情报：谁发现好价谁就能填，不是商家「承包」入驻，也不要求店主本人操作。提交后进全家精选池，奥扫能搜、暇兜兜能捞。
        </p>
        <label style={{ fontSize: '12px', color: '#888' }}>场景</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 12px' }}>
          {UGC_SCENES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm((p) => ({ ...p, scene: key }))}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: form.scene === key ? '2px solid var(--color-primary)' : '1px solid #ddd',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {SCENE_TAXONOMY[key]?.label || key}
            </button>
          ))}
        </div>
        {fields.map((f) => (
          <label key={f.key} style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#666' }}>
              {f.label}
              {f.required ? ' *' : ''}
            </span>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: 4,
                borderRadius: '8px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            {f.hint && (
              <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#999', lineHeight: 1.4 }}>
                {f.hint}
              </span>
            )}
          </label>
        ))}
        {message && (
          <p
            style={{
              fontSize: '12px',
              color: message.includes('失败') || message.includes('API') ? '#c0392b' : 'var(--color-accent)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: '#f5f5f5', cursor: 'pointer' }}>
            取消
          </button>
          <button type="button" onClick={onSubmit} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer' }}>
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
