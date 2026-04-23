import { LuTriangleAlert as AlertTriangle, LuInfo as Info, LuCheck as CheckCircle } from 'react-icons/lu';

interface AlertCardProps {
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  time?: string;
}

const config = {
  warning: {
    icon: AlertTriangle,
    bg: "rgba(245, 158, 11, 0.05)",
    border: "var(--color-warning)",
    iconColor: "var(--color-warning)",
  },
  error: {
    icon: AlertTriangle,
    bg: "rgba(239, 68, 68, 0.05)",
    border: "var(--color-error)",
    iconColor: "var(--color-error)",
  },
  info: {
    icon: Info,
    bg: "rgba(59, 130, 246, 0.05)",
    border: "#3B82F6",
    iconColor: "#3B82F6",
  },
  success: {
    icon: CheckCircle,
    bg: "rgba(16, 185, 129, 0.05)",
    border: "var(--color-success)",
    iconColor: "var(--color-success)",
  },
};

export default function AlertCard({ type, title, message, time }: AlertCardProps) {
  const { icon: Icon, bg, border, iconColor } = config[type];

  return (
    <div
      style={{ backgroundColor: bg, borderLeft: `4px solid ${border}`, borderRadius: '0.5rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}
    >
      <Icon size={18} style={{ color: iconColor, marginTop: '0.125rem', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-800)' }}>{title}</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.125rem' }}>{message}</p>
      </div>
      {time && <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', flexShrink: 0 }}>{time}</span>}
    </div>
  );
}
