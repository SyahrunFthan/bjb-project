export const formatCurrency = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatActivityDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    return `${time} | ${day} ${month}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatTransactionDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${day} ${month} ${year} • ${time}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDueDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};
