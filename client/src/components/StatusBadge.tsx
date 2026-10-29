import { CheckCircle2, Clock, XCircle, Calendar, type LucideIcon } from 'lucide-react';
import type { DocumentStatus } from '../types';

interface StatusBadgeProps {
  status: DocumentStatus;
  daysLeft?: number;
}

const CONFIG: Record<DocumentStatus, { label: string; className: string; Icon: LucideIcon }> = {
  valid:         { label: 'Valid',           className: 'badge-valid',      Icon: CheckCircle2 },
  expiring_soon: { label: 'Expiring Soon',   className: 'badge-expiring',   Icon: Clock },
  expired:       { label: 'Expired',         className: 'badge-expired',    Icon: XCircle },
  no_expiry:     { label: 'No Expiry Date',  className: 'badge-no-expiry',  Icon: Calendar },
};

export function StatusBadge({ status, daysLeft }: StatusBadgeProps) {
  const { label, className, Icon } = CONFIG[status];

  const suffix =
    status === 'expired' && daysLeft !== undefined
      ? ` (${Math.abs(daysLeft)}d ago)`
      : status === 'expiring_soon' && daysLeft !== undefined
      ? ` (${daysLeft}d)`
      : '';

  return (
    <span className={className}>
      <Icon className="w-3 h-3" />
      {label}{suffix}
    </span>
  );
}
