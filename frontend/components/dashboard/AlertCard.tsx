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
    bg: "bg-amber-50",
    border: "border-warning",
    iconColor: "text-warning",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-red-50",
    border: "border-error",
    iconColor: "text-error",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-400",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-success",
    iconColor: "text-success",
  },
};

export default function AlertCard({ type, title, message, time }: AlertCardProps) {
  const { icon: Icon, bg, border, iconColor } = config[type];

  return (
    <div
      className={`${bg} rounded-[12px] border-l-4 ${border} p-4 flex items-start gap-3`}
    >
      <Icon size={18} className={`${iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-brand-800">{title}</h4>
        <p className="text-xs text-muted mt-0.5">{message}</p>
      </div>
      {time && <span className="text-xs text-muted flex-shrink-0">{time}</span>}
    </div>
  );
}
