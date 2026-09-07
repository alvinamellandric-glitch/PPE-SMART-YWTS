import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, MinusIcon, PlusIcon, SearchIcon, SendIcon, ShirtIcon, SprayCanIcon, AlertCircleIcon, ArrowRightIcon } from 'lucide-react';
import { consumableItems, departments, wearpackSizes } from '../../data/ppe';
import { Field, inputClasses } from '../ui/Field';
import { StatusBadge } from '../ui/StatusBadge';

const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";
const SECRET_TOKEN = "PPE-SMART-2026";
type RequestKind = 'sekali-pakai' | 'indent';
const TODAY = new Date().toISOString().split('T')[0];

const INDENT_APD_OPTIONS = [
'Wearpack Kerja',
'Helm Safety',
'Sepatu Safety (Low Cut)',
'Boots Safety (High Cut)',
'Kacamata Safety / Goggles'];


const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];
const GLASSES_TYPES = ['Clear Lens', 'Dark / Smoke', 'Chemical Splash Goggles'];

export function RequestSection() {
  const [kind, setKind] = useState<RequestKind>('sekali-pakai');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [consumableGlassesType, setConsumableGlassesType] = useState(GLASSES_TYPES[0]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Form Identitas
  const [tanggal, setTanggal] = useState(TODAY);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [divisi, setDivisi] = useState('');

  // Form Indent
  const [selectedIndentApd, setSelectedIndentApd] = useState(INDENT_APD_OPTIONS[0]);
  const [indentQty, setIndentQty] = useState(1);
  const [wearpackSize, setWearpackSize] = useState('L');
  const [shoeSize, setShoeSize] = useState('40');
  const [glassesType, setGlassesType] = useState(GLASSES_TYPES[0]);
  const [indentNote, setIndentNote] = useState('');

  // Live Master APD
  const [liveMasterApd, setLiveMasterApd] = useState<any[]>([]);

  // Tracking Panel
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  const fetchAllData = async () => {
    try {
      const res = await fetch(`${API_URL}?action=getData`);
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.permintaan)) {
          setAllRequests(data.permintaan);
          const lastIndent = [...data.permintaan].reverse().find((r: any) => {
            const apd = String(r['Jenis APD'] || '').toLowerCase();
            const reqKind = String(r['Jenis Permintaan'] || '').toLowerCase();
            return apd.includes('wearpack') || apd.includes('helm') || apd.includes('sepatu') || apd.includes('boots') || apd.includes('kacamata') || reqKind.includes('indent');
          });
          if (lastIndent && !searchTrackingId) {
            setTrackingResult(lastIndent);
            setSearchTrackingId(lastIndent.ID || lastIndent['ID']);
          }
        }
        if (Array.isArray(data.masterAPD)) {
          setLiveMasterApd(data.masterAPD);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  const getLiveStock = (itemLabel: string, fallbackStock: number) => {
    if (!liveMasterApd || liveMasterApd.length === 0) return fallbackStock;

    let searchTarget = itemLabel.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (searchTarget.includes('kacamata')) {
      if (consumableGlassesType.includes('Dark')) {
        searchTarget = 'darksmoke';
      } else if (consumableGlassesType.includes('Chemical')) {
        searchTarget = 'chemicalsplashgoggles';
      } else {
        searchTarget = 'clearlen';
      }
    }

    const found = liveMasterApd.find((m) => {
      const namaSheets = String(m['Nama APD'] || m.NamaAPD || m.nama || m['NAMA APD'] || '').
      toLowerCase().
      replace(/[^a-z0-9]/g, '');
      return namaSheets.includes(searchTarget) || searchTarget.includes(namaSheets);
    });

    if (found) {
      const s = found.Stok ?? found.stok ?? found.STOK ?? found['Jumlah'];
      if (s !== undefined && s !== null && s !== '') {
        return Number(s);
      }
    }
    return fallbackStock;
  };

  const setQty = (id: string, next: number, maxStock: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(maxStock, Math.max(0, next))
    }));
  };

  const handleGlassesTypeChange = (newType: string) => {
    setConsumableGlassesType(newType);
    setQuantities((prev) => ({
      ...prev,
      'kacamata-safety': 0
    }));
  };

  const handleSwitchToIndent = (itemTarget: string) => {
    setKind('indent');
    if (itemTarget.includes('kacamata')) {
      setSelectedIndentApd('Kacamata Safety / Goggles');
      setGlassesType(consumableGlassesType);
    } else if (itemTarget.includes('helm')) {
      setSelectedIndentApd('Helm Safety');
    } else if (itemTarget.includes('boots')) {
      setSelectedIndentApd('Boots Safety (High Cut)');
    } else if (itemTarget.includes('sepatu')) {
      setSelectedIndentApd('Sepatu Safety (Low Cut)');
    }
  };

  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allRequests.find((r) => String(r.ID || r['ID']).toLowerCase() === searchTrackingId.trim().toLowerCase());
    setTrackingResult(found || null);
  };

  const totalConsumables = Object.values(quantities).reduce((a, b) => a + b, 0);
  const canSubmit = nama.trim() !== '' && email.trim() !== '' && divisi !== '' && !loading && (kind === 'indent' ? indentQty > 0 : totalConsumables > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    let jenisAPD = '';
    let ukuran = '-';
    let jumlah = 0;
    let warnaTipe = '-';
    let catatan = '-';

    if (kind === 'sekali-pakai') {
      const activeItems = Object.entries(quantities).filter(([_, qty]) => qty > 0).map(([id, qty]) => {
        const item = consumableItems.find((i) => i.id === id);
        if (id === 'kacamata-safety') {
          return `${item?.label || id} (${consumableGlassesType}): ${qty} ${item?.unit || 'pcs'}`;
        }
        return `${item?.label || id}: ${qty} ${item?.unit || 'pcs'}`;
      });
      jenisAPD = activeItems.join('; ');
      jumlah = totalConsumables;
      if (quantities['kacamata-safety'] && quantities['kacamata-safety'] > 0) {
        warnaTipe = consumableGlassesType;
      }
    } else {
      jenisAPD = selectedIndentApd;
      jumlah = indentQty;
      catatan = indentNote || '-';

      if (selectedIndentApd === 'Wearpack Kerja') {
        ukuran = wearpackSize;
        warnaTipe = 'Merah';
      } else if (selectedIndentApd === 'Sepatu Safety (Low Cut)') {
        ukuran = shoeSize;
        warnaTipe = 'Low Cut';
      } else if (selectedIndentApd === 'Boots Safety (High Cut)') {
        ukuran = shoeSize;
        warnaTipe = 'High Cut';
      } else if (selectedIndentApd === 'Helm Safety') {
        ukuran = 'All Size';
        warnaTipe = 'Putih Standar K3';
      } else if (selectedIndentApd === 'Kacamata Safety / Goggles') {
        ukuran = 'All Size';
        warnaTipe = glassesType;
      }
    }

    const payload = {
      token: SECRET_TOKEN,
      action: 'permintaan',
      tanggal: tanggal,
      nama: nama,
      email: email,
      divisi: divisi,
      jenisPermintaan: kind === 'sekali-pakai' ? 'APD Sekali Pakai' : 'APD Perlu Waktu / Indent',
      jenisAPD: jenisAPD,
      ukuran: ukuran,
      jumlah: jumlah,
      warnaTipe: warnaTipe,
      catatan: catatan
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const newId = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedId(newId);
      setSubmitted(true);
      setTimeout(() => fetchAllData(), 1500);
    } catch (error) {
      alert('Gagal mengirim data permintaan. Pastikan koneksi stabil.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = (() => {
    if (!trackingResult) return 1;
    const st = String(trackingResult['Status Tracking'] || trackingResult.StatusTracking || '').toLowerCase();
    if (st.includes('siap') || st.includes('selesai') || st.includes('logistik')) return 3;
    if (st.includes('vendor') || st.includes('proses')) return 2;
    return 1;
  })();

  return (
    <section id="portal-permintaan" aria-labelledby="permintaan-heading" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wide text-safety-600">Portal 02</p>
        <h2 id="permintaan-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Portal Permintaan APD (Habis Pakai &amp; Pengadaan Indent)
        </h2>
        <p className="mt-2 text-ink-muted">
          Pengambilan APD sekali pakai langsung di gudang serta formulir pengadaan khusus (Wearpack, Helm, Sepatu, Boots, Kacamata) saat persediaan unit habis.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-10">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          {submitted ?
          <div className="rounded-xl border border-ok-100 bg-ok-50 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ok-600 text-white">
                <CheckCircle2Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Permintaan Berhasil Dicatat!</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                Registrasi ID: <strong className="font-mono text-safety-600">{generatedId}</strong>. Notifikasi email otomatis akan dikirim ke alamat Anda saat unit siap diserahkan.
              </p>
              <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setQuantities({});
                setNama('');
                setEmail('');
                setDivisi('');
                setIndentNote('');
                fetchAllData();
              }}
              className="mt-5 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-canvas">
              
                Ajukan Permintaan Lain
              </button>
            </div> :

          <form className="space-y-7" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Tanggal Permintaan" htmlFor="req-tanggal" required>
                  <input id="req-tanggal" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputClasses} required />
                </Field>
                <Field label="Nama Pemohon" htmlFor="req-nama" required>
                  <input id="req-nama" type="text" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} className={inputClasses} required />
                </Field>
                <Field label="Email Pemohon" htmlFor="req-email" required hint="Untuk notifikasi logistik">
                  <input id="req-email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
                </Field>
                <Field label="Divisi" htmlFor="req-divisi" required>
                  <select id="req-divisi" className={inputClasses} value={divisi} onChange={(e) => setDivisi(e.target.value)} required>
                    <option value="" disabled>Pilih divisi</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink-soft">Jenis Permintaan</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                {
                  id: 'sekali-pakai' as const,
                  title: 'APD Sekali Pakai',
                  subtitle: 'Habis pakai · ambil langsung di gudang',
                  icon: SprayCanIcon
                },
                {
                  id: 'indent' as const,
                  title: 'APD Perlu Waktu / Indent',
                  subtitle: 'Pengadaan khusus saat persediaan habis',
                  icon: ShirtIcon
                }].
                map(({ id, title, subtitle, icon: Icon }) =>
                <button
                  key={id}
                  type="button"
                  onClick={() => setKind(id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  kind === id ? 'border-safety-600 bg-safety-50/60' : 'border-line bg-white hover:bg-canvas'}`
                  }>
                  
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${kind === id ? 'bg-safety-600 text-white' : 'bg-canvas text-ink-muted'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-ink">{title}</span>
                        <span className="mt-0.5 block text-xs text-ink-subtle">{subtitle}</span>
                      </span>
                    </button>
                )}
                </div>
              </div>

              {kind === 'sekali-pakai' ?
            <fieldset>
                  <legend className="text-sm font-semibold text-ink-soft">Item Habis Pakai</legend>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    Ketersediaan unit fisik terkoneksi real-time dengan Master APD Google Sheets.
                  </p>

                  <div className="mt-3 space-y-3">
                    {consumableItems.map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  const availableStock = getLiveStock(item.label, item.stock);
                  const isOutOfStock = availableStock <= 0;

                  return (
                    <div key={item.id} className="rounded-xl border border-line bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-ink">{item.label}</p>
                              <p className="mt-0.5 text-xs text-ink-subtle">{item.description} · Satuan: {item.unit}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <StatusBadge tone={availableStock > 20 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                                {availableStock > 0 ? `Stok: ${availableStock}` : 'Stok Habis'}
                              </StatusBadge>

                              <div className="flex items-center rounded-lg border border-line">
                                <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => setQty(item.id, qty - 1, availableStock)}
                              className="grid h-9 w-9 place-items-center rounded-l-lg text-ink-muted hover:bg-canvas disabled:opacity-30">
                              
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold tabular-nums text-ink">
                                  {qty}
                                </span>
                                <button
                              type="button"
                              disabled={isOutOfStock || qty >= availableStock}
                              onClick={() => setQty(item.id, qty + 1, availableStock)}
                              className="grid h-9 w-9 place-items-center rounded-r-lg text-ink-muted hover:bg-canvas disabled:opacity-30">
                              
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {item.hasSubtype &&
                      <div className="mt-3 border-t border-line/60 pt-3">
                              <label htmlFor="glasses-subtype-select" className="text-xs font-semibold text-ink-soft">
                                Tipe Lensa Kacamata:
                              </label>
                              <select
                          id="glasses-subtype-select"
                          value={consumableGlassesType}
                          onChange={(e) => handleGlassesTypeChange(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-bold text-ink focus:border-safety-600 focus:outline-none">
                          
                                {GLASSES_TYPES.map((g) =>
                          <option key={g} value={g}>{g}</option>
                          )}
                              </select>
                            </div>
                      }

                          {isOutOfStock && item.canIndentIfEmpty &&
                      <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                              <span>Stok tipe ini sedang kosong di gudang. Ajukan restock unit logistik.</span>
                              <button
                          type="button"
                          onClick={() => handleSwitchToIndent(item.id)}
                          className="inline-flex items-center gap-1 font-bold text-safety-600 hover:underline">
                          
                                Isi Form Indent <ArrowRightIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                      }
                        </div>);

                })}
                  </div>
                </fieldset> :

            <fieldset className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Alur Pengadaan / Indent:</strong> Formulir ini memproses pemesanan APD lapangan (Wearpack, Helm, Sepatu, Boots, Kacamata) saat persediaan fisik di gudang kosong. Status dapat dilacak real-time.
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pilih APD yang Diminta" htmlFor="indent-apd-type" required>
                      <select id="indent-apd-type" className={inputClasses} value={selectedIndentApd} onChange={(e) => setSelectedIndentApd(e.target.value)}>
                        {INDENT_APD_OPTIONS.map((opt) =>
                    <option key={opt} value={opt}>{opt}</option>
                    )}
                      </select>
                    </Field>

                    <Field label="Jumlah Unit" htmlFor="indent-qty" required>
                      <input id="indent-qty" type="number" min={1} value={indentQty} onChange={(e) => setIndentQty(Math.max(1, Number(e.target.value) || 1))} className={inputClasses} />
                    </Field>
                  </div>

                  {selectedIndentApd === 'Wearpack Kerja' &&
              <div>
                      <Field label="Ukuran Baju" htmlFor="wearpack-size" required>
                        <select id="wearpack-size" className={inputClasses} value={wearpackSize} onChange={(e) => setWearpackSize(e.target.value)}>
                          {wearpackSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
              }

                  {(selectedIndentApd === 'Sepatu Safety (Low Cut)' || selectedIndentApd === 'Boots Safety (High Cut)') &&
              <div>
                      <Field label="Ukuran Sepatu / Boots (EU)" htmlFor="shoe-size" required>
                        <select id="shoe-size" className={inputClasses} value={shoeSize} onChange={(e) => setShoeSize(e.target.value)}>
                          {SHOE_SIZES.map((s) => <option key={s} value={s}>Ukuran {s}</option>)}
                        </select>
                      </Field>
                    </div>
              }

                  {selectedIndentApd === 'Helm Safety' &&
              <div className="rounded-xl border border-line bg-canvas p-3.5 text-xs text-ink-muted">
                      Warna standar helm kerja yang dialokasikan: <strong>Putih Standar K3</strong>.
                    </div>
              }

                  {selectedIndentApd === 'Kacamata Safety / Goggles' &&
              <div>
                      <Field label="Tipe Lensa Kacamata" htmlFor="glasses-type" required>
                        <select id="glasses-type" className={inputClasses} value={glassesType} onChange={(e) => setGlassesType(e.target.value)}>
                          {GLASSES_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </Field>
                    </div>
              }

                  <Field label="Catatan Tambahan (Opsional)" htmlFor="indent-note" hint="Tuliskan catatan kebutuhan bila ada">
                    <textarea id="indent-note" rows={2} placeholder="Tuliskan catatan kebutuhan bila ada" value={indentNote} onChange={(e) => setIndentNote(e.target.value)} className={inputClasses} />
                  </Field>
                </fieldset>
            }

              <div className="flex flex-wrap items-center gap-4">
                <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-safety-600 px-6 py-3.5 text-sm font-bold text-white shadow-card hover:bg-safety-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                
                  {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                  {loading ? 'Menyimpan...' : 'Kirim Formulir Permintaan'}
                </button>
              </div>
            </form>
          }
        </div>

        {/* BILAH KANAN: PELACAK STATUS APD INDENT */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink-subtle">
              Pelacak Status Pesanan Logistik
            </h3>
            
            <form onSubmit={handleSearchTracking} className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Ketik ID (REQ-...)"
                  value={searchTrackingId}
                  onChange={(e) => setSearchTrackingId(e.target.value)}
                  className="w-full rounded-lg border border-line py-1.5 pl-8 pr-3 text-xs font-semibold text-ink focus:border-safety-600 focus:outline-none" />
                
              </div>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#B91C1C" }}>
                
                Cari
              </button>
            </form>

            {trackingResult ?
            <div className="mt-4">
                <p className="text-xs font-bold text-ink">
                  {trackingResult.ID || trackingResult['ID']} · {trackingResult.Nama || trackingResult['Nama']}
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  <span className="font-semibold text-ink">{trackingResult['Jenis APD'] || 'APD'}</span> · {trackingResult.Jumlah || 1} unit · {trackingResult.Ukuran ? `Ukuran: ${trackingResult.Ukuran}` : ''} {trackingResult['Warna/Tipe'] ? `(${trackingResult['Warna/Tipe']})` : ''}
                </p>

                <ol className="mt-6 space-y-6">
                  {/* Step 1 */}
                  <li className="relative flex items-start gap-4">
                    <span className={`absolute left-[15px] top-8 h-full w-0.5 ${currentStep > 1 ? 'bg-ok-600' : 'bg-line'}`} />
                    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${currentStep >= 1 ? 'bg-ok-600 text-white' : 'border border-line bg-white text-ink-subtle'}`}>
                      <CheckCircle2Icon className="h-4 w-4" />
                    </span>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">Diajukan</span>
                        {currentStep === 1 && <StatusBadge tone="warning">Antrean Logistik</StatusBadge>}
                        {currentStep > 1 && <StatusBadge tone="success">Selesai</StatusBadge>}
                      </div>
                      <p className="mt-1 text-xs text-ink-subtle">Permohonan telah tercatat di antrean logistik K3.</p>
                    </div>
                  </li>

                  {/* Step 2 */}
                  <li className="relative flex items-start gap-4">
                    <span className={`absolute left-[15px] top-8 h-full w-0.5 ${currentStep > 2 ? 'bg-ok-600' : 'bg-line'}`} />
                    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${currentStep > 2 ? 'bg-ok-600 text-white' : currentStep === 2 ? 'bg-amber-500 text-white' : 'border border-line bg-white text-ink-subtle'}`}>
                      {currentStep > 2 ? <CheckCircle2Icon className="h-4 w-4" /> : '2'}
                    </span>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">Proses Vendor / Pengadaan</span>
                        {currentStep === 2 && <StatusBadge tone="warning">Dalam Proses</StatusBadge>}
                        {currentStep > 2 && <StatusBadge tone="success">Selesai</StatusBadge>}
                      </div>
                      <p className="mt-1 text-xs text-ink-subtle">Pesanan sedang diproses bersama pihak logistik &amp; vendor.</p>
                    </div>
                  </li>

                  {/* Step 3 */}
                  <li className="relative flex items-start gap-4">
                    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${currentStep === 3 ? 'bg-ok-600 text-white' : 'border border-line bg-white text-ink-subtle'}`}>
                      {currentStep === 3 ? <CheckCircle2Icon className="h-4 w-4" /> : '3'}
                    </span>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">Siap Diambil di Logistik</span>
                        {currentStep === 3 && <StatusBadge tone="success">Siap Diambil</StatusBadge>}
                      </div>
                      <p className="mt-1 text-xs text-ink-subtle">Barang telah diverifikasi dan siap diambil di gudang K3.</p>
                    </div>
                  </li>
                </ol>
              </div> :

            <p className="mt-4 rounded-xl border border-dashed border-line bg-canvas px-4 py-6 text-center text-xs text-ink-subtle">
                Masukkan ID permintaan (REQ-...) untuk melacak status pesanan logistik Anda.
              </p>
            }
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-5 text-sm leading-relaxed text-ink-muted">
            <p className="font-bold text-ink">Prosedur Pengambilan</p>
            <p className="mt-1.5 text-xs">
              Setelah status berubah menjadi &quot;Siap Diambil di Logistik&quot;, sistem akan mengirim email konfirmasi. Tunjukkan nomor ID REQ Anda kepada staf gudang saat serah terima.
            </p>
          </div>
        </aside>
      </div>
    </section>);

}