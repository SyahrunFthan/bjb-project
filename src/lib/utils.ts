export const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

export const skeletonData = Array.from({ length: 5 }).map((_, i) => ({
  id: `skeleton-${i}`,
}));
