import React from 'react';
import { ClockIcon, PhoneCallIcon, ShieldCheckIcon } from 'lucide-react';
import { sopSteps } from '../data/ppe';
import { BrandMark } from './BrandMark';

export function Footer() {
  return <footer id="panduan-k3" className="w-full bg-ink text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-safety-600 text-white">
              <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-white">
                Komitmen Safety: APD bukan formalitas, tapi pulang dengan selamat.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Setiap peminjaman dan permintaan tercatat untuk melindungi Anda dan rekan kerja.
              </p>
            </div>
          </div>
          <p className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            QHSE Management System · Zero Accident
          </p>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Panduan K3 — SOP Singkat Peminjaman Alat
            </h3>
            <ol className="mt-4 space-y-3">
              {sopSteps.map((step, i) => <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>)}
            </ol>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <ClockIcon className="h-4 w-4" aria-hidden="true" />
              Jam Operasional &amp; Pengembalian APD
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2.5">
                <dt className="text-slate-400">Senin – Jumat</dt>
                <dd className="font-semibold text-white">08.00 – 16.00 WIB</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2.5">
                <dt className="text-slate-400">Batas Pengembalian Harian</dt>
                <dd className="font-semibold text-amber-400">Maksimal 16.00 WIB</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2.5">
                <dt className="text-slate-400">Sabtu</dt>
                <dd className="font-semibold text-white">08.00 – 12.00 WIB</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Minggu &amp; Hari Besar</dt>
                <dd className="font-semibold text-white">Tutup (Emergency Only)</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              Lokasi: Kantor QHSE. Wajib mengembalikan unit sebelum pukul 16.00 WIB.
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <PhoneCallIcon className="h-4 w-4" aria-hidden="true" />
              Kontak Darurat Safety Officer QHSE
            </h3>
            <div className="mt-4 space-y-3">
              <a href="tel:081226316057" className="block rounded-xl border border-safety-600/40 bg-safety-600/10 px-4 py-3 transition-colors duration-150 ease-smooth hover:bg-safety-600/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-safety-400">
                  Hotline Darurat 24 Jam
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-white">0812-2631-6057</p>
              </a>
              <div className="text-sm">
                <p className="font-semibold text-white">Aistie Lazuardi — Safety Officer</p>
                <a href="mailto:aistie.lazuardi@samudera.id" className="text-slate-400 hover:text-safety-400">
                  aistie.lazuardi@samudera.id
                </a>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Fani Aulia — Safety Officer</p>
                <a href="mailto:faniauliahusna.osh25@gmail.com" className="text-slate-400 hover:text-safety-400">
                  faniauliahusna.osh25@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark size="sm" inverted />
          <p className="text-xs text-slate-500">
            © 2026 PPE SMART · Departemen QHSE. Seluruh data peminjaman diaudit bulanan.
          </p>
        </div>
      </div>
    </footer>;
}