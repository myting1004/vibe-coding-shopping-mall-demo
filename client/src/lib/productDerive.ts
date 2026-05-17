import type { Product } from '@/types/product';

// 현재 Product 스키마엔 정가/할인율/별점/스펙 같은 필드가 없으므로,
// 상품 상세·관리 화면에서 보이는 부가 정보는 SKU 기반 결정적 해시로 derive.
// 동일 상품은 항상 같은 값을 내므로 화면 간 일관성 유지.
// 추후 백엔드 스키마에 listPrice/rating/specs 등이 추가되면 여기서 우선 그 값을 사용하고
// fallback 으로 derive 하는 식으로 자연스럽게 확장 가능.

function seed(input: string): number {
  return Array.from(input).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7
  );
}

function pseudoRandom(seedValue: number, step: number): number {
  // mulberry32 변형 — 0 ~ 1 사이 결정적 난수
  let t = (seedValue + step * 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) % 100000) / 100000;
}

function productSeed(product: Pick<Product, 'sku' | '_id' | 'name'>): number {
  return seed(product.sku || product._id || product.name || '');
}

export interface DerivedPrice {
  listPrice: number;
  discountPercent: number;
  discountAmount: number;
}

export function deriveListPrice(
  product: Pick<Product, 'sku' | '_id' | 'name' | 'price'>
): DerivedPrice {
  const s = productSeed(product);
  const discountPercent = 15 + (s % 26); // 15~40%
  const listPrice = Math.round(product.price / (1 - discountPercent / 100));
  const discountAmount = listPrice - product.price;
  return { listPrice, discountPercent, discountAmount };
}

export interface DerivedRating {
  rating: number; // 4.0 ~ 5.0 (소수 1자리)
  reviewCount: number; // 50 ~ 600
  distribution: number[]; // [5점, 4점, 3점, 2점, 1점] 비율 (합 100)
}

export function deriveRating(
  product: Pick<Product, 'sku' | '_id' | 'name'>
): DerivedRating {
  const s = productSeed(product);
  const rating = Math.round((4.3 + pseudoRandom(s, 1) * 0.7) * 10) / 10;
  const reviewCount = 50 + Math.floor(pseudoRandom(s, 2) * 550);

  // 분포: 별점이 높을수록 5점 비율 높음
  const five = Math.min(95, Math.round(rating * 18));
  const four = Math.round((100 - five) * 0.55);
  const three = Math.round((100 - five - four) * 0.5);
  const two = Math.round((100 - five - four - three) * 0.6);
  const one = Math.max(0, 100 - five - four - three - two);

  return {
    rating,
    reviewCount,
    distribution: [five, four, three, two, one],
  };
}

export interface SpecRow {
  label: string;
  value: string;
}

// 카테고리별 기본 스펙 템플릿. 실제 모델별 차이는 mock 이라 일률적.
const SPEC_TEMPLATES: Record<string, (product: Product) => SpecRow[]> = {
  tv: () => [
    { label: '화면 크기', value: '65인치 (165cm)' },
    { label: '해상도', value: '4K UHD (3840 x 2160)' },
    { label: '패널', value: 'OLED evo' },
    { label: '프로세서', value: 'α11 AI Processor 4K' },
    { label: '주사율', value: '120Hz' },
    { label: '두께', value: '24.1mm' },
  ],
  monitor: () => [
    { label: '화면 크기', value: '27인치 (68cm)' },
    { label: '해상도', value: 'QHD (2560 x 1440)' },
    { label: '패널', value: 'IPS' },
    { label: '주사율', value: '240Hz' },
    { label: '응답속도', value: '1ms (GtG)' },
    { label: '입력단자', value: 'HDMI 2.1 x 2, DP 1.4' },
  ],
  laptop: () => [
    { label: '화면 크기', value: '16인치 (40.6cm)' },
    { label: '프로세서', value: '인텔 코어 Ultra 5' },
    { label: '메모리', value: '16GB LPDDR5X' },
    { label: '저장장치', value: '512GB NVMe SSD' },
    { label: '그래픽', value: 'NVIDIA RTX 5050' },
    { label: '무게', value: '1.36kg' },
  ],
  refrigerator: () => [
    { label: '용량', value: '832L' },
    { label: '도어 구성', value: '4도어 (양문형)' },
    { label: '에너지 효율', value: '2등급' },
    { label: '색상', value: '네이처 (메탈)' },
    { label: '크기', value: '912 x 1850 x 942mm' },
    { label: '주요 기능', value: 'UV청정탈취 + 도어쿨링+' },
  ],
  washer: () => [
    { label: '세탁 용량', value: '25kg' },
    { label: '건조 용량', value: '21kg' },
    { label: '에너지 효율', value: '1등급' },
    { label: '모터', value: 'AI DD™ 다이렉트 드라이브' },
    { label: '주요 기능', value: '트루스팀, 자동세제 플러스' },
    { label: '크기', value: '700 x 1690 x 800mm' },
  ],
  aircon: () => [
    { label: '냉방 면적', value: '56.9㎡' },
    { label: '냉방 능력', value: '17.2kW' },
    { label: '에너지 효율', value: '2등급' },
    { label: '구성', value: '2in1 (스탠드 + 벽걸이)' },
    { label: '주요 기능', value: 'AI 바람, 쾌적제습' },
    { label: '색상', value: '카밍 베이지' },
  ],
  cleaner: () => [
    { label: '형태', value: '무선 스틱청소기' },
    { label: '최대 흡입력', value: '320W' },
    { label: '배터리', value: '분리형 듀얼 배터리' },
    { label: '무게', value: '2.6kg' },
    { label: '주요 기능', value: '흡입 + 물걸레, 올인원타워' },
    { label: '필터', value: '5단계 사이클론 필터' },
  ],
  home: () => [
    { label: '청정/가습 면적', value: '114㎡' },
    { label: '필터', value: 'M5 토탈 케어 필터' },
    { label: '모터', value: '인버터 BLDC 모터' },
    { label: '에너지 효율', value: '2등급' },
    { label: '주요 기능', value: '360° 클린부스터, 펫 모드' },
    { label: '무게', value: '14.5kg' },
  ],
};

