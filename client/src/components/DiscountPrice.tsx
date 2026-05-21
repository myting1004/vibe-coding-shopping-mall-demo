type DiscountPriceProps = {
  price: number;
  size?: 'sm' | 'md';
};

export default function DiscountPrice({
  price,
  size = 'sm',
}: DiscountPriceProps) {
  const amountClass =
    size === 'md'
      ? 'text-2xl font-extrabold text-rose-600'
      : 'text-sm font-bold text-rose-600';

  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className="text-xs font-semibold text-rose-600">할인가</span>
      <span className={amountClass}>{price.toLocaleString()}원</span>
    </div>
  );
}
