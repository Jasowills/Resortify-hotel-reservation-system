import { useCallback, useEffect, useState } from 'react';
import { Spinner, Alert } from '@/components/ui';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import clsx from 'clsx';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Array<User & { role: 'guest' | 'admin' }>>('/users')
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load guests'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setRole(id: string, role: 'guest' | 'admin') {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label">{users.length} guests on the register</span>
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-muted">
          <Spinner /> Flipping through the guest book…
        </div>
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Name', 'Email', 'Role', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-faint font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-elev/60 transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink">{u.name}</td>
                  <td className="px-5 py-4 text-muted">{u.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={clsx(
                        'rounded-full border px-3 py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em]',
                        u.role === 'admin' ? 'border-brass/50 text-brass' : 'border-line text-faint',
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void setRole(u.id, u.role === 'admin' ? 'guest' : 'admin')}
                      disabled={busyId === u.id}
                      className="label text-muted hover:text-brass transition-colors disabled:opacity-50"
                    >
                      {u.role === 'admin' ? 'Make guest' : 'Make concierge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
