import React, { useMemo } from 'react';
import { ExternalLinkIcon, ImageIcon, Loader2Icon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import type { PhotoProof } from '../PhotoProofModal';

interface RawLoan {
  ID: string;
  Tanggal: string;
  Nama: string;
  'ID/Badge': string;
  Divisi: string;
  'Jenis APD': string;
  Jumlah: number;
  'Tanggal Pengembalian': string;
  'Status Pengembalian': string;
  'Bukti Foto': string;
  [key: string]: any;
}

interface RawRequest {
  ID: string;
  Tanggal: string;
  Nama: string;
  Divisi: string;
  'Jenis Permintaan': string;
  'Jenis APD': string;
  Ukuran: string;
  Jumlah: number;
  'Warna/Tipe': string;
  Catatan: string;
  [key: string]: any;
}

interface RecapTableProps {
  peminjaman: RawLoan[];
  permintaan: RawRequest[];
  loading: boolean;
  onViewProof?: (proof: PhotoProof) => void;
}

export function RecapTable({
  peminjaman,
  permintaan,
  loading,
  onViewProof
}: RecapTableProps) {
  // Hitung agregasi dinamis per jenis APD dari Google Sheets
  const rows = useMemo(() => {
    // 1. APD Wajib Kembali (Dari Tab Peminjaman - 6 Item Terdaftar)
    const pinjamItems = [
    {
      id: 'helm',
      name: 'Helm Safety',
      matchKeywords: ['helm'],
      unit: 'Unit',
      category: 'Pinjam Wajib Kembali'
    },
    {
      id: 'harness',
      name: 'Body Harness',
      matchKeywords: ['harness'],
      unit: 'Unit',
      category: 'Pinjam Wajib Kembali'
    },
    {
      id: 'sepatu-low',
      name: 'Sepatu Safety (Low Cut)',
      matchKeywords: ['low cut', 'sepatu safety'],
      excludeKeywords: ['boots', 'high cut'],
      unit: 'Pasang',
      category: 'Pinjam Wajib Kembali'
    },
    {
      id: 'boots-high',
      name: 'Boots Safety (High Cut)',
      matchKeywords: ['boots', 'high cut'],
      unit: 'Pasang',
      category: 'Pinjam Wajib Kembali'
    },
    {
      id: 'life-jacket',
      name: 'Life Jacket',
      matchKeywords: ['life jacket', 'pelampung'],
      unit: 'Unit',
      category: 'Pinjam Wajib Kembali'
    },
    {
      id: 'safety-vest',
      name: 'Safety Vest',
      matchKeywords: ['vest', 'rompi'],
      unit: 'Pcs',
      category: 'Pinjam Wajib Kembali'
    }];


    const pinjamAggregated = pinjamItems.map((item) => {
      let totalQty = 0;
      let returnedCount = 0;
      let pendingCount = 0;
      let latestProofUrl = '';

      if (Array.isArray(peminjaman)) {
        peminjaman.forEach((p) => {
          const apdText = String(p['Jenis APD'] || p.JenisAPD || '').toLowerCase();
          const statusText = String(p['Status Pengembalian'] || p.StatusPengembalian || '').toLowerCase();
          const proofUrl = String(p['Bukti Foto'] || p.BuktiFoto || '');

          const isMatched = item.matchKeywords.some((kw) => apdText.includes(kw));
          const isExcluded = item.excludeKeywords ? item.excludeKeywords.some((kw) => apdText.includes(kw)) : false;

          if (isMatched && !isExcluded) {
            // Ekstrak kuantitas item spesifik bila tercatat dalam format multi-item
            const regexClean = item.name.replace(/[^a-zA-Z0-9]/g, '\\s*');
            const match = apdText.match(new RegExp(`${regexClean}[^:]*:\\s*(\\d+)`, 'i'));
            const qty = match ? parseInt(match[1], 10) : Number(p.Jumlah || p['Jumlah']) || 1;

            totalQty += qty;

            if (statusText.includes('sudah') || statusText.includes('dikembalikan')) {
              returnedCount += qty;
              if (proofUrl && proofUrl.startsWith('http')) {
                latestProofUrl = proofUrl;
              }
            } else {
              pendingCount += qty;
            }
          }
        });
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        total: `${totalQty} ${item.unit}`,
        returnStatus:
        totalQty === 0 ?
        'Belum Ada Pemakaian' :
        pendingCount === 0 ?
        'Lengkap (Semua Kembali)' :
        `${returnedCount} Kembali · ${pendingCount} Dipinjam`,
        tone:
        totalQty === 0 ?
        'neutral' as const :
        pendingCount === 0 ?
        'success' as const :
        'warning' as const,
        proofUrl: latestProofUrl,
        kind: 'pinjam'
      };
    });

    // 2. APD Sekali Pakai & Pengadaan Khusus (Dari Tab Permintaan)
    const requestItems = [
    {
      id: 'wearpack',
      name: 'Wearpack Kerja',
      matchKeywords: ['wearpack'],
      unit: 'Set',
      category: 'Pengadaan Khusus'
    },
    {
      id: 'sarung',
      name: 'Sarung Tangan',
      matchKeywords: ['sarung tangan', 'sarung'],
      unit: 'Pasang',
      category: 'Habis Pakai'
    },
    {
      id: 'masker',
      name: 'Masker Medis',
      matchKeywords: ['masker'],
      unit: 'Box',
      category: 'Habis Pakai'
    },
    {
      id: 'kacamata',
      name: 'Kacamata Safety / Goggles',
      matchKeywords: ['kacamata', 'goggle', 'splash'],
      unit: 'Pcs',
      category: 'Habis Pakai'
    }];


    const requestAggregated = requestItems.map((item) => {
      let totalQty = 0;
      let isIndentInProcess = false;

      if (Array.isArray(permintaan)) {
        permintaan.forEach((r) => {
          const reqApd = String(r['Jenis APD'] || r.JenisAPD || '').toLowerCase();
          const reqKind = String(r['Jenis Permintaan'] || r.JenisPermintaan || '').toLowerCase();
          const trackingStatus = String(r['Status Tracking'] || r.StatusTracking || '').toLowerCase();

          const isMatched = item.matchKeywords.some((kw) => reqApd.includes(kw));

          if (isMatched) {
            totalQty += Number(r.Jumlah || r['Jumlah']) || 1;
            if (reqKind.includes('indent') && !trackingStatus.includes('selesai') && !trackingStatus.includes('siap')) {
              isIndentInProcess = true;
            }
          }
        });
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        total: `${totalQty} ${item.unit}`,
        returnStatus:
        item.category === 'Pengadaan Khusus' ?
        isIndentInProcess ?
        'Proses Vendor' :
        totalQty === 0 ?
        'Belum Ada Pemesanan' :
        'Selesai Logistik' :
        'Non-Returnable',
        tone:
        item.category === 'Pengadaan Khusus' ?
        isIndentInProcess ?
        'warning' as const :
        'neutral' as const :
        'neutral' as const,
        proofUrl: '',
        kind: 'permintaan'
      };
    });

    return [...pinjamAggregated, ...requestAggregated];
  }, [peminjaman, permintaan]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-ink">
            Rekapitulasi Bulanan per Jenis APD
          </h3>
          <p className="mt-0.5 text-xs text-ink-subtle">
            Data live terakumulasi langsung dari transaksi Google Sheets
          </p>
        </div>
        <StatusBadge tone={loading ? 'warning' : 'success'}>
          {loading ? 'Memperbarui data...' : 'Tersinkron dengan Sheets'}
        </StatusBadge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="bg-canvas text-xs font-bold uppercase tracking-wide text-ink-subtle">
              <th scope="col" className="px-5 py-3">Jenis APD</th>
              <th scope="col" className="px-5 py-3">Tipe Kebutuhan</th>
              <th scope="col" className="px-5 py-3">Total Terpakai</th>
              <th scope="col" className="px-5 py-3">Status Pengembalian</th>
              <th scope="col" className="px-5 py-3">Verifikasi Bukti Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading &&
            <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink-subtle">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-5 w-5 animate-spin text-safety-600" />
                    Menghitung rekapitulasi data dari Google Sheets...
                  </div>
                </td>
              </tr>
            }
            {!loading &&
            rows.map((row) =>
            <tr key={row.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas">
                  <th scope="row" className="px-5 py-4 text-sm font-bold text-ink">
                    {row.name}
                  </th>
                  <td className="px-5 py-4">
                    <span
                  className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${
                  row.category === 'Pinjam Wajib Kembali' ?
                  'bg-safety-50 text-safety-700' :
                  row.category === 'Pengadaan Khusus' ?
                  'bg-slate-900 text-white' :
                  'bg-slate-100 text-ink-muted'}`
                  }>
                  
                      {row.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold tabular-nums text-ink">
                    {row.total}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.tone}>{row.returnStatus}</StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    {row.proofUrl ?
                <a
                  href={row.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-safety-600 transition-colors duration-150 ease-smooth hover:border-safety-300 hover:bg-safety-50">
                  
                        <ImageIcon className="h-3.5 w-3.5" />
                        Lihat Foto di Drive
                        <ExternalLinkIcon className="h-3 w-3 text-ink-subtle group-hover:text-safety-600" />
                      </a> :

                <StatusBadge tone="neutral">
                        {row.kind === 'pinjam' ? 'Belum Ada Foto' : 'N/A'}
                      </StatusBadge>
                }
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}