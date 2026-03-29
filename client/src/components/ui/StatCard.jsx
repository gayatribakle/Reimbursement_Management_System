export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary to-primary-container',
    amber: 'from-amber-500 to-amber-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="card-elevated flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
          colorMap[color] || colorMap.primary
        } flex items-center justify-center shadow-md flex-shrink-0`}
      >
        {Icon && <Icon className="w-5 h-5 text-white" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-on-surface-variant font-body">{label}</p>
        <p className="text-2xl font-headline font-bold text-on-surface mt-0.5">{value}</p>
        {trend !== undefined && trend !== null && (
          <p
            className={`text-xs font-medium mt-1 ${
              trend >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
}
