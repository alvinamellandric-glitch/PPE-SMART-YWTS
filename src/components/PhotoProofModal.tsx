import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, XIcon } from 'lucide-react';
export interface PhotoProof {
  title: string;
  thumb: string;
  caption: string;
}
interface PhotoProofModalProps {
  proof: PhotoProof | null;
  onClose: () => void;
}
export function PhotoProofModal({
  proof,
  onClose
}: PhotoProofModalProps) {
  useEffect(() => {
    if (!proof) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [proof, onClose]);
  return <AnimatePresence>
      {proof && <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1]
    }}>
          <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="proof-title" className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-lift" initial={{
        opacity: 0,
        scale: 0.96,
        y: 8
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.96,
        y: 8
      }} transition={{
        duration: 0.22,
        ease: [0.23, 1, 0.32, 1]
      }}>
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 id="proof-title" className="text-base font-bold tracking-tight text-ink">
                  Bukti Foto Pengembalian — {proof.title}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ok-700">
                  <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  Terverifikasi oleh Tim K3
                </p>
              </div>
              <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-subtle transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink" aria-label="Tutup bukti foto">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <img src={proof.thumb} alt={proof.caption} className="max-h-[60vh] w-full object-cover" />
            <p className="border-t border-line bg-canvas px-5 py-3 text-sm text-ink-muted">
              {proof.caption}
            </p>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}