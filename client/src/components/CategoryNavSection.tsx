import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryNav from '@/components/CategoryNav';
import FloatingCategoryRail from '@/components/home/FloatingCategoryRail';

/**
 * 카테고리 그리드가 뷰포트에서 벗어나면 우측 플로팅 카테고리 레일 표시 (메인·상품 목록)
 */
export default function CategoryNavSection() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showRail, setShowRail] = useState(false);
  const [searchParams] = useSearchParams();
  const activeKey = searchParams.get('category') || 'all';

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowRail(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-72px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={anchorRef}>
        <CategoryNav />
      </div>
      <FloatingCategoryRail visible={showRail} activeKey={activeKey} />
    </>
  );
}
