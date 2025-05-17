import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconDefinition;
  isLoading: boolean;
  trend?: number;
  variant?: "warning" | "destructive";
  className?: string;
}