import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message = 'No data to display',
  action,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-outline" />
      </div>
      <h3 className="font-headline font-semibold text-lg text-on-surface mb-1">{title}</h3>
      <p className="text-on-surface-variant text-sm max-w-sm">{message}</p>
      {action && (
        <button onClick={action} className="btn-primary mt-6">
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
