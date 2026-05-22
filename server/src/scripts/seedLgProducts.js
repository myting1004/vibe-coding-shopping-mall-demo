import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { Product } from '../models/Product.js';

// LG전자 공식 사이트(https://www.lge.co.kr/home) 의 실제 제품 라인업 시드 데이터.
//
// 각 항목엔 `pageUrl` 만 두고, 이미지는 페이지의 og:image 메타 태그를 시드 시점에 자동 fetch.
// LG 페이지 layout 이 바뀌어도 시드만 다시 돌리면 이미지가 갱신되므로 유지보수가 단순.
// 가격은 LGE.COM 최대혜택가/타임딜가 기반의 합리적 할인가.
const LG_PRODUCTS = [
  // ─── 기존 10종 ───
  {
    sku: 'LG-32LX6BPGA',
    name: 'LG 스탠바이미 2 Max',
    description:
      '79cm 4K UHD 이동형 터치 스크린. 144Wh 배터리로 최대 4시간 30분 무선 사용.',
    price: 1385700,
    stock: 15,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/care-solutions/stan-by-me/32lx6bpga',
  },
  {
    sku: 'LG-OLED65C5SNA',
    name: 'LG 올레드 evo AI TV 65인치 (스탠드형)',
    description:
      '165cm OLED evo AI 패널, α11 AI 프로세서. 완벽한 블랙과 무한대 명암비.',
    price: 4490000,
    stock: 8,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/oled65c5sna-stand',
  },
  {
    sku: 'LG-75QNED70ABA',
    name: 'LG QNED AI TV 75인치 (스탠드형)',
    description:
      '189cm 대화면. 퀀텀닷 NanoCell 기술. AI 화질·음질 최적화.',
    price: 1460100,
    stock: 12,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/75qned70aba-stand',
  },
  {
    sku: 'LG-16Z90TR-EA5BK',
    name: 'LG 그램 Pro AI 16인치 (Ultra 5)',
    description:
      '40.6cm 인텔 코어 Ultra 5. 1.36kg 초경량, NVIDIA RTX 5050 외장 그래픽.',
    price: 1990000,
    stock: 20,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/16z90tr-ea5bk',
  },
  {
    sku: 'LG-27G64NA',
    name: 'LG 울트라기어 게이밍모니터 G6 27인치 QHD',
    description: '27인치 QHD 게이밍 패널, 게임 장르별 프리셋, HDR400.',
    price: 400000,
    stock: 30,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/27g64na',
  },
  {
    sku: 'LG-S836MEE022',
    name: 'LG 디오스 AI 오브제컬렉션 냉장고 (양문형)',
    description:
      '832L 양문형. UV청정탈취필터+, 도어쿨링+, 퓨어 프레시 필터.',
    price: 1181100,
    stock: 6,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/refrigerators/s836mee022',
  },
  {
    sku: 'LG-WL21WDU',
    name: 'LG 트롬 오브제컬렉션 워시타워 25/21kg',
    description: '세탁 25kg + 건조 21kg 일체형. 에너지 1등급, 트루스팀.',
    price: 2780700,
    stock: 5,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/wash-tower/wl21wdu',
  },
  {
    sku: 'LG-FQ17FV3ED2',
    name: 'LG 휘센 AI 오브제컬렉션 뷰I 에어컨 2in1 (3시리즈)',
    description:
      '56.9㎡. AI 바람, 쾌적제습, 클린뷰, 뷰케이스.',
    price: 2990000,
    stock: 10,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/fq17fv3ed2',
  },
  {
    sku: 'LG-AI937WA',
    name: 'LG 코드제로 AI 오브제컬렉션 A9 (흡입+물걸레)',
    description:
      '무선 스틱청소기. 최대 흡입력 320W, 올인원타워 + 간편 비움.',
    price: 990000,
    stock: 18,
    category: 'cleaner',
    pageUrl: 'https://www.lge.co.kr/vacuum-cleaners/ai937wa',
  },
  {
    sku: 'LG-AS356NSLLM',
    name: 'LG 퓨리케어 AI 360° 공기청정기 M5 (무빙휠 세트)',
    description:
      '114㎡ 대공간 커버. M5 필터, 펫 모드, UV 팬살균.',
    price: 1500000,
    stock: 0,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/air-purifier/as356nsllm',
  },

  // ─── 추가 30종 ───

  // TV (+2) → 총 5종
  {
    sku: 'LG-OLED77B6BNA',
    name: 'LG 올레드 AI TV 77인치 (벽걸이형)',
    description: '194cm OLED AI 패널. 풍부한 색감과 깊은 블랙.',
    price: 3722300,
    stock: 4,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/oled77b6bna-wall',
  },
  {
    sku: 'LG-55UT8300ENA',
    name: 'LG 울트라 HD TV 55인치 (스탠드형)',
    description: '138cm 울트라 HD 패널. 가성비 있는 대화면 4K TV.',
    price: 753300,
    stock: 22,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/55ut8300ena-stand',
  },

  // Monitor (+4) → 총 5종
  {
    sku: 'LG-32U721SBWSTD1',
    name: 'LG 스마트모니터 스윙 AI 라이트 32인치 4K',
    description:
      '32인치 4K 포터블 스마트모니터. 무선 캐스팅, 회전 거치대.',
    price: 529200,
    stock: 15,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/32u721sbwstd1',
  },
  {
    sku: 'LG-32GS95UVW',
    name: 'LG 울트라기어 올레드 게이밍모니터 32인치 4K',
    description: '32인치 OLED 4K 게이밍 모니터. 240Hz, 0.03ms.',
    price: 1197900,
    stock: 9,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/32gs95uvw',
  },
  {
    sku: 'LG-27UP850K',
    name: 'LG 울트라HD 모니터 27인치 4K',
    description: '27인치 4K IPS 모니터. USB-C 입력 90W 충전 지원.',
    price: 399000,
    stock: 28,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/27up850k',
  },

  // Laptop (+3) → 총 4종
  {
    sku: 'LG-16Z90TS-GS5JK',
    name: 'LG 그램 Pro AI Copilot+ PC 16인치 (Ultra 5)',
    description: '16인치 Copilot+ PC. 인텔 코어 Ultra 5.',
    price: 1878600,
    stock: 14,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/16z90ts-gs5jk',
  },
  {
    sku: 'LG-16Z95U-GS5WK',
    name: 'LG 그램 Pro AI 2026 16인치 (AMD Ryzen AI 5)',
    description: '16인치 AMD 라이젠 AI 5 탑재. Copilot+ PC.',
    price: 2111100,
    stock: 11,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/16z95u-gs5wk',
  },
  {
    sku: 'LG-16Z90U-KU7HK',
    name: 'LG 그램 Pro AI 2026 16인치 (Ultra X7)',
    description: '16인치 인텔 코어 Ultra X7. 최고 성능 라인업.',
    price: 2401200,
    stock: 6,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/16z90u-ku7hk',
  },

  // Refrigerator (+3) → 총 4종
  {
    sku: 'LG-T876MEE1H1',
    name: 'LG 디오스 AI 오브제컬렉션 냉장고 (매직스페이스 870L)',
    description: '870L 1등급 매직스페이스 냉장고. AI 자동 절전.',
    price: 2083200,
    stock: 7,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/refrigerators/t876mee1h1',
  },
  {
    sku: 'LG-T875MEE011',
    name: 'LG 디오스 AI 오브제컬렉션 베이직 냉장고 870L',
    description: '870L 1등급 베이직 라인. 가성비 있는 4도어.',
    price: 1887900,
    stock: 9,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/refrigerators/t875mee011',
  },
  {
    sku: 'LG-Z330MEEF11',
    name: 'LG 디오스 오브제컬렉션 김치톡톡 327L',
    description: '327L 1등급 김치냉장고. 김치 최적 보관 모드.',
    price: 1385700,
    stock: 13,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/business/kimchi-refrigerators/z330meef11',
  },

  // Washer (+3) → 총 4종
  {
    sku: 'LG-FH25KA',
    name: 'LG 트롬 오브제컬렉션 워시콤보 25/15kg',
    description: '세탁 25kg + 건조 15kg 일체형 워시콤보. 1등급.',
    price: 2890000,
    stock: 8,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/wash-combo/fh25ka',
  },
  {
    sku: 'LG-W20WAN',
    name: 'LG 트롬 워시타워 23/20kg',
    description: '세탁 23kg + 건조 20kg 워시타워. 2등급.',
    price: 2166900,
    stock: 11,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/wash-tower/w20wan',
  },
  {
    sku: 'LG-RG18WNT',
    name: 'LG 트롬 오브제컬렉션 건조기 18kg',
    description: '18kg 대용량 건조기. 1등급, 트루스팀.',
    price: 1490000,
    stock: 12,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/dryers/rg18wnt',
  },

  // Aircon (+3) → 총 4종
  {
    sku: 'LG-SQ06EA1WCS',
    name: 'LG 휘센 벽걸이에어컨 6평형',
    description: '18.7㎡. 인버터 컴프레서, AI 자동운전.',
    price: 557100,
    stock: 24,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/sq06ea1wcs-akor',
  },
  {
    sku: 'LG-FW18EV3EA1',
    name: 'LG 휘센 오브제컬렉션 뷰I 사계절에어컨 (3시리즈)',
    description: '58.5㎡. 냉방·난방 사계절 에어컨.',
    price: 2890000,
    stock: 7,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/fw18ev3ea1',
  },
  {
    sku: 'LG-FQ17FC1ED2',
    name: 'LG 휘센 오브제컬렉션 쿨 에어컨 2in1 (1시리즈)',
    description: '56.9㎡ 3등급. 가성비 있는 2in1.',
    price: 1750000,
    stock: 14,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/fq17fc1ed2',
  },

  // Cleaner (+3) → 총 4종
  {
    sku: 'LG-AX948BHE',
    name: 'LG 코드제로 오브제컬렉션 A9 (흡입+스팀 물걸레)',
    description: '스팀 물걸레까지. 카밍 베이지.',
    price: 837000,
    stock: 21,
    category: 'cleaner',
    pageUrl: 'https://www.lge.co.kr/vacuum-cleaners/ax948bhe',
  },
  {
    sku: 'LG-A727WA',
    name: 'LG 코드제로 오브제컬렉션 A7 Core (흡입+물걸레)',
    description: '가성비 있는 A7 라인. 흡입과 물걸레.',
    price: 590000,
    stock: 26,
    category: 'cleaner',
    pageUrl: 'https://www.lge.co.kr/vacuum-cleaners/a727wa',
  },
  {
    sku: 'LG-B94AHB',
    name: 'LG 코드제로 AI 로보킹 올인원 (프리스탠딩)',
    description: '로봇청소기 + 물걸레 + 자동 비움 올인원.',
    price: 1490000,
    stock: 9,
    category: 'cleaner',
    pageUrl: 'https://www.lge.co.kr/vacuum-cleaners/b94ahb',
  },

  // Home — 공기청정기/가습기/정수기/식기세척기/광파오븐/안마의자/스타일러 (+9) → 총 10종
  {
    sku: 'LG-AS305DWWLM',
    name: 'LG 퓨리케어 AI 360° 공기청정기 플러스 (무빙휠 세트)',
    description: '100㎡ 2등급 360° 공기청정기.',
    price: 731000,
    stock: 16,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/air-purifier/as305dwwlm',
  },
  {
    sku: 'LG-HW500DAS',
    name: 'LG 퓨리케어 자연기화 가습기',
    description: '자연기화식 가습기. 정수된 깨끗한 가습.',
    price: 305000,
    stock: 32,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/humidifiers/hw500das-akor1',
  },
  {
    sku: 'LG-HY705RWUABM',
    name: 'LG 퓨리케어 오브제컬렉션 하이드로타워 (무빙휠 세트)',
    description: '대용량 가습 + 정수. 무빙휠 포함.',
    price: 1290000,
    stock: 8,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/humidifiers/hy705rwuabm',
  },
  {
    sku: 'LG-WD520AWB',
    name: 'LG 퓨리케어 오브제컬렉션 정수기 (맞춤 lite 냉온정)',
    description: '냉·온·정수 3way. 맞춤 lite 모델.',
    price: 690000,
    stock: 14,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/water-purifiers/wd520awb',
  },
  {
    sku: 'LG-WD721RK',
    name: 'LG 퓨리케어 오브제컬렉션 얼음정수기',
    description: '얼음·냉·온·정수 4way. 위생 관리 강화.',
    price: 980000,
    stock: 10,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/water-purifiers/wd721rk',
  },
  {
    sku: 'LG-DUE6BGE',
    name: 'LG 디오스 오브제컬렉션 식기세척기 (열풍+스팀)',
    description: '1등급. 열풍 + 스팀 위생 세척.',
    price: 1190000,
    stock: 13,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/dishwashers/due6bge',
  },
  {
    sku: 'LG-BEF3AMB4E',
    name: 'LG 디오스 인덕션 (미라듀어)',
    description: '1등급 미라듀어. 인덕션 3구.',
    price: 990000,
    stock: 11,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/electric-ranges/bef3amb4e',
  },
  {
    sku: 'LG-MLJ32EWSO',
    name: 'LG 디오스 오브제컬렉션 광파오븐 32L',
    description: '32L 광파오븐. 컨벡션 + 그릴 + 전자레인지.',
    price: 659400,
    stock: 15,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/microwaves-and-ovens/mlj32ewso',
  },
  {
    sku: 'LG-MH65CC',
    name: 'LG 힐링미 안마의자 MX6',
    description: '전신 안마의자 MX6. 다양한 마사지 코스.',
    price: 1890000,
    stock: 5,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/massage-chairs/mh65cc',
  },
  {
    sku: 'LG-SC5GMR70S',
    name: 'LG 스타일러 오브제컬렉션 (2026 NEW) + 스티머',
    description: '5벌 + 스티머. 의류관리 + 핸디 스팀.',
    price: 1890000,
    stock: 9,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/lg-styler/sc5gmr70s',
  },

  // ─── 추가 40종 (LGE.COM 2026 라인업 — 오디오·TV·제습 등 보강) ───

  // Audio (+6) — 기존 0종
  {
    sku: 'LG-S95QR',
    name: 'LG 사운드바 S95QR',
    description:
      '9.1.5채널 프리미엄 사운드바. 리어 스피커 분리형, Dolby Atmos.',
    price: 1890000,
    stock: 7,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/s95qr',
  },
  {
    sku: 'LG-S80QR',
    name: 'LG 사운드바 S80QR',
    description: '5.1.3ch 사운드바. 공간 맞춤 음향, 무선 서브우퍼.',
    price: 1290000,
    stock: 11,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/s80qr',
  },
  {
    sku: 'LG-SQC1',
    name: 'LG 사운드바 SQC1',
    description: '3.1.2ch 사운드바. AI 공간 보정, 컴팩트 디자인.',
    price: 599000,
    stock: 18,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/sqc1',
  },
  {
    sku: 'LG-TONEFP9WK',
    name: 'LG 톤프리 FP9 (화이트)',
    description: '노이즈 캔슬링 무선 이어폰. UVnano 케이스, IPX4.',
    price: 199000,
    stock: 35,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/tone-tfp9w-white',
  },
  {
    sku: 'LG-TONEFREE-T90Q',
    name: 'LG 톤프리 T90Q',
    description: '프리미엄 무선 이어폰. 액티브 노이즈 캔슬링, 고해상도 오디오.',
    price: 279000,
    stock: 28,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/tone-ut90q',
  },
  {
    sku: 'LG-XG2QBLK',
    name: 'LG XBOOM GO XG2 (블랙)',
    description: '휴대용 무선 스피커. IP67 방수·방진, 20시간 재생.',
    price: 149000,
    stock: 40,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/xg2',
  },
  {
    sku: 'LG-XO3QBE',
    name: 'LG XBOOM 360 XO3QBE',
    description: '360° 파티 스피커. 강력한 베이스, 멀티 컬러 라이팅.',
    price: 329000,
    stock: 22,
    category: 'audio',
    pageUrl: 'https://www.lge.co.kr/home-audio/xo3qbe',
  },

  // TV (+5) → 총 10종
  {
    sku: 'LG-OLED77G6KNA',
    name: 'LG 올레드 evo AI TV 77인치 (벽걸이형)',
    description: '194cm OLED evo AI. 4K 144Hz, 게이밍·영화 최적화.',
    price: 4490000,
    stock: 3,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/oled77g6kna-wall',
  },
  {
    sku: 'LG-100MRGB96BK',
    name: 'LG Micro RGB evo AI TV 100인치 (벽걸이형)',
    description: 'Micro RGB evo 패널. 초대형 홈시네마.',
    price: 5990000,
    stock: 2,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/100mrgb96bk-wall',
  },
  {
    sku: 'LG-86QNED70AEA',
    name: 'LG QNED AI TV 86인치 (벽걸이형)',
    description: '217cm QNED AI. 퀀텀닷·나노셀, AI 화질 엔진.',
    price: 2111100,
    stock: 5,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/86qned70aea-wall',
  },
  {
    sku: 'LG-43NANO80ANA',
    name: 'LG 나노셀 AI TV 43인치 (스탠드형)',
    description: '107cm 나노셀 AI. 생활 공간에 맞는 컴팩트 4K.',
    price: 613800,
    stock: 20,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/tvs/43nano80ana-stand',
  },
  {
    sku: 'LG-32LX6TPGA',
    name: 'LG 스탠바이미 2 27인치',
    description: '68cm 이동형 스마트 스크린. 터치·회전·무선 사용.',
    price: 1134600,
    stock: 14,
    category: 'tv',
    pageUrl: 'https://www.lge.co.kr/stan-by-me/27lx6tpga',
  },

  // Monitor (+3) → 총 8종
  {
    sku: 'LG-45GX900A',
    name: 'LG 울트라기어 올레드 게이밍모니터 45인치 WQHD',
    description: '45인치 곡면 OLED WQHD. 240Hz, 게이밍 특화.',
    price: 1320600,
    stock: 6,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/45gx900a',
  },
  {
    sku: 'LG-32GX870A',
    name: 'LG 울트라기어 올레드 게이밍모니터 32인치 4K',
    description: '32인치 OLED 4K 게이밍. 240Hz, DisplayHDR True Black 400.',
    price: 1227600,
    stock: 8,
    category: 'monitor',
    pageUrl: 'https://www.lge.co.kr/monitors/32gx870a',
  },
  // Laptop (+2) → 총 6종
  {
    sku: 'LG-16Z90TR-ED7WK',
    name: 'LG 그램 Pro AI 16인치 (Ultra 7)',
    description: '16인치 인텔 코어 Ultra 7. RTX 5050, 고성능 창작·업무.',
    price: 2490000,
    stock: 8,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/16z90tr-ed7wk',
  },
  {
    sku: 'LG-17Z90TP-GA70K',
    name: 'LG 그램 Pro AI 17인치 (Ultra 7)',
    description: '17인치 대화면 그램 Pro AI. WQXGA, 90Wh 배터리.',
    price: 2986000,
    stock: 10,
    category: 'laptop',
    pageUrl: 'https://www.lge.co.kr/notebook/17z90tp-ga70k',
  },

  // Refrigerator (+3) → 총 7종
  {
    sku: 'LG-S834MEE111',
    name: 'LG 디오스 AI 오브제컬렉션 냉장고 (양문형 832L)',
    description: '832L 양문형 2등급. 매직스페이스, AI 절전.',
    price: 1980000,
    stock: 6,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/refrigerators/s834mee111',
  },
  {
    sku: 'LG-M876GBB231',
    name: 'LG 디오스 AI 오브제컬렉션 냉장고 (더블매직 871L)',
    description: '871L 1등급. 더블 매직스페이스, 대용량 보관.',
    price: 4190000,
    stock: 4,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/refrigerators/m876gbb231',
  },
  {
    sku: 'LG-Z484GBB172',
    name: 'LG 디오스 오브제컬렉션 김치톡톡 480L',
    description: '480L 스탠드형 김치냉장고. 맞춤 숙성·저장.',
    price: 1890000,
    stock: 8,
    category: 'refrigerator',
    pageUrl: 'https://www.lge.co.kr/kimchi-refrigerators/z484gbb172',
  },

  // Washer (+3) → 총 7종
  {
    sku: 'LG-FH25KAX',
    name: 'LG 트롬 오브제컬렉션 워시콤보 + 미니워시',
    description: '25/15/4kg 워시콤보. 미니워시, 1등급.',
    price: 3122400,
    stock: 5,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/wash-combo/fh25kax',
  },
  {
    sku: 'LG-FH25GAG',
    name: 'LG 트롬 오브제컬렉션 워시콤보 25/15kg',
    description: '25/15kg 워시콤보. 에너지 1등급, 스팀 기능.',
    price: 4390000,
    stock: 6,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/wash-combo/fh25gag',
  },
  {
    sku: 'LG-RD25AS',
    name: 'LG 트롬 AI 오브제컬렉션 건조기 25kg',
    description: '25kg 대용량 건조기. 1등급, AI 맞춤 건조.',
    price: 1890000,
    stock: 7,
    category: 'washer',
    pageUrl: 'https://www.lge.co.kr/dryers/rd25as',
  },

  // Aircon (+3) → 총 7종
  {
    sku: 'LG-FQ17GU1ED2',
    name: 'LG 휘센 AI 오브제컬렉션 뷰II 에어컨 2in1 (1시리즈)',
    description: '56.9㎡ 3등급 2in1. AI 바람, 쾌적 제습.',
    price: 1980900,
    stock: 9,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/fq17gu1ed2',
  },
  {
    sku: 'LG-FW16FC1EU2',
    name: 'LG 휘센 오브제컬렉션 쿨 사계절에어컨',
    description: '사계절 냉난방. 오브제컬렉션 디자인.',
    price: 2450000,
    stock: 8,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/fw16fc1eu2',
  },
  {
    sku: 'LG-SQ11EK1WES',
    name: 'LG 휘센 벽걸이에어컨 11평형',
    description: '34.1㎡ 1등급 벽걸이. 인버터, AI 운전.',
    price: 890000,
    stock: 18,
    category: 'aircon',
    pageUrl: 'https://www.lge.co.kr/air-conditioners/sq11ek1wes',
  },

  // Cleaner (+1) → 총 5종
  {
    sku: 'LG-AX9884WE',
    name: 'LG 코드제로 오브제컬렉션 A9S (흡입+스팀 물걸레)',
    description: 'A9S 프리미엄 라인. 스팀 물걸레, 올인원타워.',
    price: 1090000,
    stock: 14,
    category: 'cleaner',
    pageUrl: 'https://www.lge.co.kr/vacuum-cleaners/ax9884we',
  },

  // Home (+11) — 제습기·프로젝터·스타일러·공기청정 등
  {
    sku: 'LG-DQ205PEGA',
    name: 'LG 휘센 오브제컬렉션 제습기 20L',
    description: '20L 1등급 제습기. 빠르고 강력한 제습.',
    price: 473400,
    stock: 22,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/dehumidifiers/dq205pega-akor',
  },
  {
    sku: 'LG-DQ235MWGA',
    name: 'LG 휘센 오브제컬렉션 제습기 23L',
    description: '23L 1등급. 대공간 제습, 스마트 습도 관리.',
    price: 566400,
    stock: 16,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/dehumidifiers/dq235mwga',
  },
  {
    sku: 'LG-DQ134MWEC',
    name: 'LG 휘센 오브제컬렉션 제습기 13L',
    description: '13L 1등급 컴팩트 제습기. 원룸·서재에 적합.',
    price: 378000,
    stock: 25,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/dehumidifiers/dq134mwec-akor',
  },
  {
    sku: 'LG-HU710PB',
    name: 'LG 시네빔 HU710PB',
    description: '4K UHD 레이저 프로젝터. 3000ANSI, 홈시네마.',
    price: 1385700,
    stock: 9,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/projectors/hu710pb',
  },
  {
    sku: 'LG-PU600U',
    name: 'LG 시네빔 큐브 26년형 PU600U',
    description: '휴대형 LED 프로젝터. Full HD, 캠핑·이동식.',
    price: 1385700,
    stock: 11,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/projectors/pu600u',
  },
  {
    sku: 'LG-AS356NSMA',
    name: 'LG 퓨리케어 AI 오브제컬렉션 360° 공기청정기 M7',
    description: '114㎡ M7 필터. 펫 모드, UV 살균.',
    price: 1890000,
    stock: 7,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/air-purifier/as356nsma',
  },
  {
    sku: 'LG-FS065PSJC',
    name: 'LG 퓨리케어 오브제컬렉션 에어로타워 Hit',
    description: '에어로타워 Hit. 온풍 겸용, 공기청정.',
    price: 890000,
    stock: 10,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/air-purifier/fs065psjc',
  },
  {
    sku: 'LG-SC5GMR80S',
    name: 'LG 스타일러 오브제컬렉션 (2026 NEW) 5벌+바지',
    description: '5벌+바지 1벌. 스팀 살균·탈취·주름 관리.',
    price: 2190000,
    stock: 6,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/lg-styler/sc5gmr80s',
  },
  {
    sku: 'LG-MH81CC',
    name: 'LG 힐링미 안마의자 MX8',
    description: '프리미엄 안마의자 MX8. 릴렉스·스트레칭 코스.',
    price: 2590000,
    stock: 4,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/massage-chairs/mh81cc',
  },
  {
    sku: 'LG-DEE6BGE',
    name: 'LG 디오스 오브제컬렉션 식기세척기 12인용',
    description: '12인용 1등급. 열풍+스팀, 컴팩트 주방용.',
    price: 911400,
    stock: 14,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/dishwashers/dee6bge',
  },
  {
    sku: 'LG-HY505RWLAH',
    name: 'LG 퓨리케어 오브제컬렉션 하이드로에센셜',
    description: '하이드로에센셜 가습기. 정수 가습, 위생 관리.',
    price: 890000,
    stock: 12,
    category: 'home',
    pageUrl: 'https://www.lge.co.kr/humidifiers/hy505rwlah',
  },
];

