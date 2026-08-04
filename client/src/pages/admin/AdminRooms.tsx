import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button, Spinner, Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtMoney, ROOM_TYPE_LABEL } from '@/lib/format';
import type { Room, RoomType } from '@/lib/types';
import clsx from 'clsx';

const TYPES: RoomType[] = ['standard', 'deluxe', 'suite', 'garden', 'ocean'];
const TONES = ['sand', 'brass', 'pine', 'ink', 'ocean'];

interface RoomForm {
  number: string;
  name: string;
  type: RoomType;
  capacity: number;
  ratePerNight: number;
  amenities: string;
  description: string;
  tone: string;
  active: boolean;
}

const empty: RoomForm = {
  number: '',
  name: '',
  type: 'standard',
  capacity: 2,
  ratePerNight: 200,
  amenities: '',
  description: '',
  tone: 'sand',
  active: true,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RoomForm>(empty);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Room[]>('/rooms')
      .then(setRooms)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load rooms'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!creating) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCreating(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [creating]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setCreating(true);
    setError('');
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      number: room.number,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      ratePerNight: room.ratePerNight,
      amenities: room.amenities.join(', '),
      description: room.description,
      tone: room.tone,
      active: room.active,
    });
    setCreating(true);
    setError('');
  }

  async function save() {
    setSaving(true);
    setError('');
    const body = {
      ...form,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      ratePerNight: Number(form.ratePerNight),
      capacity: Number(form.capacity),
    };
    try {
      if (editing) await api.put(`/rooms/${editing.id}`, body);
      else await api.post('/rooms', body);
      setCreating(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(room: Room) {
    setBusyId(room.id);
    setError('');
    try {
      await api.put(`/rooms/${room.id}`, { active: !room.active });
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, active: !r.active } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(room: Room) {
    if (!window.confirm(`Delete ${room.name} permanently?`)) return;
    setBusyId(room.id);
    setError('');
    try {
      await api.del(`/rooms/${room.id}`);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label">{rooms.length} rooms on the books</span>
        <Button onClick={openCreate}>
          <Plus size={16} /> New room
        </Button>
      </div>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-muted">
          <Spinner /> Unlocking the floor plan…
        </div>
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {['No.', 'Room', 'Type', 'Sleeps', 'Rate / night', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-faint font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rooms.map((r) => (
                <tr key={r.id} className={clsx('transition-colors hover:bg-elev/60', !r.active && 'opacity-50')}>
                  <td className="mono-num px-5 py-4 text-faint">{r.number}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-faint">{r.amenities.length} amenities</p>
                  </td>
                  <td className="px-5 py-4 text-muted capitalize">{ROOM_TYPE_LABEL[r.type]}</td>
                  <td className="px-5 py-4 text-muted">{r.capacity}</td>
                  <td className="mono-num px-5 py-4 font-semibold text-ink">{fmtMoney(r.ratePerNight)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void toggleActive(r)}
                      disabled={busyId === r.id}
                      className={clsx(
                        'rounded-full border px-3 py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em] transition-colors',
                        r.active
                          ? 'border-pine/40 text-pine'
                          : 'border-line text-faint hover:text-muted',
                      )}
                    >
                      {r.active ? 'Open' : 'Closed'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`} className="p-2 text-faint hover:text-brass transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => void remove(r)} aria-label={`Delete ${r.name}`} className="p-2 text-faint hover:text-danger transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" onClick={() => setCreating(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-page p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium text-ink">
                {editing ? `Edit ${editing.name}` : 'New room'}
              </h2>
              <button onClick={() => setCreating(false)} aria-label="Close" className="p-1 text-muted hover:text-brass">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Room number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="204" />
              <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="The Pine Deluxe" />
              <label className="block">
                <span className="input-label block mb-1.5">Type</span>
                <select className="input-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ROOM_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Sleeps"
                type="number"
                min={1}
                max={8}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
              <Field
                label="Rate per night (USD)"
                type="number"
                min={0}
                value={form.ratePerNight}
                onChange={(e) => setForm({ ...form, ratePerNight: Number(e.target.value) })}
              />
              <label className="block">
                <span className="input-label block mb-1.5">Tone</span>
                <select className="input-base" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Amenities (comma separated)"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                placeholder="King bed, Balcony, Desk"
                className="sm:col-span-2"
              />
              <label className="block sm:col-span-2">
                <span className="input-label block mb-1.5">Description</span>
                <textarea
                  className="input-base min-h-24 resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A calm first-floor room looking onto the courtyard…"
                />
              </label>
              <label className="flex items-center gap-3 sm:col-span-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Open for bookings
              </label>
            </div>

            {error && (
              <div className="mt-4">
                <Alert>{error}</Alert>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button onClick={() => void save()} disabled={saving || !form.number || !form.name}>
                {saving ? <Spinner className="h-4 w-4" /> : null}
                {editing ? 'Save changes' : 'Create room'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
