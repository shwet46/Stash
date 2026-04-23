import { IconType as LucideIcon } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  subtitle,
}: StatCardProps) {
  const changeColors = {
    positive: "text-success bg-green-50",
    negative: "text-error bg-red-50",
    neutral: "text-muted bg-brand-50",
  };

  return (
    <div className="bg-white rounded-[12px] border border-divider shadow-card p-5 hover:shadow-[0_2px_8px_rgba(107,66,38,0.12),0_8px_24px_rgba(107,66,38,0.10)] transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-brand-600" />
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeColors[changeType]}`}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm text-muted font-medium">{title}</h3>
      <p className="text-2xl font-bold text-brand-800 mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
