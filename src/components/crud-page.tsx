import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Section } from "@/components/page-header";
import { usePersisted } from "@/hooks/use-persisted";

export type CrudField<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "select" | "textarea" | "date";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  badge?: boolean; // render value as colored badge in row
};

type Props<T extends { id: string }> = {
  storageKey: string;
  icon: LucideIcon;
  title: string;
  description: string;
  itemNoun: string;
  fields: CrudField<T>[];
  initial: () => Omit<T, "id">;
  seed?: T[];
  primaryKey?: keyof T & string; // big bold column
  secondaryKey?: keyof T & string; // muted-text column
};

export function CrudPage<T extends { id: string }>({
  storageKey,
  icon,
  title,
  description,
  itemNoun,
  fields,
  initial,
  seed = [],
  primaryKey,
  secondaryKey,
}: Props<T>) {
  const [items, setItems] = usePersisted<T[]>(storageKey, seed as T[]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(initial() as Record<string, unknown>);
  const [q, setQ] = useState("");

  const pk = primaryKey ?? (fields[0]?.key as keyof T & string);

  function openNew() {
    setEditId(null);
    setForm(initial() as Record<string, unknown>);
    setOpen(true);
  }
  function openEdit(it: T) {
    setEditId(it.id);
    setForm(it as unknown as Record<string, unknown>);
    setOpen(true);
  }
  function save() {
    for (const f of fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) return;
    }
    if (editId) {
      setItems(items.map((x) => (x.id === editId ? ({ ...x, ...form, id: editId } as T) : x)));
    } else {
      setItems([{ ...(form as object), id: crypto.randomUUID() } as T, ...items]);
    }
    setOpen(false);
  }
  function remove(id: string) {
    setItems(items.filter((x) => x.id !== id));
  }

  const filtered = q
    ? items.filter((it) =>
        Object.values(it as object).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      )
    : items;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={
          <button
            onClick={openNew}
            className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> New {itemNoun}
          </button>
        }
      />

      <Section
        title={`${itemNoun}s (${filtered.length})`}
        action={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/40 bg-white/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">No {itemNoun.toLowerCase()}s yet.</p>
            <button
              onClick={openNew}
              className="bg-gradient-primary mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add your first {itemNoun.toLowerCase()}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-white/30">
            {filtered.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {String((it as Record<string, unknown>)[pk] ?? "—")}
                  </div>
                  {secondaryKey && (
                    <div className="truncate text-xs text-muted-foreground">
                      {String((it as Record<string, unknown>)[secondaryKey] ?? "")}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {fields
                      .filter((f) => f.badge && (it as Record<string, unknown>)[f.key])
                      .map((f) => (
                        <span
                          key={f.key}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          {String((it as Record<string, unknown>)[f.key])}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(it)}
                    className="rounded-lg bg-white/70 p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    className="rounded-lg bg-destructive/10 p-2 text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/40 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">
                  {editId ? `Edit ${itemNoun}` : `New ${itemNoun}`}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                {fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      {f.label} {f.required && <span className="text-destructive">*</span>}
                    </span>
                    {f.type === "select" ? (
                      <select
                        className="input"
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      >
                        <option value="">Select…</option>
                        {f.options?.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        rows={3}
                        className="input"
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        className="input"
                        value={String(form[f.key] ?? "")}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                          })
                        }
                        placeholder={f.placeholder}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="bg-gradient-primary rounded-xl px-5 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
