import React, { useState } from 'react';
import { KeyRoundIcon, LockIcon, XIcon } from 'lucide-react';
import { inputClasses } from './ui/Field';
interface AdminPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const ADMIN_PASSWORD = 'k3'; // Kamu bisa ganti password sesuai kebutuhan

export function AdminPasswordModal({
  open,
  onClose,
  onSuccess
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  if (!open) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-safety-50 text-safety-600">
              <LockIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Autentikasi Admin K3</h3>
              <p className="text-xs text-ink-subtle">Akses terbatas data audit internal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-subtle hover:bg-canvas hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="admin-pass" className="text-xs font-bold text-ink">
              Kata Sandi / PIN Petugas
            </label>
            <div className="relative mt-1.5">
              <input id="admin-pass" type="password" autoFocus value={password} onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }} placeholder="Masukkan kata sandi..." className={`${inputClasses} ${error ? 'border-safety-600 focus:ring-safety-600' : ''}`} />
            </div>
            {error && <p className="mt-1.5 text-xs font-semibold text-safety-600">
                Kata sandi tidak sesuai. Silakan hubungi koordinator K3.
              </p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2.5 text-xs font-bold text-ink hover:bg-canvas">
              Batal
            </button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-safety-600 px-5 py-2.5 text-xs font-bold text-white shadow-card hover:bg-safety-700">
              <KeyRoundIcon className="h-3.5 w-3.5" />
              Masuk Portal
            </button>
          </div>
        </form>
      </div>
    </div>;
}