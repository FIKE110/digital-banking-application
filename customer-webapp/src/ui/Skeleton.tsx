export function Skeleton({ width, height = 14, style, className }: {
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className ?? ''}`}
      style={{ width: width ?? '100%', height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="stack stack--3" style={{ padding: 16 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row" style={{ gap: 12 }}>
          <Skeleton width={40} height={40} style={{ borderRadius: 12, flexShrink: 0 }} />
          <div className="flex-1 stack stack--3">
            <Skeleton width="55%" height={13} />
            <Skeleton width="35%" height={11} />
          </div>
          <Skeleton width={70} height={13} />
        </div>
      ))}
    </div>
  );
}
