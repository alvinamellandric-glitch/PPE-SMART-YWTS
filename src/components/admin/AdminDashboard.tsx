import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3Icon, CalendarIcon, CheckIcon, ClockIcon, Edit3Icon, FileSpreadsheetIcon, ImageIcon, LayersIcon, ListOrderedIcon, Loader2Icon, LockIcon, PackageCheckIcon, RefreshCwIcon, ShieldIcon, TruckIcon, UnlockIcon, XIcon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { PhotoProofModal, type PhotoProof } from '../PhotoProofModal';
import { RecapTable } from './RecapTable';

// Konfigurasi API Backend & Spreadsheet Baru
const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";
const SECRET_TOKEN = "PPE-SMART-2026";
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1DbpY_6UDQx_y4TiqP5XyRdGFq04OTu7BXGS0c5-u6TI/edit";

// Konfigurasi Notifikasi EmailJS (Diperbarui dengan Template ID aktif)
const EMAILJS_SERVICE_ID = "service_ppe_smart";
const EMAILJS_PUBLIC_KEY = "1UXRSVv8A2larBZVF";
const EMAILJS_TEMPLATE_STOCK = "cg26et5";
const EMAILJS_TEMPLATE_WEARPACK = "template_gpyutsr";

interface AdminDashboardProps {
  unlocked: boolean;
  onRequestAccess: () => void;
}
interface StockItem {
  ID: string;
  'Nama APD': string;
  Kategori: string;
  Stok: number;
  Satuan: string;
  [key: string]: any;
}

// 1. Fungsi pengirim alert stok kritis/menipis ke Admin
const sendStockAlertEmail = async (namaApd: string, stockLeft: number) => {
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_STOCK,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          item_name: namaApd,
          stock_left: stockLeft
        }
      })
    });
    console.log(`Alert EmailJS terkirim untuk stok APD: ${namaApd} (sisa ${stockLeft})`);
  } catch (err) {
    console.error("Gagal mengirim email alert stok:", err);
  }
};

// 2. Fungsi pengirim notifikasi barang siap ambil ke Pemohon
const sendWearpackReadyEmail = async (pemohonNama: string, pemohonEmail: string, idReq: string, itemApd: string) => {
  if (!pemohonEmail || !pemohonEmail.includes('@')) {
    console.log("Email pemohon tidak valid atau kosong, melewati pengiriman email.");
    return;
  }
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_WEARPACK,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          pemohon_nama: pemohonNama,
          pemohon_email: pemohonEmail,
          id_req: idReq,
          item_apd: itemApd
        }
      })
    });
    console.log(`Email barang siap ambil terkirim ke: ${pemohonEmail}`);
  } catch (err) {
    console.error("Gagal mengirim email barang ready:", err);
  }
};

