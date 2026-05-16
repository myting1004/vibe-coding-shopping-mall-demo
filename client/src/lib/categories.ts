export interface CategoryDef {
  key: string;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'tv', label: 'TV', icon: '📺' },
  { key: 'monitor', label: '모니터', icon: '🖥️' },
  { key: 'laptop', label: '노트북', icon: '💻' },
  { key: 'audio', label: '오디오', icon: '🎧' },
  { key: 'home', label: '생활가전', icon: '🧺' },
  { key: 'refrigerator', label: '냉장고', icon: '🧊' },
  { key: 'washer', label: '세탁기', icon: '🧺' },
  { key: 'aircon', label: '에어컨', icon: '❄️' },
  { key: 'cleaner', label: '청소가전', icon: '🧹' },
];

export const HOME_CATEGORIES: CategoryDef[] = [
  { key: 'all', label: '전체', icon: '🛒' },
  ...CATEGORIES,
];
