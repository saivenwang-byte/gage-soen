/**
 * 奥扫分类体系：像电影选「类型」一样点选，不靠手填关键词
 * subCategory.key 与种子数据 subCategory 字段对齐；match 用于标签/文案模糊匹配
 */
export const SCENE_TAXONOMY = {
  all: {
    label: '全部',
    icon: '✨',
    subcategories: [
      { key: 'all', label: '热门推荐', desc: '奉贤全区精选好店，什么场景都有' },
      {
        key: 'weekend',
        label: '周末去哪',
        desc: '适合周末出门：K歌、麻将、羽毛球、团建、海景、学生聚会等',
        match: ['周末', '学生', '团建', '海景', 'K歌', '麻将', '羽毛球', '篮球'],
      },
      { key: 'value', label: '超值捡漏', desc: '折扣狠、临期清仓、满减免单，能省则省', match: ['折', '免', '半价', '临期', '清仓'] },
    ],
  },
  coffee: {
    label: '咖啡',
    icon: '☕',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'afternoon', label: '下午茶套餐', match: ['下午茶', '套餐', '甜点'] },
      { key: 'scenic', label: '出片江景', match: ['江景', '露营', '出片', '海景', '夕阳'] },
      { key: 'quiet', label: '安静自习', match: ['安静', '田野', '老街', '复古', '放空'] },
      { key: 'deal', label: '买一送一', match: ['半价', '买一送一', '第二杯', '自带杯'] },
    ],
  },
  pet: {
    label: '宠物',
    icon: '🐱',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'bath', label: '洗澡洗护', match: ['洗澡', '洗护', '首洗', '洗浴'] },
      { key: 'groom', label: '美容修毛', match: ['美容', '修毛', '造型'] },
      { key: 'nail', label: '剪指甲', match: ['指甲', '修剪'] },
      { key: 'board', label: '寄养', match: ['寄养', '托管'] },
      { key: 'walk', label: '代遛狗', match: ['代遛', '遛狗'] },
      { key: 'vet', label: '疫苗体检', match: ['疫苗', '体检', '医疗', '驱虫', '医院'] },
    ],
  },
  expiring: {
    label: '临期',
    icon: '⏳',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'dairy', label: '牛奶乳品', match: ['牛奶', '乳品', '酸奶', '鲜乳', '奶酪'] },
      { key: 'bakery', label: '面包糕点', match: ['烘焙', '面包', '糕点', '寿司', '蛋糕', '饼干'] },
      { key: 'snack', label: '零食饮料', match: ['零食', '饮料', '汽水'] },
      { key: 'fresh', label: '生鲜果蔬', match: ['生鲜', '果蔬', '水果', '蔬菜'] },
      { key: 'daily', label: '日用百货', match: ['日用', '百货', '清仓', '临期'] },
    ],
  },
  stay: {
    label: '民宿',
    icon: '🏠',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'sea', label: '海景度假', match: ['海景', '沙滩', '碧海', '日出', '烧烤'] },
      { key: 'eco', label: '田园生态', match: ['生态', '木屋', '田园', '农庄'] },
      { key: 'family', label: '亲子家庭', match: ['亲子', '家庭', '双早'] },
      { key: 'pet', label: '宠物友好', match: ['宠物'] },
      {
        key: 'group',
        label: '几人免几',
        desc: '满几人免几、同行免单、包栋团建',
        match: ['免', '免单', '同行', '团', '包栋', '十人', '六人', '四人', '人免'],
      },
    ],
  },
  entertainment: {
    label: '娱乐',
    icon: '🎯',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'mahjong', label: '麻将馆', match: ['麻将', '棋牌', '血流', '血战', '推倒胡', '棋牌室'] },
      { key: 'ktv', label: 'K歌房', match: ['K歌', '卡拉OK', '唱K', '量贩', '包厢', '欢唱'] },
      { key: 'board', label: '桌游剧本', match: ['桌游', '剧本', '剧本杀', '密室', '包间'] },
      { key: 'archery', label: '射箭体验', match: ['射箭', '靶场', '弓道'] },
      { key: 'student', label: '学生聚会', match: ['学生', '大学', '凭证件', '轰趴'] },
      { key: 'date', label: '约会打卡', match: ['约会', '双人', '新手'] },
      { key: 'team', label: '团建拓展', match: ['团建', '拓展', '聚会', '轰趴馆'] },
    ],
  },
  life: {
    label: '生活',
    icon: '🏸',
    subcategories: [
      { key: 'all', label: '全部' },
      { key: 'badminton', label: '羽毛球馆', match: ['羽毛球', '羽球', '羽馆', '挥拍'] },
      { key: 'basketball', label: '篮球场地', match: ['篮球', '半场', '全场', '投篮'] },
      { key: 'snooker', label: '台球斯诺克', match: ['斯诺克', '台球', '桌球', '八球', '九球', '中式黑八'] },
      { key: 'gym', label: '健身游泳', match: ['健身', '游泳', '瑜伽', '私教', '健身房'] },
      { key: 'tabletennis', label: '乒乓球', match: ['乒乓球', '乒乓', '球桌'] },
    ],
  },
};

export const SCENE_KEYS = ['all', 'coffee', 'pet', 'expiring', 'stay', 'entertainment', 'life'];

export function getSceneConfig(sceneKey) {
  return SCENE_TAXONOMY[sceneKey] || SCENE_TAXONOMY.all;
}

export function getSubcategoryConfig(sceneKey, subKey) {
  const subs = getSceneConfig(sceneKey).subcategories;
  return subs.find((s) => s.key === subKey) || subs[0];
}

/** 后端/前端共用的匹配逻辑 */
export function itemMatchesSubcategory(item, sceneKey, subKey) {
  if (!subKey || subKey === 'all') return true;
  if (item.subCategory === subKey) return true;
  if (Array.isArray(item.subCategories) && item.subCategories.includes(subKey)) return true;

  const sub = getSubcategoryConfig(sceneKey, subKey);
  if (!sub.match?.length) return true;

  const hay = [
    item.merchantName,
    item.title,
    item.promoText,
    item.discountText,
    item.address,
    ...(item.tags || []),
    ...(item.emotionTags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return sub.match.some((m) => hay.includes(m.toLowerCase()));
}