export function AdminDashboard({
  unlocked,
  onRequestAccess
}: AdminDashboardProps) {
  const [proof, setProof] = useState<PhotoProof | null>(null);
  const [peminjamanData, setPeminjamanData] = useState<any[]>([]);
  const [permintaanData, setPermintaanData] = useState<any[]>([]);
  const [masterApdList, setMasterApdList] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mode Tampilan Grafik
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Modal Edit Stok
  const [isEditStockOpen, setIsEditStockOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Status Tracking Updating State
  const [updatingTrackingId, setUpdatingTrackingId] = useState<string | null>(null);

  const fetchRecapData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getData`);
      const result = await res.json();
      if (result.success) {
        setPeminjamanData(result.peminjaman || []);
        setPermintaanData(result.permintaan || []);
        setMasterApdList(result.masterAPD || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) {
      fetchRecapData();
    }
  }, [unlocked]);

  // Ubah Status Tracking APD Indent & Kirim Email jika Siap Diambil
  const handleUpdateTracking = async (idReq: string, newStatus: string, orderData?: any) => {
    setUpdatingTrackingId(idReq);
    const payload = {
      token: SECRET_TOKEN,
      action: 'updateTrackingWearpack',
      idReq: idReq,
      newStatus: newStatus
    };
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      // Jika status diubah menjadi "Siap Diambil di Logistik", kirim notifikasi email ke pemohon
      if (newStatus === 'Siap Diambil di Logistik' && orderData) {
        const emailPemohon = orderData.Email || orderData.email || orderData['Email Pemohon'] || '';
        const namaPemohon = orderData.Nama || orderData['Nama'] || 'Karyawan';
        const apdName = orderData['Jenis APD'] || orderData.JenisAPD || 'APD';
        const itemRincian = `${apdName} (Ukuran/Tipe: ${orderData.Ukuran || orderData['Warna/Tipe'] || '-'}, Jumlah: ${orderData.Jumlah || 1})`;
        sendWearpackReadyEmail(namaPemohon, emailPemohon, idReq, itemRincian);
      }

      // Update state lokal
      setPermintaanData((prev) => prev.map((item) => {
        const rowId = item.ID || item['ID'];
        if (rowId === idReq) {
          return {
            ...item,
            'Status Tracking': newStatus,
            StatusTracking: newStatus
          };
        }
        return item;
      }));
    } catch (err) {
      alert('Gagal memperbarui status tracking.');
    } finally {
      setUpdatingTrackingId(null);
    }
  };

  // Simpan Stok APD & Trigger EmailJS jika stok menipis (< 5)
  const handleSaveStock = async () => {
    if (!selectedStockItem) return;
    setUpdatingStock(true);
    const payload = {
      token: SECRET_TOKEN,
      action: 'updateStockAPD',
      id: selectedStockItem.ID,
      namaApd: selectedStockItem['Nama APD'],
      newStock: newStockValue
    };
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (newStockValue < 5) {
        sendStockAlertEmail(selectedStockItem['Nama APD'], newStockValue);
      }
      setMasterApdList((prev) => prev.map((item) => item.ID === selectedStockItem.ID ? {
        ...item,
        Stok: newStockValue
      } : item));
      setIsEditStockOpen(false);
      setSelectedStockItem(null);
    } catch (err) {
      alert('Gagal mengupdate stok. Periksa koneksi internet.');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Grafik 12 Bulan
  const yearlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const result = [];
    const now = new Date(2026, 8, 1);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yearStr}-${monthStr}`;
      const label = `${monthNames[d.getMonth()]} ${String(yearStr).slice(-2)}`;
      let pinjamCount = 0;
      peminjamanData.forEach((p) => {
        const rawDate = String(p.Tanggal || p['Tanggal'] || '');
        if (rawDate.startsWith(key)) {
          pinjamCount += Number(p.Jumlah || p['Jumlah']) || 1;
        }
      });
      let requestCount = 0;
      permintaanData.forEach((r) => {
        const rawDate = String(r.Tanggal || r['Tanggal'] || '');
        if (rawDate.startsWith(key)) {
          requestCount += Number(r.Jumlah || r['Jumlah']) || 1;
        }
      });
      result.push({
        key,
        label,
        pinjamCount,
        requestCount
      });
    }
    return result;
  }, [peminjamanData, permintaanData]);

  const maxYearlyValue = useMemo(() => {
    let max = 0;
    yearlyChartData.forEach((d) => {
      if (d.pinjamCount > max) max = d.pinjamCount;
      if (d.requestCount > max) max = d.requestCount;
    });
    return Math.max(max + 2, 8);
  }, [yearlyChartData]);

  // Data Bulanan
  const monthlyApdData = useMemo(() => {
    const apdCounts: Record<string, {
      pinjam: number;
      minta: number;
    }> = {};
    peminjamanData.forEach((p) => {
      const dateStr = String(p.Tanggal || p['Tanggal'] || '');
      if (dateStr.startsWith(selectedMonth)) {
        const rawApd = String(p['Jenis APD'] || p.JenisAPD || 'Lainnya');
        const items = rawApd.split(';').map((s) => s.trim()).filter(Boolean);
        items.forEach((item) => {
          const cleanName = item.split(':')[0].replace(/\(.*?\)/g, '').trim();
          if (!apdCounts[cleanName]) apdCounts[cleanName] = {
            pinjam: 0,
            minta: 0
          };
          apdCounts[cleanName].pinjam += Number(p.Jumlah) || 1;
        });
      }
    });
    permintaanData.forEach((r) => {
      const dateStr = String(r.Tanggal || r['Tanggal'] || '');
      if (dateStr.startsWith(selectedMonth)) {
        const rawApd = String(r['Jenis APD'] || r.JenisAPD || 'Lainnya');
        const items = rawApd.split(';').map((s) => s.trim()).filter(Boolean);
        items.forEach((item) => {
          const cleanName = item.split(':')[0].replace(/\(.*?\)/g, '').trim();
          if (!apdCounts[cleanName]) apdCounts[cleanName] = {
            pinjam: 0,
            minta: 0
          };
          apdCounts[cleanName].minta += Number(r.Jumlah) || 1;
        });
      }
    });
    return Object.entries(apdCounts).map(([name, val]) => ({
      name,
      pinjam: val.pinjam,
      minta: val.minta,
      total: val.pinjam + val.minta
    }));
  }, [peminjamanData, permintaanData, selectedMonth]);

  const maxMonthlyValue = useMemo(() => {
    let max = 0;
    monthlyApdData.forEach((d) => {
      if (d.total > max) max = d.total;
    });
    return Math.max(max, 5);
  }, [monthlyApdData]);

  // Daftar Pesanan Indent Khusus Antrean (Wearpack, Helm, Kacamata, Sepatu)
  const indentOrders = useMemo(() => {
    return permintaanData.filter((r) => {
      const apd = String(r['Jenis APD'] || r.JenisAPD || '').toLowerCase();
      const jenisReq = String(r['Jenis Permintaan'] || r.JenisPermintaan || '').toLowerCase();
      return (
        apd.includes('wearpack') ||
        apd.includes('helm') ||
        apd.includes('kacamata') ||
        apd.includes('sepatu') ||
        jenisReq.includes('indent') ||
        jenisReq.includes('khusus'));

    });
  }, [permintaanData]);

  // Filter khusus riwayat permintaan APD sekali pakai / habis pakai
  const consumableOrders = useMemo(() => {
    return permintaanData.filter((r) => {
      const apd = String(r['Jenis APD'] || r.JenisAPD || '').toLowerCase();
      const jenisReq = String(r['Jenis Permintaan'] || r.JenisPermintaan || '').toLowerCase();
      const isIndent =
      apd.includes('wearpack') ||
      apd.includes('helm') ||
      apd.includes('kacamata') ||
      apd.includes('sepatu') ||
      jenisReq.includes('indent') ||
      jenisReq.includes('khusus');

      return !isIndent;
    });
  }, [permintaanData]);

  return <section id="rekapitulasi" className="w-full border-t border-line bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-safety-600">Portal 03</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Dashboard Rekapitulasi &amp; Analisis Distribusi APD
          </h2>
          <p className="mt-2 text-ink-muted">
            Audit aktivitas peminjaman, pengelolaan stok gudang, dan pembaruan alur kerja tracking wearpack &amp; APD indent.
          </p>
        </div>

        {!unlocked ? <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-line bg-canvas px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-white">
              <LockIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">Rekapitulasi Terkunci</h3>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              Data audit dan kontrol status hanya dapat diakses Tim K3 &amp; Logistik.
            </p>
            <button type="button" onClick={onRequestAccess} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-safety-600 px-6 py-3.5 text-sm font-bold text-white shadow-card hover:bg-safety-700">
              <UnlockIcon className="h-4 w-4" />
              Buka Portal Admin
            </button>
          </div> : <div className="mt-10 space-y-8">
            {/* Header Admin */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-4">
              <p className="flex items-center gap-2.5 text-sm font-bold text-white">
                <ShieldIcon className="h-4 w-4 text-safety-400" />
                Akses Terbatas: Tim K3 &amp; Logistik
                <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                  · Sesi Aktif Admin
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={fetchRecapData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">
                  <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
                <button type="button" onClick={() => window.open(SPREADSHEET_URL, '_blank')} className="inline-flex items-center gap-1.5 rounded-lg bg-safety-600 px-3 py-2 text-sm font-semibold text-white hover:bg-safety-700">
                  <FileSpreadsheetIcon className="h-4 w-4" />
                  Buka Google Sheets
                </button>
              </div>
            </div>

            {/* SEKSI 1: GRAFIK VISUAL BATANG */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                    <BarChart3Icon className="h-5 w-5 text-safety-600" />
                    {viewMode === 'yearly' ? 'Penggunaan per bulan (12 bulan terakhir)' : `Detail Penggunaan APD per Jenis (${selectedMonth})`}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    Terhitung otomatis dari database Google Sheets
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {viewMode === 'monthly' && <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink focus:border-safety-600 focus:outline-none">
                      <option value="2026-09">September 2026</option>
                      <option value="2026-08">Agustus 2026</option>
                      <option value="2026-07">Juli 2026</option>
                    </select>}

                  <div className="flex rounded-lg border border-line bg-canvas p-1">
                    <button type="button" onClick={() => setViewMode('yearly')} className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${viewMode === 'yearly' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}>
                      <CalendarIcon className="h-3.5 w-3.5" />
                      1 Tahun
                    </button>
                    <button type="button" onClick={() => setViewMode('monthly')} className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}>
                      <LayersIcon className="h-3.5 w-3.5" />
                      1 Bulan (Per APD)
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'yearly' && <div className="pt-8">
                  <div className="relative h-64 w-full">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[1, 0.75, 0.5, 0.25, 0].map((ratio) => <div key={ratio} className="flex items-center w-full">
                          <span className="w-6 text-right text-[11px] text-slate-400 tabular-nums pr-2">
                            {Math.round(maxYearlyValue * ratio)}
                          </span>
                          <div className="h-px flex-1 border-b border-dashed border-slate-200" />
                        </div>)}
                    </div>

                    <div className="absolute inset-0 left-8 flex items-end justify-between pr-2">
                      {yearlyChartData.map((d) => <div key={d.key} className="flex flex-1 flex-col items-center h-full justify-end group">
                          <div className="flex items-end gap-1.5 h-full pb-1">
                            <div style={{
                      height: `${Math.max(d.pinjamCount / maxYearlyValue * 100, 3)}%`
                    }} className="w-4 sm:w-6 rounded-t-md bg-[#F59E0B] transition-all duration-300 relative group-hover:brightness-95">
                              {d.pinjamCount > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {d.pinjamCount} Pinjam
                                </span>}
                            </div>

                            <div style={{
                      height: `${Math.max(d.requestCount / maxYearlyValue * 100, 3)}%`
                    }} className="w-4 sm:w-6 rounded-t-md bg-[#6B7280] transition-all duration-300 relative group-hover:brightness-95">
                              {d.requestCount > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {d.requestCount} Minta
                                </span>}
                            </div>
                          </div>
                          <span className="mt-2 text-[11px] text-ink-muted font-medium">
                            {d.label}
                          </span>
                        </div>)}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-6 border-t border-line pt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-[#F59E0B]" />
                      <span className="text-xs font-semibold text-ink">Peminjaman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-[#6B7280]" />
                      <span className="text-xs font-semibold text-ink">Permintaan</span>
                    </div>
                  </div>
                </div>}

              {viewMode === 'monthly' && <div className="mt-6 space-y-4">
                  {monthlyApdData.length === 0 ? <div className="py-12 text-center text-xs text-ink-subtle">
                      Belum ada transaksi APD tercatat pada bulan {selectedMonth}.
                    </div> : monthlyApdData.map((item) => <div key={item.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-ink">
                          <span>{item.name}</span>
                          <span className="text-ink-muted">
                            Total: <strong className="text-ink">{item.total} Unit</strong>{' '}
                            ({item.pinjam} Pinjam · {item.minta} Minta)
                          </span>
                        </div>
                        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                          {item.pinjam > 0 && <div style={{
                  width: `${item.pinjam / maxMonthlyValue * 100}%`
                }} className="bg-[#F59E0B] transition-all duration-300" title={`Peminjaman: ${item.pinjam}`} />}
                          {item.minta > 0 && <div style={{
                  width: `${item.minta / maxMonthlyValue * 100}%`
                }} className="bg-[#6B7280] transition-all duration-300" title={`Permintaan: ${item.minta}`} />}
                        </div>
                      </div>)}

                  <div className="mt-6 flex items-center justify-center gap-6 border-t border-line pt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-[#F59E0B]" />
                      <span className="text-xs font-semibold text-ink">Peminjaman Wajib Kembali</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-[#6B7280]" />
                      <span className="text-xs font-semibold text-ink">Permintaan (Habis Pakai/Indent)</span>
                    </div>
                  </div>
                </div>}
            </div>

            {/* SEKSI 2: KONTROL ALUR STATUS TRACKING APD INDENT & EMAIL KE PEMOHON */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="border-b border-line pb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <TruckIcon className="h-5 w-5 text-safety-600" />
                  Manajemen Status Pelacakan APD Khusus &amp; Indent (Wearpack, Helm, Kacamata, Sepatu)
                </h3>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  Pilih status baru pada pesanan. Jika diubah ke &quot;Siap Diambil di Logistik&quot;, sistem otomatis mengirim email pemberitahuan ke pemohon.
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[750px] border-collapse text-left">
                  <thead>
                    <tr className="bg-canvas text-xs font-bold uppercase tracking-wide text-ink-subtle">
                      <th className="px-4 py-3">ID Permintaan</th>
                      <th className="px-4 py-3">Pemohon</th>
                      <th className="px-4 py-3">Divisi</th>
                      <th className="px-4 py-3">Rincian APD</th>
                      <th className="px-4 py-3">Status Saat Ini</th>
                      <th className="px-4 py-3">Ubah Status Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {indentOrders.length === 0 ? <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-subtle">
                          Belum ada pengajuan pesanan APD khusus/indent.
                        </td>
                      </tr> : indentOrders.map((order) => {
                  const idReq = order.ID || order['ID'] || '-';
                  const currentStatus = order['Status Tracking'] || order.StatusTracking || 'Diajukan';
                  const isUpdating = updatingTrackingId === idReq;
                  const itemTitle = order['Jenis APD'] || order.JenisAPD || 'Wearpack';
                  return <tr key={idReq} className="hover:bg-canvas">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-safety-600">
                              {idReq}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-ink">{order.Nama || order['Nama']}</p>
                              {(order.Email || order.email) && <p className="text-[11px] text-ink-subtle">{order.Email || order.email}</p>}
                            </td>
                            <td className="px-4 py-3 text-ink-muted">
                              {order.Divisi || order['Divisi']}
                            </td>
                            <td className="px-4 py-3 text-xs text-ink-subtle">
                              <span className="font-bold text-ink">{itemTitle}</span>
                              {order.Ukuran && order.Ukuran !== '-' ? ` · Ukuran: ${order.Ukuran}` : ''}
                              {order['Warna/Tipe'] && order['Warna/Tipe'] !== '-' ? ` (${order['Warna/Tipe']})` : ''}
                              {` · ${order.Jumlah || 1} unit`}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge tone={currentStatus === 'Siap Diambil di Logistik' ? 'success' : currentStatus === 'Proses Vendor' ? 'warning' : 'neutral'}>
                                {currentStatus}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <select disabled={isUpdating} value={currentStatus} onChange={(e) => handleUpdateTracking(idReq, e.target.value, order)} className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink focus:border-safety-600 focus:outline-none disabled:bg-slate-100">
                                  <option value="Diajukan">1. Diajukan</option>
                                  <option value="Proses Vendor">2. Proses Vendor</option>
                                  <option value="Siap Diambil di Logistik">3. Siap Diambil di Logistik</option>
                                </select>
                                {isUpdating && <Loader2Icon className="h-4 w-4 animate-spin text-safety-600" />}
                              </div>
                            </td>
                          </tr>;
                })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEKSI 3: KONTROL STOK APD DENGAN INDIKATOR WARNING & ALERT EMAILJS */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                    <PackageCheckIcon className="h-5 w-5 text-safety-600" />
                    Manajemen &amp; Kontrol Stok APD Gudang
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    Stok terpotong otomatis saat transaksi. Email notifikasi otomatis terkirim jika stok berada di bawah 5 unit (&lt; 5).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 border border-red-200">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Stok Kritis (&le; 2)
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Menipis (&lt; 5)
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {masterApdList.map((item) => {
              const stock = Number(item.Stok) || 0;
              const isCritical = stock <= 2;
              const isLow = stock > 2 && stock < 5;
              return <div key={item.ID || item['Nama APD']} className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${isCritical ? 'border-red-300 bg-red-50/60 shadow-sm' : isLow ? 'border-amber-300 bg-amber-50/60' : 'border-line bg-canvas'}`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-ink-subtle">{item.Kategori}</span>
                          {isCritical ? <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                              KRITIS
                            </span> : isLow ? <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                              MENIPIS
                            </span> : null}
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-ink">{item['Nama APD']}</h4>
                        <p className={`mt-3 text-2xl font-extrabold ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-ink'}`}>
                          {stock}{' '}
                          <span className="text-xs font-normal text-ink-subtle">{item.Satuan}</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => {
                  setSelectedStockItem(item);
                  setNewStockValue(stock);
                  setIsEditStockOpen(true);
                }} className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-bold transition-colors ${isCritical ? 'border-red-300 bg-white text-red-700 hover:bg-red-50' : 'border-line bg-white text-ink hover:border-safety-600 hover:text-safety-600'}`}>
                        <Edit3Icon className="h-3.5 w-3.5" />
                        Ubah Stok
                      </button>
                    </div>;
            })}
              </div>
            </div>

            {/* SEKSI 4: TABEL REKAPITULASI TOTAL BULANAN */}
            <RecapTable peminjaman={peminjamanData} permintaan={permintaanData} loading={loading} onViewProof={setProof} />

            {/* SEKSI 5: TABEL RIWAYAT LOG PEMINJAMAN LENGKAP */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="border-b border-line pb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <ListOrderedIcon className="h-5 w-5 text-safety-600" />
                  Log Riwayat Data Peminjaman Lengkap
                </h3>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  Daftar transaksi rinci seluruh peminjam APD wajib kembali.
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="bg-canvas text-xs font-bold uppercase tracking-wide text-ink-subtle">
                      <th className="px-4 py-3">ID Pinjam</th>
                      <th className="px-4 py-3">Peminjam</th>
                      <th className="px-4 py-3">Instansi / Divisi</th>
                      <th className="px-4 py-3">Item APD &amp; Jumlah</th>
                      <th className="px-4 py-3">Tgl Pinjam</th>
                      <th className="px-4 py-3">Status Pengembalian</th>
                      <th className="px-4 py-3 text-right">Bukti Foto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {peminjamanData.length === 0 ? <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-ink-subtle">
                          Belum ada transaksi peminjaman tercatat.
                        </td>
                      </tr> : [...peminjamanData].reverse().map((item, idx) => {
                  const idPinjam = item.ID || item['ID'] || `PJM-${idx}`;
                  const namaPeminjam = item.Nama || item['Nama'] || '-';
                  const instansi = item.Instansi || item['Instansi'] || item.Badge || item['Badge'] || '-';
                  const divisi = item.Divisi || item['Divisi'] || '-';
                  const jenisAPD = item['Jenis APD'] || item.JenisAPD || '-';
                  const jumlah = item.Jumlah || item['Jumlah'] || 1;
                  const tglPinjam = item.Tanggal || item['Tanggal'] || '-';
                  const statusKembali = item['Status Pengembalian'] || item.StatusPengembalian || 'Belum Dikembalikan';
                  const isReturned = statusKembali.toLowerCase().includes('sudah');
                  const fotoUrl = item['Foto Pengembalian'] || item['Bukti Foto'] || item.Foto || '';
                  return <tr key={idPinjam} className="hover:bg-canvas">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-safety-600">
                              {idPinjam}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-ink">{namaPeminjam}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-ink-muted">
                              <span className="font-semibold text-ink">{instansi}</span>
                              <span className="text-ink-subtle"> · {divisi}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-ink">{jenisAPD}</span>
                              <span className="ml-1.5 inline-block rounded bg-canvas px-1.5 py-0.5 text-xs font-bold text-ink">
                                {jumlah} Unit
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-ink-subtle">
                              {tglPinjam}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge tone={isReturned ? 'success' : 'warning'}>
                                {isReturned ? 'Sudah Kembali' : 'Belum Dikembalikan'}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {fotoUrl && fotoUrl.startsWith('http') ? <button type="button" onClick={() => setProof({
                        title: `${idPinjam} (${namaPeminjam})`,
                        thumb: fotoUrl,
                        caption: `Bukti pengembalian ${jenisAPD} oleh ${namaPeminjam} (${instansi} - ${divisi}) pada tanggal ${tglPinjam}.`
                      })} className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:border-safety-600 hover:text-safety-600">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  Lihat Bukti
                                </button> : <span className="text-xs text-slate-400">Belum Ada</span>}
                            </td>
                          </tr>;
                })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEKSI 6: TABEL RIWAYAT PERMINTAAN APD SEKALI PAKAI */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="border-b border-line pb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                  <ListOrderedIcon className="h-5 w-5 text-safety-600" />
                  Log Riwayat Permintaan APD Sekali Pakai
                </h3>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  Daftar distribusi APD habis pakai yang langsung diserahkan kepada pemohon.
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className="bg-canvas text-xs font-bold uppercase tracking-wide text-ink-subtle">
                      <th className="px-4 py-3">ID Permintaan</th>
                      <th className="px-4 py-3">Pemohon</th>
                      <th className="px-4 py-3">Divisi</th>
                      <th className="px-4 py-3">Rincian APD</th>
                      <th className="px-4 py-3">Total Jumlah</th>
                      <th className="px-4 py-3">Tanggal Pengajuan</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {consumableOrders.length === 0 ? <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-ink-subtle">
                          Belum ada data permintaan APD sekali pakai.
                        </td>
                      </tr> : [...consumableOrders].reverse().map((req, idx) => {
                  const idReq = req.ID || req['ID'] || `REQ-${idx}`;
                  const namaPemohon = req.Nama || req['Nama'] || '-';
                  const emailPemohon = req.Email || req.email || '-';
                  const divisi = req.Divisi || req['Divisi'] || '-';
                  const jenisAPD = req['Jenis APD'] || req.JenisAPD || '-';
                  const jumlah = req.Jumlah || req['Jumlah'] || 1;
                  const tglReq = req.Tanggal || req['Tanggal'] || '-';
                  return <tr key={idReq} className="hover:bg-canvas">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-safety-600">
                              {idReq}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-ink">{namaPemohon}</p>
                              {emailPemohon !== '-' && <p className="text-[11px] text-ink-subtle">{emailPemohon}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-ink-muted">
                              {divisi}
                            </td>
                            <td className="px-4 py-3 font-medium text-ink">
                              {jenisAPD}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block rounded bg-canvas px-2 py-0.5 text-xs font-bold text-ink">
                                {jumlah} Item
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-ink-subtle">
                              {tglReq}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge tone="success">
                                Diserahkan
                              </StatusBadge>
                            </td>
                          </tr>;
                })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>}
      </div>

      {/* MODAL EDIT STOK */}
      {isEditStockOpen && selectedStockItem && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold text-ink">Update Stok APD</h3>
              <button type="button" onClick={() => setIsEditStockOpen(false)} className="text-ink-subtle hover:text-ink">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-ink-subtle">Nama APD</p>
                <p className="text-sm font-bold text-ink">{selectedStockItem['Nama APD']}</p>
              </div>
              <div>
                <label htmlFor="input-stock" className="text-xs font-semibold text-ink-subtle">
                  Jumlah Stok Baru ({selectedStockItem.Satuan})
                </label>
                <input id="input-stock" type="number" min={0} value={newStockValue} onChange={(e) => setNewStockValue(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink focus:border-safety-600 focus:outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditStockOpen(false)} className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-canvas">
                Batal
              </button>
              <button type="button" disabled={updatingStock} onClick={handleSaveStock} className="inline-flex items-center gap-1.5 rounded-lg bg-safety-600 px-4 py-2 text-xs font-bold text-white hover:bg-safety-700 disabled:bg-slate-300">
                {updatingStock ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon className="h-3.5 w-3.5" />}
                {updatingStock ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>}

      <PhotoProofModal proof={proof} onClose={() => setProof(null)} />
    </section>;
}