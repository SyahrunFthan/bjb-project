import { color } from '@/assets/color';

export const customerStatusMap: Record<string, string> = {
  priority: 'Prioritas',
  normal: 'Biasa',
  blocked: 'Blokir',
};

export const customerStatusColor: Record<string, string> = {
  priority: color.primary,
  normal: color.secondary,
  blocked: color.tertiary,
};