// 이전 시드 회차 / 수동 등록으로 들어간 잘못된 SKU 정리.
const OBSOLETE_SKUS = [
  'LG-OLED65C5KNA', // OLED65C5KNA → OLED65C5SNA 로 교정
  'LG-AI937WA-S', // AI937WA-S → AI937WA 로 교정
  'LG-B94AHB-S', // SKU 의 suffix -S 제거 후 LG-B94AHB 로 통일
  'WL21WDU', // 사용자가 어드민에서 수동 등록한 워시타워 (시드 LG-WL21WDU 와 중복)
  'LG-27GS60QC', // 40개 맞추기 위해 제거 (27G64NA G6 와 비슷한 게이밍 모니터)
  'LG-RB7KH', // 잘못된 URL — LG-AX9884WE 로 대체
  'LG-A957WB', // 잘못된 URL — LG-AX9884WE 로 교체
  'LG-17Z90TP-GX76K', // SKU 교정 → LG-17Z90TP-GA70K
  'LG-27LX6TPGA', // 존재하지 않는 모니터 URL
];

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

/**
 * LG 제품 페이지에서 og:image 메타태그를 추출.
 * 404 또는 og:image 미존재 시 null 반환.
 */
async function fetchOgImage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log(`✓ MongoDB 연결됨: ${env.mongoUri}\n`);

  // 1) 잘못된 SKU 정리
  for (const sku of OBSOLETE_SKUS) {
    const result = await Product.deleteOne({ sku });
    if (result.deletedCount > 0) {
      console.log(`  - removed   ${sku} (obsolete)`);
    }
  }

  // 2) 모든 LG 제품의 og:image 를 병렬 fetch (네트워크 시간 단축)
  console.log(
    `\n  · LG 페이지 ${LG_PRODUCTS.length}개에서 og:image 가져오는 중…\n`
  );
  const imageUrls = await Promise.all(
    LG_PRODUCTS.map((p) => fetchOgImage(p.pageUrl))
  );

  // 3) 각 제품 upsert
  let inserted = 0;
  let updated = 0;
  let imageMissed = 0;
  for (let i = 0; i < LG_PRODUCTS.length; i += 1) {
    const data = LG_PRODUCTS[i];
    const imageUrl = imageUrls[i] ?? '';
    if (!imageUrl) imageMissed += 1;

    const { pageUrl, ...productFields } = data;
    void pageUrl;

    const before = await Product.findOne({ sku: data.sku }).lean();
    await Product.findOneAndUpdate(
      { sku: data.sku },
      { $set: { ...productFields, imageUrl } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (before) updated += 1;
    else inserted += 1;
    const tag = before ? '↻ updated ' : '+ inserted';
    const imgTag = imageUrl ? '✓img' : '✗img';
    console.log(`  ${tag} ${imgTag}  ${data.sku.padEnd(20)} ${data.name}`);
  }

  console.log(
    `\n완료 — 신규 ${inserted}건 / 갱신 ${updated}건 / 이미지 누락 ${imageMissed}건 (총 ${LG_PRODUCTS.length}건 처리)`
  );

  const total = await Product.countDocuments();
  console.log(`현재 DB 의 product 총 개수: ${total}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('시드 실패:', err);
  process.exit(1);
});
