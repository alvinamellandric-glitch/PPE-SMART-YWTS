export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface BorrowableItem {
  id: string;
  label: string;
  description: string;
  stock: number;
  unit: string;
  sizes?: string[];
}

export interface ConsumableItem {
  id: string;
  label: string;
  unit: string;
  stock: number;
}

export interface ActiveLoan {
  id: string;
  name: string;
  badge: string;
  department: string;
  borrowedAt: string;
  dueAt: string;
  items: string[];
  overdue: boolean;
}

export type NeedType =
'Pinjam Wajib Kembali' |
'Habis Pakai (Non-Return)' |
'Pengadaan Khusus';

export interface RecapRow {
  id: string;
  apd: string;
  need: NeedType;
  total: string;
  returnStatus: string;
  returnTone: StatusTone;
  proof:
  {kind: 'photo';label: string;thumb: string;caption: string;} |
  {kind: 'badge';label: string;tone: StatusTone;};
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  tone: StatusTone;
}