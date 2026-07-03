export const formatDate = (date) => {
  if (!date) return '';
  const d = aFechaLocal(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-PA', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = aFechaLocal(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-PA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount, currency = 'USD') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
};

export const getInitials = (nombre) => {
  if (!nombre) return '??';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase();
};

export const truncate = (text, max = 50) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

function aFechaLocal(date) {
  if (typeof date === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return new Date(date);
  }
  return date;
}