export function deriveSpecs(product: Product): SpecRow[] {
  const builder = SPEC_TEMPLATES[product.category];
  if (builder) return builder(product);
  return [
    { label: '카테고리', value: product.category },
    { label: 'SKU', value: product.sku },
  ];
}

// 카테고리별 주요 특징 6개
const FEATURE_TEMPLATES: Record<string, string[]> = {
  tv: [
    'Dolby Vision IQ & Atmos',
    'NVIDIA G-SYNC 호환',
    'AMD FreeSync Premium',
    'Gallery Design',
    'ThinQ AI',
    '4개 HDMI 2.1 포트',
  ],
  monitor: [
    'HDR400 인증',
    'NVIDIA G-SYNC 호환',
    'AMD FreeSync Premium',
    'USB Type-C 90W 충전',
    '4-Side Virtually Borderless',
    '높이·각도 조절 스탠드',
  ],
  laptop: [
    'Copilot+ PC 인증',
    '듀얼 메가 쿨링팬',
    'Thunderbolt 4 포트',
    '90Wh 대용량 배터리',
    '지문 인증 로그인',
    '미닫이형 카메라 셔터',
  ],
  refrigerator: [
    'AI 도어쿨링+',
    '맞춤보관 인공지능',
    '리니어 인버터 컴프레서',
    'UV청정탈취 필터+',
    '매직스페이스 도어',
    '오브제 디자인',
  ],
  washer: [
    '트루스팀 살균',
    '자동세제 플러스',
    'AI DD™ 모터',
    '인버터 히트펌프 건조',
    '내일배송 설치',
    '오브제 컬렉션 디자인',
  ],
  aircon: [
    'AI 바람',
    '인공지능 청정관리',
    '쾌적제습 모드',
    '클린뷰 오픈 구조',
    '이중 청정필터',
    '뷰케이스 액세서리',
  ],
  cleaner: [
    '320W 최대 흡입력',
    '5단계 사이클론 필터',
    '올인원타워 자동 비움',
    '물걸레 침구 일체형',
    'AI 바닥 감지',
    '듀얼 배터리 70분',
  ],
  home: [
    '360° 클린부스터',
    'M5 토탈 케어 필터',
    '펫 모드 / UV 팬살균',
    'ThinQ 원격 제어',
    '무빙휠 자동 이동',
    '오브제 컬렉션 디자인',
  ],
};

export function deriveFeatures(product: Product): string[] {
  return FEATURE_TEMPLATES[product.category] ?? [
    '에너지 절감 설계',
    'AI 자동 모드',
    '오브제 컬렉션',
    'ThinQ 호환',
    '무료 배송 설치',
    '1년 무상 A/S',
  ];
}

export interface ReviewItem {
  id: string;
  authorMasked: string;
  date: string;
  rating: number;
  content: string;
}

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
const REVIEW_TEMPLATES: string[] = [
  '정말 만족합니다! 배송도 빠르고 제품 상태도 기대 이상이에요. 강력 추천합니다.',
  '디자인이 너무 예뻐서 만족도 좋아요. 가격 대비 최고의 선택인 것 같아요.',
  '전체적으로 만족스럽습니다. 다만 초기 설치가 조금 어려웠어요.',
  '품질은 확실히 좋네요. 다음에도 같은 브랜드 제품 살 것 같아요.',
  '집안 분위기가 한결 살아납니다. 인테리어 효과도 톡톡합니다.',
  '기능이 다양해서 잘 활용하고 있어요. 매뉴얼은 조금 친절하면 좋겠어요.',
  '소음도 조용하고 작동도 매끄럽습니다. 만족스러운 구매였어요.',
  '가족 모두가 좋아하네요. 특히 AI 기능이 인상적이에요.',
  '오래 고민하다 샀는데 진작 살 걸 그랬어요. 후회 없는 선택!',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function deriveReviews(product: Product, count = 3): ReviewItem[] {
  const s = productSeed(product);
  const baseDate = new Date('2024-12-20');

  return Array.from({ length: count }, (_, idx) => {
    const surname = SURNAMES[(s + idx * 7) % SURNAMES.length];
    const template =
      REVIEW_TEMPLATES[(s + idx * 13) % REVIEW_TEMPLATES.length];
    const rating = 4 + ((s + idx * 5) % 2); // 4 또는 5
    const daysAgo = idx * 5 + ((s + idx) % 5);
    const d = new Date(baseDate.getTime() - daysAgo * 86400000);
    const date = `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
    return {
      id: `${product._id}-r${idx}`,
      authorMasked: `${surname}**`,
      date,
      rating,
      content: template,
    };
  });
}
