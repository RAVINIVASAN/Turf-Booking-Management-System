const statusConfig = {
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' },
};

export function Badge({ status, customLabel }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const label = customLabel || config.label;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
