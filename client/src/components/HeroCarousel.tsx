import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERO_BANNERS, type HeroBanner } from '@/data/heroBanners';

const AUTO_PLAY_MS = 5000;

function HeroSlide({ banner }: { banner: HeroBanner }) {
  const cta = (
    <span className="inline-block rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-500">
      자세히 보기 →
    </span>
  );

  return (
    <article className="relative min-h-[280px] w-full shrink-0 overflow-hidden bg-slate-100 md:min-h-[320px]">
      <img
        src={banner.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 md:via-white/70 md:to-transparent" />

      <div className="relative grid h-full gap-6 py-10 pl-16 pr-14 md:grid-cols-2 md:py-14 md:pl-20 md:pr-20">
        <div className="flex flex-col justify-center space-y-4">
          {banner.badgeImage && (
            <img
              src={banner.badgeImage}
              alt=""
              className="h-6 w-auto max-w-[140px] object-contain object-left"
              loading="lazy"
            />
          )}
          <h2 className="text-2xl font-black leading-tight md:text-4xl">
            <span style={{ color: banner.titleColor }}>{banner.titleLines[0]}</span>
            {banner.titleLines[1] && (
              <>
                <br />
                <span style={{ color: banner.titleColor }}>
                  {banner.titleLines[1]}
                </span>
              </>
            )}
          </h2>
          <p
            className="max-w-md text-sm md:text-base"
            style={{ color: banner.subtitleColor }}
          >
            {banner.subtitle}
          </p>
          {banner.external ? (
            <a
              href={banner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit"
            >
              {cta}
            </a>
          ) : (
            <Link to={banner.href} className="w-fit">
              {cta}
            </Link>
          )}
        </div>

        <div className="hidden items-center justify-center md:flex">
          <img
            src={banner.image}
            alt={banner.imageAlt}
            className="max-h-[220px] w-auto max-w-full object-contain drop-shadow-md"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  );
}

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HERO_BANNERS.length;

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
      aria-roledescription="carousel"
      aria-label="메인 프로모션 배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {HERO_BANNERS.map((banner) => (
          <HeroSlide key={banner.id} banner={banner} />
        ))}
      </div>

      {count > 1 && (
        <>
          <CarouselNavButton
            direction="prev"
            onClick={goPrev}
            label="이전 배너"
          />
          <CarouselNavButton
            direction="next"
            onClick={goNext}
            label="다음 배너"
          />
        </>
      )}

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
        {HERO_BANNERS.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`${i + 1}번째 배너: ${banner.titleLines[0]}`}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition ${
              i === active ? 'w-6 bg-rose-600' : 'w-1.5 bg-slate-400/80 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function CarouselNavButton({
  direction,
  onClick,
  label,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
        direction === 'prev' ? 'left-3 md:left-4' : 'right-3 md:right-4'
      }`}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ChevronIcon({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'prev' ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}
