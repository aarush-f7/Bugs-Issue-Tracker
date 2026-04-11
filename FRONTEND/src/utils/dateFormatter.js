import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy • HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
};
