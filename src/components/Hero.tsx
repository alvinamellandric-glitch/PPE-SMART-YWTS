import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, ClipboardListIcon, ShieldCheckIcon } from 'lucide-react';
import { heroImage } from '../data/ppe';

const API_URL = "https://script.google.com/macros/s/AKfycbwNp7Sl-FToszln1wsraz8Ihm8UEnkso9nBsx01ShsMIDCrWyIJTJMhHJY_bA3wwj_c/exec";

export function Hero() {
  const [counters, setCounters] = useState([
    { label: 'Sisa Helm Siap Pakai', value: '...', unit: 'unit' },
    { label: 'Sisa Harness', value: '...', unit: 'unit' },
    { label: 'Sarung Tangan Tersedia', value: '...', unit: 'pasang' }
  ]);
  const [lastSyncTime, setLastSyncTime] = useState('baru saja');
  
  // State untuk indikator Kepatuhan / Pengembalian APD Dinamis
  const [complianceRate, setComplianceRate] = useState(100);
  const [totalReturned, setTotalReturned] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);

  useEffect(() => {
    const fetchLiveHeroData = async () => {
      try {
        const res = await fetch(`${API_URL}?action=getData`);
        const result = await res.json();

        if (result.success) {
          // 1. Olah Data Master APD untuk Stok Real-time
          if (Array.isArray(result.masterAPD)) {
            const items: any[] = result.masterAPD;

            const helmItem = items.find((i) => String(i['Nama APD'] || i.NamaAPD || '').toLowerCase().includes('helm'));
            const harnessItem = items.find((i) => String(i['Nama APD'] || i.NamaAPD || '').toLowerCase().includes('harness'));
            const glovesItem = items.find((i) => {
              const nama = String(i['Nama APD'] || i.NamaAPD || '').toLowerCase();
              return nama.includes('sarung tangan') || nama.includes('glove');
            });

            setCounters([
              {
                label: 'Sisa Helm Siap Pakai',
                value: helmItem ? String(helmItem.Stok ?? helmItem.stok ?? 0) : '0',
                unit: helmItem?.Satuan || 'unit'
              },
              {
                label: 'Sisa Harness',
                value: harnessItem ? String(harnessItem.Stok ?? harnessItem.stok ?? 0) : '0',
                unit: harnessItem?.Satuan || 'unit'
              },
              {
                label: 'Sarung Tangan Tersedia',
                value: glovesItem ? String(glovesItem.Stok ?? glovesItem.stok ?? 0) : '0',
                unit: glovesItem?.Satuan || 'pasang'
              }
            ]);
          }

          // 2. Olah Data Peminjaman untuk Kepatuhan Pengembalian Real-time
          if (Array.isArray(result.peminjaman)) {
            const loans: any[] = result.peminjaman;
            const countTotal = loans.length;
            
            const countReturned = loans.filter((p) => {
              const st = String(p['Status Pengembalian'] || p.statusPengembalian || '').toLowerCase();
              return st.includes('sudah') || st.includes('kembali');
            }).length;

            setTotalBorrowed(countTotal);
            setTotalReturned(countReturned);

            if (countTotal > 0) {
              const rate = Math.min(100, Math.round((countReturned / countTotal) * 100));
              setComplianceRate(rate);
            } else {
              setComplianceRate(100);
            }
          }

          setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error('Gagal menyinkronkan data Hero:', err);
      }
    };

    fetchLiveHeroData();
    const interval = setInterval(fetchLiveHeroData, 10000); // Otomatis refresh tiap 10 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="beranda" className="w-full border-b border-line bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-safety-50 px-3 py-1 text-xs font-bold text-safety-700 ring-1 ring-safety-100">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Zero Accident Program · Tahun 2026
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            PPE SMART
            <span className="mt-2 block text-2xl font-bold leading-snug text-ink-soft sm:text-3xl lg:text-[2rem]">
              Sistem Mandiri Peminjaman &amp; Permintaan APD
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Pencatatan real-time, transparan, dan terintegrasi untuk menjamin kesiapan alat pelindung
            diri seluruh personel di lapangan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#portal-peminjaman" className="inline-flex items-center justify-center gap-2 rounded-lg bg-safety-600 px-6 py-3.5 text-sm font-bold text-white shadow-card transition-colors duration-150 ease-smooth hover:bg-safety-700">
              Pinjam APD Sekarang
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#portal-permintaan" className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-6 py-3.5 text-sm font-bold text-ink transition-colors duration-150 ease-smooth hover:border-slate-300 hover:bg-canvas">
              <ClipboardListIcon className="h-4 w-4 text-safety-600" aria-hidden="true" />
              Ajukan Permintaan / Wearpack
            </a>
          </div>

          <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {counters.map((counter) => (
              <div key={counter.label} className="bg-white px-4 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  {counter.label}
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold tabular-nums text-ink">{counter.value}</span>
                  <span className="text-xs font-semibold text-ink-subtle">{counter.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok-600 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok-600" />
            </span>
            Stok tersinkron dengan gudang APD · pembaruan pukul {lastSyncTime} WIB
          </p>
        </div>

        <div className="relative">
          <img src={heroImage} alt="Dua pekerja galangan kapal dengan APD lengkap" className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-lift" />
          
          {/* Kartu Kepatuhan & Pengembalian APD Dinamis */}
          <div className="absolute -bottom-6 left-6 right-6 rounded-xl border border-line bg-white p-4 shadow-lift sm:left-8 sm:right-auto sm:w-[300px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Kepatuhan Pengembalian APD
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-extrabold tabular-nums text-ink">{complianceRate}%</p>
              <p className="text-xs font-semibold text-ok-700">
                {totalReturned} / {totalBorrowed} transaksi
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div 
                className="h-full rounded-full bg-ok-600 transition-all duration-500" 
                style={{ width: `${complianceRate}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
