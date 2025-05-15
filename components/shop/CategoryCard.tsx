import { Category } from '@/lib/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full">
        <div className="relative h-48 w-full bg-gray-200">
          {category.banner_url && (
            <Image
              src={category.banner_url}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}