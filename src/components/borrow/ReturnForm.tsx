import React, { useEffect, useState } from 'react';
import { CameraIcon, CheckCircle2Icon, ImageIcon, Loader2Icon, RefreshCwIcon, SearchIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { Field, inputClasses } from '../ui/Field';
import { StatusBadge } from '../ui/StatusBadge';
import type { ActiveLoan } from '../../types/ppe';
const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";
const SECRET_TOKEN = "PPE-SMART-2026";
const IMGBB_API_KEY = "eb166472536c15b59d7a2f606ebbdda0";
type Condition = 'baik' | 'rusak';
export function ReturnForm() {
  const [query, setQuery] = useState('');
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const [checked, setChecked] = useState<Record<string, Condition>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [liveLoans, setLiveLoans] = useState<ActiveLoan[]>([]);
  const fetchActiveLoans = async () => {
    setFetchingData(true);
    try {
      const response = await fetch(`${API_URL}?action=getData`);
      const resData = await response.json();
      if (resData.success && Array.isArray(resData.peminjaman)) {
        const formatted: ActiveLoan[] = resData.peminjaman.filter((row: any) => {
          const status = String(row.StatusPengembalian || row['Status Pengembalian'] || '');
          return status.toLowerCase().includes('belum');
        }).map((row: any) => {
          const id = String(row.ID || row['ID'] || '-');
          const name = String(row.Nama || row['Nama'] || '-');
          const badge = String(row.Instansi || row['Instansi'] || row.Badge || row['Badge'] || '-');
          const department = String(row.Divisi || row['Divisi'] || '-');
          const rawItems = String(row.JenisAPD || row['Jenis APD'] || '');
          const items = rawItems && rawItems !== 'undefined' ? rawItems.split(';').map((s: string) => s.trim()).filter(Boolean) : ['APD'];
          const dueAt = String(row.TanggalPengembalian || row['Tanggal Pengembalian'] || '-');
          const borrowedAt = String(row.Tanggal || row['Tanggal'] || '-');
          return {
            id,
            name,
            badge,
            department,
            items,
            borrowedAt,
            dueAt,
            overdue: false
          };
        });
        setLiveLoans(formatted);
      }
    } catch (err) {
      console.error('Gagal mengambil data live dari sheets:', err);
    } finally {
      setFetchingData(false);
    }
  };
  useEffect(() => {
    fetchActiveLoans();
  }, []);
  const matches = query.trim() ? liveLoans.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.id.toLowerCase().includes(query.toLowerCase()) || l.badge.toLowerCase().includes(query.toLowerCase())) : liveLoans;
  const canSubmit = Boolean(loan) && Object.keys(checked).length > 0 && Boolean(selectedFile) && !loading;
  const pick = (selected: ActiveLoan) => {
    setLoan(selected);
    setChecked({});
    setQuery(`${selected.id} — ${selected.name}`);
  };
  const toggleItem = (item: string) => {
    setChecked((prev) => {
      const next = {
        ...prev
      };
      if (next[item]) delete next[item];else next[item] = 'baik';
      return next;
    });
  };
  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
  };
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      throw new Error('Gagal mengupload ke ImgBB');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !loan || !selectedFile) return;
    setLoading(true);
    try {
      // 1. Upload ke ImgBB terlebih dahulu untuk mendapatkan URL publik
      const uploadedImageUrl = await uploadToImgBB(selectedFile);

      // 2. Simpan tautan URL teks ke Google Sheets
      const payload = {
        token: SECRET_TOKEN,
        action: 'pengembalian',
        id: loan.id,
        fotoUrl: uploadedImageUrl
      };
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
      fetchActiveLoans();
    } catch (error) {
      console.error('Gagal mengirim data pengembalian:', error);
      alert('Gagal memproses pengembalian. Pastikan gambar tidak rusak dan internet stabil.');
    } finally {
      setLoading(false);
    }
  };
  if (submitted) {
    return <div className="rounded-2xl border border-ok-100 bg-ok-50 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ok-600 text-white">
          <CheckCircle2Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Pengembalian Selesai!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Peminjaman <span className="font-bold text-ink">{loan?.id}</span> telah dikembalikan. Bukti foto berhasil tersimpan di sistem.
        </p>
        <button type="button" onClick={() => {
        setSubmitted(false);
        setLoan(null);
        setChecked({});
        setFileName(null);
        setSelectedFile(null);
        setQuery('');
      }} className="mt-5 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition-colors duration-150 ease-smooth hover:bg-canvas">
          Proses Pengembalian Lain
        </button>
      </div>;
  }
  return <form className="space-y-7" onSubmit={handleSubmit}>
      <Field label="Cari Nama Peminjam / ID Peminjaman" htmlFor="return-search" hint="Cari dengan nama, ID peminjaman (PJM-xxxx), atau instansi" required>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input id="return-search" type="search" value={query} onChange={(e) => {
          setQuery(e.target.value);
          setLoan(null);
        }} placeholder="Ketik ID (misal: PJM-260902) atau Nama..." className={`${inputClasses} pl-9`} />
        </div>
      </Field>

      {!loan && <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
              Peminjaman aktif live ({matches.length})
            </p>
            <button type="button" onClick={fetchActiveLoans} className="inline-flex items-center gap-1 text-xs font-semibold text-safety-600 hover:text-safety-700">
              <RefreshCwIcon className={`h-3 w-3 ${fetchingData ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
          <ul className="divide-y divide-line">
            {fetchingData && <li className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-ink-subtle">
                <Loader2Icon className="h-4 w-4 animate-spin text-safety-600" />
                Memuat data dari Google Sheets...
              </li>}
            {!fetchingData && matches.map((item) => <li key={item.id}>
                  <button type="button" onClick={() => pick(item)} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-canvas">
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {item.name} · {item.id}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-subtle">
                        {item.badge} · {item.department} · {item.items.join(', ')}
                      </span>
                    </span>
                    <StatusBadge tone="warning">Tempo {item.dueAt}</StatusBadge>
                  </button>
                </li>)}
            {!fetchingData && matches.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-subtle">
                Tidak ada peminjaman aktif yang cocok di database.
              </li>}
          </ul>
        </div>}

      {loan && <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">
                {loan.name} · {loan.id}
              </p>
              <p className="mt-0.5 text-xs text-ink-subtle">
                {loan.badge} · {loan.department} · dipinjam {loan.borrowedAt} · tempo {loan.dueAt}
              </p>
            </div>
            <button type="button" onClick={() => {
          setLoan(null);
          setQuery('');
          setChecked({});
        }} className="inline-flex items-center gap-1.5 text-xs font-bold text-safety-600 transition-colors duration-150 ease-smooth hover:text-safety-700">
              <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Ganti peminjaman
            </button>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink-soft">
              Checklist APD yang dikembalikan <span className="text-safety-600">*</span>
            </legend>
            <div className="mt-3 space-y-3">
              {loan.items.map((item) => {
            const condition = checked[item];
            return <div key={item} className={`rounded-xl border p-4 transition-colors duration-150 ease-smooth ${condition ? 'border-safety-600 bg-safety-50/50' : 'border-line bg-white'}`}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={Boolean(condition)} onChange={() => toggleItem(item)} className="h-4 w-4 rounded border-slate-300 text-safety-600 focus:ring-safety-100" />
                      <span className="text-sm font-bold text-ink">{item}</span>
                    </label>

                    {condition && <div className="mt-3 flex flex-wrap gap-2 border-t border-safety-100 pt-3">
                        {([{
                  value: 'baik',
                  label: 'Baik / Layak'
                }, {
                  value: 'rusak',
                  label: 'Rusak / Perlu Servis'
                }] as const).map((option) => <label key={option.value} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ease-smooth ${condition === option.value ? option.value === 'baik' ? 'border-ok-600 bg-ok-50 text-ok-700' : 'border-safety-600 bg-safety-50 text-safety-700' : 'border-line bg-white text-ink-muted hover:bg-canvas'}`}>
                            <input type="radio" name={`kondisi-${item}`} checked={condition === option.value} onChange={() => setChecked((prev) => ({
                    ...prev,
                    [item]: option.value
                  }))} className="h-3.5 w-3.5 border-slate-300 text-safety-600 focus:ring-safety-100" />
                            {option.label}
                          </label>)}
                      </div>}
                  </div>;
          })}
            </div>
          </fieldset>
        </>}

      <div>
        <p className="text-sm font-semibold text-ink-soft">
          Unggah Foto Bukti Fisik APD Dikembalikan di Rak <span className="text-safety-600">*</span>
        </p>
        <label onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }} onDragLeave={() => setDragging(false)} onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFileChange(file);
      }} className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ease-smooth ${dragging ? 'border-safety-600 bg-safety-50' : fileName ? 'border-ok-600 bg-ok-50' : 'border-line bg-canvas hover:border-slate-300'}`}>
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => handleFileChange(e.target.files?.[0])} />
          <div className={`grid h-12 w-12 place-items-center rounded-xl ${fileName ? 'bg-ok-600 text-white' : 'bg-white text-safety-600 ring-1 ring-line'}`}>
            {fileName ? <ImageIcon className="h-5 w-5" aria-hidden="true" /> : <CameraIcon className="h-5 w-5" aria-hidden="true" />}
          </div>
          {fileName ? <>
              <p className="mt-3 text-sm font-bold text-ink">{fileName}</p>
              <p className="mt-1 text-xs text-ok-700">Foto siap diunggah</p>
            </> : <>
              <p className="mt-3 text-sm font-bold text-ink">
                Tarik &amp; lepas foto di sini, atau klik untuk ambil foto
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-subtle">
                <UploadCloudIcon className="h-3.5 w-3.5" aria-hidden="true" />
                JPG / PNG · Tersimpan aman
              </p>
            </>}
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-2 rounded-lg bg-safety-600 px-6 py-3.5 text-sm font-bold text-white shadow-card transition-colors duration-150 ease-smooth hover:bg-safety-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {loading ? 'Mengunggah foto & memproses...' : 'Selesaikan Pengembalian'}
        </button>
        {!canSubmit && !loading && <p className="text-xs font-semibold text-ink-subtle">
            Pilih peminjaman, centang APD beserta kondisinya, dan unggah foto bukti.
          </p>}
      </div>
    </form>;
}