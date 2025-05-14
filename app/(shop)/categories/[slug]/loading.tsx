import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner skeleton */}
      <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Description skeleton */}
      <Skeleton className="h-6 w-2/3 mx-auto mb-8" />

      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}