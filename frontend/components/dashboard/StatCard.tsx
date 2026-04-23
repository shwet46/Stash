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
    <div className="dashboard-card">
      <div className="d-flex align-center justify-between mb-4">
        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--color-brand-50)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color: 'var(--color-brand-600)' }} />
        </div>
        {change && (
          <span className={`badge ${changeType === 'positive' ? 'badge-success' : changeType === 'negative' ? 'badge-error' : 'badge-warning'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="dashboard-card-subtitle">{title}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)', marginTop: '0.25rem' }}>{value}</p>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>{subtitle}</p>
      )}
    </div>
  );
}
