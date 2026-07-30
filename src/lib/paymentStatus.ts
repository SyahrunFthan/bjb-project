export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return { label: 'Lunas', color: '#15803D', bg: '#DCFCE7' };
    case 'partially_paid':
      return { label: 'Sebagian', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'overdue':
      return { label: 'Terlambat', color: '#B91C1C', bg: '#FEE2E2' };
    default:
      return { label: 'Belum Bayar', color: '#B45309', bg: '#FEF3C7' };
  }
};
