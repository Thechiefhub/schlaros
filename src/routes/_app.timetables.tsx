import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, SUBJECTS } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

type Slot = { day: string; period: number; subject: string; teacher: string; room?: string };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export const Route = createFileRoute("/_app/timetables")({
  head: () => ({ meta: [{ title: "Timetables — TeacherGPT" }] }),
  component: TimetablesPage,
});

function TimetablesPage() {
  const [klass, setKlass] = useState(CLASSES[0]);
  const [data, setData] = usePersisted<Record<string, Slot[]>>("tg.timetables", {});
  const slots = data[klass] ?? [];

  function setSlot(day: string, period: number, patch: Partial<Slot>) {
    const next = slots.filter((s) => !(s.day === day && s.period === period));
    const existing = slots.find((s) => s.day === day && s.period === period) ?? {
      day,
      period,
      subject: "",
      teacher: "",
    };
    next.push({ ...existing, ...patch });
    setData({ ...data, [klass]: next });
  }
  function find(day: string, period: number) {
    return slots.find((s) => s.day === day && s.period === period);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        icon={CalendarClock}
        title="Timetables"
        description="Weekly class schedule — click any cell to assign a subject."
        actions={
          <select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        }
      />
      <Section title={`${klass} — Weekly Schedule`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="p-2 font-semibold">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className="p-2 font-semibold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p} className="border-t border-white/30">
                  <td className="p-2 text-xs font-semibold text-muted-foreground">P{p}</td>
                  {DAYS.map((d) => {
                    const s = find(d, p);
                    return (
                      <td key={d} className="p-1">
                        <select
                          className="input text-xs"
                          value={s?.subject ?? ""}
                          onChange={(e) => setSlot(d, p, { subject: e.target.value })}
                        >
                          <option value="">—</option>
                          {SUBJECTS.map((sub) => (
                            <option key={sub}>{sub}</option>
                          ))}
                        </select>
                        <input
                          className="input mt-1 text-[10px]"
                          placeholder="Teacher"
                          value={s?.teacher ?? ""}
                          onChange={(e) => setSlot(d, p, { teacher: e.target.value })}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: Use the AI Assistant to auto-generate a balanced weekly timetable for this class.
        </p>
      </Section>
    </div>
  );
}
