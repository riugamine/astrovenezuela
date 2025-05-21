import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StatCardProps } from '../types/stat-card';

export const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  isLoading, 
  trend, 
  variant,
}) => (
  <Card 
    className={`hover:shadow-md transition-shadow py-6 ${
      variant === "warning" ? 'border-yellow-500' :
      variant === "destructive" ? 'border-red-500' : ''
    }`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <FontAwesomeIcon 
        icon={icon} 
        className={`h-4 w-4 ${
          variant === "warning" ? 'text-yellow-500' :
          variant === "destructive" ? 'text-red-500' : 'text-primary'
        }`} 
      />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <div className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);