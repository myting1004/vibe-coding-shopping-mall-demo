/**
 * LGE.COM 메인 히어로 배너 4·5·6·8·9번 슬라이드 (2026-05 기준)
 * 출처: https://www.lge.co.kr/home
 */
export type HeroBanner = {
  id: string;
  /** LGE 메인 캐러셀 순번 */
  lgeSlot: number;
  badgeImage: string;
  titleLines: [string, string?];
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  external?: boolean;
  titleColor: string;
  subtitleColor: string;
};

const LGE_CDN = 'https://www.lge.co.kr/kr/upload/admin/display/displayObject';

export const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'codezero-a9',
    lgeSlot: 4,
    badgeImage: `${LGE_CDN}/04r_20260519_174332.png`,
    titleLines: ['코드제로 A9 출시', '9주년 기념'],
    subtitle: '멤버십 3만P+구독료 할인 혜택',
    image: `${LGE_CDN}/homemain_hero_pc_260514_20260519_174332.jpg`,
    imageAlt:
      '연한 베이지 톤 배경 위에 LG 코드제로 청소기 A9 제품 3종이 배치되어 있으며, 우측에는 숫자 9 오브제가 크게 표현됨',
    href: '/products?category=cleaner',
    titleColor: '#111111',
    subtitleColor: '#111111',
  },
  {
    id: 'dehumidifier-25l',
    lgeSlot: 5,
    badgeImage: `${LGE_CDN}/01r_20260519_181104.png`,
    titleLines: ['LG 휘센 오브제컬렉션', '제습기 25L 런칭'],
    subtitle: '빠르고 강력한 제습',
    image: `${LGE_CDN}/homemain_hero_pc_20260519_172726.png`,
    imageAlt:
      '화사하고 청량한 톤의 배경 앞에 심플하고 모던한 디자인의 LG 휘센 오브제컬렉션 25L 제습기',
    href: '/products?category=home',
    titleColor: '#111111',
    subtitleColor: '#111111',
  },
  {
    id: 'water-purifier-festa',
    lgeSlot: 6,
    badgeImage: `${LGE_CDN}/%EA%B0%80%EC%A0%84%EA%B5%AC%EB%8F%85r_20260519_173311.png`,
    titleLines: ['1년에 단 한번', '정수기 水퍼 페스타'],
    subtitle: '최대 12개월 50% 할인',
    image: `${LGE_CDN}/homemain_hero_pc_260430_20260519_180634.png`,
    imageAlt:
      "밝은 파란 배경에 '구독료 반값 할인' 문구와 LG 정수기 6대가 전시대 위에 배치되어 있음",
    href: '/products?category=home',
    titleColor: '#111111',
    subtitleColor: '#111111',
  },
  {
    id: 'kitchen-lg',
    lgeSlot: 8,
    badgeImage: `${LGE_CDN}/04r_20260519_173531.png`,
    titleLines: ['요리도 관리도 LG에게'],
    subtitle: '주방의 일은 덜고 함께하는 순간은 더하고',
    image: `${LGE_CDN}/PC_home_main_herobanner_20260519_173531.jpg`,
    imageAlt: 'LG 주방가전 기획전 메인 비주얼',
    href: '/products?category=home',
    titleColor: '#111111',
    subtitleColor: '#111111',
  },
  {
    id: 'wedding-community',
    lgeSlot: 9,
    badgeImage: `${LGE_CDN}/06r_20251217_111246.png`,
    titleLines: ['결혼 정보에 대한 모든 것', 'D5 웨딩 커뮤니티'],
    subtitle: '커뮤니티 참여하기 >',
    image: `${LGE_CDN}/OBS%20%ED%99%88%ED%9E%88%EC%96%B4%20%EB%A9%94%EC%9D%B8%EB%B0%B0%EB%84%88_%20PC%20copy_20260203_154656.jpg`,
    imageAlt: 'D5 웨딩 커뮤니티 프로모션 비주얼',
    href: '/promotions',
    titleColor: '#111111',
    subtitleColor: '#111111',
  },
];
