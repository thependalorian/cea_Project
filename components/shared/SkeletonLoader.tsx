interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
  count?: number;
  gap?: string;
}

export function Skeleton({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = true,
  count = 1,
  gap = 'mb-2'
}: SkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  return (
    <>
      {skeletons.map((index) => (
        <div
          key={index}
          className={`animate-pulse bg-base-300 ${height} ${width} ${rounded ? 'rounded' : ''} ${gap} ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

interface CardSkeletonProps {
  className?: string;
  imageHeight?: string;
  titleWidth?: string;
  lineCount?: number;
}

export function CardSkeleton({
  className = '',
  imageHeight = 'h-48',
  titleWidth = 'w-3/4',
  lineCount = 3
}: CardSkeletonProps) {
  return (
    <div className={`card bg-base-100 shadow-lg overflow-hidden ${className}`}>
      <div className={`${imageHeight} bg-base-300 animate-pulse`} />
      <div className="card-body">
        <Skeleton height="h-6" width={titleWidth} className="mb-4" />
        <Skeleton count={lineCount} />
        <div className="card-actions justify-end mt-2">
          <Skeleton height="h-10" width="w-24" />
        </div>
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = ''
}: TableSkeletonProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="table w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={`header-${i}`}>
                <Skeleton height="h-6" width="w-24" gap="mb-0" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton height="h-4" width={colIndex === 0 ? 'w-32' : 'w-24'} gap="mb-0" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 