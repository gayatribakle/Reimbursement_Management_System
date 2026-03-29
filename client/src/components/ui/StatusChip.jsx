const statusConfig = {
  PENDING: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  APPROVED: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    label: 'Cancelled',
  },
  ADMIN: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    label: 'Admin',
  },
  MANAGER: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
    label: 'Manager',
  },
  FINANCE: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    label: 'Finance',
  },
  DIRECTOR: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    label: 'Director',
  },
  EMPLOYEE: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
    label: 'Employee',
  },
};

export default function StatusChip({ status, size = 'sm' }) {
  const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
