import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, PackageCheckIcon, RotateCcwIcon, Loader2Icon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { BorrowForm } from './BorrowForm';
import { ReturnForm } from './ReturnForm';

const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";

type Tab = 'pinjam' | 'kembali';
const tabs: {
  id: Tab;
  label: string;
  icon: typeof PackageCheckIcon;
}[] = [{
  id: 'pinjam',
  label: 'Form Pinjam Mandiri',
  icon: PackageCheckIcon
}, {
  id: 'kembali',
  label: 'Form Pengembalian Mandiri',
  icon: RotateCcwIcon
}];

interface LiveLoan {
  id: string;
  name: string;
  items: string;
  dueAt: string;
  overdue: boolean;
  qty: number;
}

export function BorrowSection() {
  const [tab, setTab] = useState<Tab>('pinjam');
  const [activeLoans, setActiveLoans] = useState<LiveLoan[]>([]);
  const [overdueUnits, setOverdueUnits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const res = await fetch(`${API_URL}?action=getData`);
        const result = await res.json();

        if (result.success && Array.isArray(result.peminjaman)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Ambil transaksi yang belum dikembalikan
          const unreturned = result.peminjaman.filter((item: any) => {
            const status = String(item['Status Pengembalian'] || item.StatusPengembalian || '').toLowerCase();
            return !status.includes('sudah');
          });

          let totalOverdue = 0;

          const parsedList: LiveLoan[] = unreturned.map((item: any, idx: number) => {
            const dueDateStr = item['Tanggal Pengembalian'] || item.TanggalPengembalian || '';
            let isOverdue = false;

            if (dueDateStr) {
              const due = new Date(dueDateStr);
              if (!isNaN(due.getTime())) {
                isOverdue = due < today;
              }
            }

            const qty = Number(item.Jumlah || item['Jumlah']) || 1;
            if (isOverdue) {
              totalOverdue += qty;
            }

            return {
              id: item.ID || item['ID'] || `PJM-${idx}`,
              name: item.Nama || item['Nama'] || 'Peminjam',
              items: item['Jenis APD'] || item.JenisAPD || 'APD',
              dueAt: dueDateStr || 'Hari ini',
              overdue: isOverdue,
              qty: qty
            };
          });

          setOverdueUnits(totalOverdue);
          // Tampilkan 3 transaksi peminjaman aktif paling baru
          setActiveLoans(parsedList.slice(-3).reverse());
        }
      } catch (err) {
        console.error('Gagal mengambil data peminjaman aktif:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoans();
  }, []);

  return <section id="portal-peminjaman" aria-labelledby="peminjaman-heading" className="w-full border-y border-line bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wide text-safety-600">Portal 01</p>
            <h2 id="peminjaman-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Portal Peminjaman &amp; Pengembalian APD
            </h2>
            <p className="mt-2 text-ink-muted">
              Semua APD di portal ini wajib dikembalikan. Catat pengambilan sebelum ke lapangan dan
              tutup siklusnya dengan bukti foto saat pengembalian.
            </p>
          </div>

          <div role="tablist" aria-label="Pilih form peminjaman atau pengembalian" className="inline-flex shrink-0 rounded-xl border border-line bg-canvas p-1">
            {tabs.map(({
            id,
            label,
            icon: Icon
          }) => <button key={id} role="tab" type="button" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors duration-150 ease-smooth ${tab === id ? 'bg-safety-600 text-white shadow-card' : 'text-ink-muted hover:bg-white hover:text-ink'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>)}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-10">
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            {tab === 'pinjam' ? <BorrowForm /> : <ReturnForm />}
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-canvas p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink-subtle">
                Peminjaman aktif hari ini
              </h3>

              {loading ?
            <div className="flex items-center gap-2 py-6 text-xs text-ink-subtle">
                  <Loader2Icon className="h-4 w-4 animate-spin text-safety-600" />
                  Menyinkronkan data Google Sheets...
                </div> :
            activeLoans.length === 0 ?
            <p className="py-6 text-xs text-ink-subtle">
                  Tidak ada peminjaman aktif yang tertunda saat ini.
                </p> :

            <ul className="mt-4 space-y-4">
                  {activeLoans.map((loan) => <li key={loan.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-ink">{loan.name}</p>
                          <p className="mt-0.5 text-xs text-ink-subtle">
                            {loan.id} · {loan.items} ({loan.qty} Unit)
                          </p>
                        </div>
                        <StatusBadge tone={loan.overdue ? 'danger' : 'success'}>
                          {loan.overdue ? 'Overdue' : 'On-Time'}
                        </StatusBadge>
                      </div>
                      <p className="mt-1.5 text-xs text-ink-subtle">Jatuh tempo {loan.dueAt}</p>
                    </li>)}
                </ul>
            }
            </div>

            {overdueUnits > 0 &&
          <div className="rounded-2xl border border-warn-100 bg-warn-50 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-warn-700">
                  <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" />
                  {overdueUnits} unit melewati jatuh tempo
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-warn-700/90">
                  Keterlambatan pengembalian menahan stok untuk shift berikutnya. Safety Officer akan
                  menghubungi peminjam terkait.
                </p>
              </div>
          }
          </aside>
        </div>
      </div>
    </section>;
}