import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2Icon, ShieldAlertIcon, Loader2Icon, ArrowRightIcon } from 'lucide-react';
import { borrowableItems, departments } from '../../data/ppe';
import { Field, inputClasses } from '../ui/Field';
import { StatusBadge } from '../ui/StatusBadge';

const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";
const SECRET_TOKEN = "PPE-SMART-2026";

interface Selection {
  qty: number;
  size?: string;
}

const TODAY = new Date().toISOString().split('T')[0];
const FOOTWEAR_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];
const DEFAULT_INSTANSI = ['YWTS', 'Dani', 'CWS'];

export function BorrowForm() {
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // State Input Form
  const [tanggal, setTanggal] = useState(TODAY);
  const [nama, setNama] = useState('');
  const [instansi, setInstansi] = useState('YWTS');
  const [instansiCustom, setInstansiCustom] = useState('');
  const [divisi, setDivisi] = useState('');
  const [tanggalPengembalian, setTanggalPengembalian] = useState(
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // State Live Data dari Sheets
  const [liveMasterApd, setLiveMasterApd] = useState<any[]>([]);
  const [instansiList, setInstansiList] = useState<string[]>(DEFAULT_INSTANSI);

  const fetchLiveData = async () => {
    try {
      const res = await fetch(`${API_URL}?action=getData`);
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.masterAPD)) {
          setLiveMasterApd(data.masterAPD);
        }
        // Ekstrak nama instansi unik dari riwayat peminjaman di Sheets
        if (Array.isArray(data.peminjaman)) {
          const recorded = data.peminjaman.
          map((p: any) => String(p.Instansi || p['Instansi'] || '').trim()).
          filter((val: string) => val !== '' && val !== '-');

          const combined = Array.from(new Set([...DEFAULT_INSTANSI, ...recorded]));
          setInstansiList(combined);
        }
      }
    } catch (err) {
      console.error('Gagal memuat data live dari Sheets:', err);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const getLiveStock = (itemName: string, fallbackStock: number) => {
    if (!liveMasterApd || liveMasterApd.length === 0) return fallbackStock;

    const cleanLabel = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = liveMasterApd.find((m) => {
      const namaSheets = String(m['Nama APD'] || m.NamaAPD || m.nama || m['NAMA APD'] || '').
      toLowerCase().
      replace(/[^a-z0-9]/g, '');
      return namaSheets.includes(cleanLabel) || cleanLabel.includes(namaSheets);
    });

    if (found) {
      const s = found.Stok ?? found.stok ?? found.STOK ?? found['Jumlah'];
      if (s !== undefined && s !== null && s !== '') {
        return Number(s);
      }
    }
    return fallbackStock;
  };

  const selectedIds = useMemo(() => Object.keys(selections), [selections]);

  const finalInstansi = instansi === 'Lainnya' ? instansiCustom.trim() : instansi;
  const canSubmit =
  selectedIds.length > 0 &&
  accepted &&
  nama.trim() !== '' &&
  finalInstansi !== '' &&
  divisi !== '' &&
  !loading;

  const toggle = (id: string, defaultSize?: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          qty: 1,
          size: defaultSize
        };
      }
      return next;
    });
  };

  const update = (id: string, patch: Partial<Selection>) => {
    setSelections((prev) =>
    prev[id] ?
    {
      ...prev,
      [id]: {
        ...prev[id],
        ...patch
      }
    } :
    prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    const itemsSummary = selectedIds.
    map((id) => {
      const item = borrowableItems.find((i) => i.id === id);
      const sel = selections[id];
      const sizeText = sel.size ? ` (Ukuran ${sel.size})` : '';
      return `${item?.name || id}${sizeText}: ${sel.qty} ${item?.unit || 'unit'}`;
    }).
    join('; ');

    const totalQty = selectedIds.reduce((sum, id) => sum + (selections[id]?.qty || 1), 0);

    const payload = {
      token: SECRET_TOKEN,
      action: 'peminjaman',
      tanggal: tanggal,
      nama: nama,
      instansi: finalInstansi,
      divisi: divisi,
      jenisAPD: itemsSummary,
      jumlah: totalQty,
      tanggalPengembalian: tanggalPengembalian,
      statusPengembalian: 'Belum Dikembalikan'
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
      setGeneratedId(`PJM-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubmitted(true);
      fetchLiveData();
    } catch (error) {
      console.error('Error saat menyimpan:', error);
      alert('Gagal mengirim data. Pastikan koneksi internet stabil.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-ok-100 bg-ok-50 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ok-600 text-white">
          <CheckCircle2Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Peminjaman Berhasil Dicatat!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Nomor Registrasi: <strong className="font-mono text-safety-600">{generatedId}</strong>. Mohon kembalikan APD sebelum pukul 16.00 WIB pada{' '}
          <span className="font-semibold text-ink">{tanggalPengembalian}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSelections({});
            setAccepted(false);
            setNama('');
            setInstansi('YWTS');
            setInstansiCustom('');
            setDivisi('');
            fetchLiveData();
          }}
          className="mt-5 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition-colors duration-150 ease-smooth hover:bg-canvas">
          
          Catat Peminjaman Lain
        </button>
      </div>);

  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tanggal Peminjaman" htmlFor="pinjam-tanggal" hint="Terisi otomatis hari ini" required>
          <input
            id="pinjam-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputClasses}
            required />
          
        </Field>
        <Field label="Nama Peminjam" htmlFor="pinjam-nama" required>
          <input
            id="pinjam-nama"
            type="text"
            placeholder="Nama lengkap peminjam"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={inputClasses}
            required />
          
        </Field>

        <div className="space-y-2">
          <Field label="Instansi" htmlFor="pinjam-instansi" required>
            <select
              id="pinjam-instansi"
              value={instansi}
              onChange={(e) => {
                setInstansi(e.target.value);
                if (e.target.value !== 'Lainnya') setInstansiCustom('');
              }}
              className={inputClasses}
              required>
              
              {instansiList.map((item) =>
              <option key={item} value={item}>{item}</option>
              )}
              <option value="Lainnya">+ Lainnya (Ketik Sendiri)</option>
            </select>
          </Field>

          {instansi === 'Lainnya' &&
          <Field label="Nama Instansi Baru" htmlFor="pinjam-instansi-custom" required>
              <input
              id="pinjam-instansi-custom"
              type="text"
              placeholder="Ketik nama instansi / perusahaan"
              value={instansiCustom}
              onChange={(e) => setInstansiCustom(e.target.value)}
              className={inputClasses}
              required
              autoFocus />
            
            </Field>
          }
        </div>

        <Field label="Departemen / Divisi" htmlFor="pinjam-dept" required>
          <select
            id="pinjam-dept"
            className={inputClasses}
            value={divisi}
            onChange={(e) => setDivisi(e.target.value)}
            required>
            
            <option value="" disabled>Pilih departemen</option>
            {departments.map((d) =>
            <option key={d} value={d}>{d}</option>
            )}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink-soft">
          Pilih APD Wajib Kembali <span className="text-safety-600">*</span>
        </legend>
        <p className="mt-1 text-xs text-ink-subtle">
          Ketersediaan fisik terhubung langsung dengan Google Sheets logistik K3.
        </p>

        <div className="mt-3 space-y-3">
          {borrowableItems.map((item) => {
            const selection = selections[item.id];
            const active = Boolean(selection);
            const availableStock = getLiveStock(item.name, item.availableStock);
            const isOutOfStock = availableStock <= 0;
            const isFootwear = item.id.includes('sepatu') || item.id.includes('boots');

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-colors duration-150 ease-smooth ${
                active ? 'border-safety-600 bg-safety-50/50' : 'border-line bg-white'}`
                }>
                
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="flex flex-1 cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={isOutOfStock}
                      onChange={() => toggle(item.id, isFootwear ? FOOTWEAR_SIZES[4] : undefined)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-safety-600 focus:ring-safety-100 disabled:opacity-40" />
                    
                    <span>
                      <span className="block text-sm font-bold text-ink">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-ink-subtle">{item.description}</span>
                    </span>
                  </label>
                  <StatusBadge tone={availableStock > 5 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                    {availableStock > 0 ? `Tersedia: ${availableStock} ${item.unit}` : 'Stok Habis'}
                  </StatusBadge>
                </div>

                {active &&
                <div className="mt-4 grid gap-3 border-t border-safety-100 pt-4 sm:grid-cols-2">
                    {isFootwear &&
                  <Field label="Ukuran Sepatu / Boots (EU)" htmlFor={`size-${item.id}`}>
                        <select
                      id={`size-${item.id}`}
                      value={selection?.size ?? FOOTWEAR_SIZES[4]}
                      onChange={(e) => update(item.id, { size: e.target.value })}
                      className={inputClasses}>
                      
                          {FOOTWEAR_SIZES.map((s) =>
                      <option key={s} value={s}>Ukuran {s}</option>
                      )}
                        </select>
                      </Field>
                  }
                    <Field label={`Jumlah (${item.unit})`} htmlFor={`qty-${item.id}`}>
                      <input
                      id={`qty-${item.id}`}
                      type="number"
                      min={1}
                      max={availableStock}
                      value={selection?.qty ?? 1}
                      onChange={(e) =>
                      update(item.id, {
                        qty: Math.min(availableStock, Math.max(1, Number(e.target.value) || 1))
                      })
                      }
                      className={inputClasses} />
                    
                    </Field>
                  </div>
                }

                {isOutOfStock && item.canIndentIfEmpty &&
                <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                    <span>Persediaan unit di gudang sedang kosong.</span>
                    <a
                    href="#portal-permintaan"
                    className="inline-flex items-center gap-1 font-bold text-safety-600 hover:underline">
                    
                      Ajukan Form Indent <ArrowRightIcon className="h-3.5 w-3.5" />
                    </a>
                  </div>
                }
              </div>);

          })}
        </div>
      </fieldset>

      <Field
        label="Rencana Tanggal Pengembalian"
        htmlFor="pinjam-kembali"
        hint="Maksimal 1 hari kerja sejak tanggal peminjaman (sebelum 16.00 WIB)"
        required
        className="sm:max-w-xs">
        
        <input
          id="pinjam-kembali"
          type="date"
          value={tanggalPengembalian}
          onChange={(e) => setTanggalPengembalian(e.target.value)}
          className={inputClasses}
          required />
        
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-safety-600 focus:ring-safety-100" />
        
        <span className="text-sm text-ink-soft">
          Saya bertanggung jawab menjaga kondisi APD selama bertugas, dan melaporkan kerusakan segera ke
          Safety Officer.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-safety-600 px-6 py-3.5 text-sm font-bold text-white shadow-card transition-colors duration-150 ease-smooth hover:bg-safety-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">
          
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan ke Sheets...' : 'Konfirmasi & Ambil APD'}
        </button>
        {!canSubmit && !loading &&
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-subtle">
            <ShieldAlertIcon className="h-3.5 w-3.5 text-warn-600" aria-hidden="true" />
            Lengkapi form, pilih minimal satu APD, dan centang persetujuan.
          </p>
        }
      </div>
    </form>);

}