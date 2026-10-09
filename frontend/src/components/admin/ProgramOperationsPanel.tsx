"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Participant = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  status: string;
  completion_percentage: number;
  at_risk: boolean;
  cohort: { name: string } | null;
};
type Session = { id: number; title: string };
export function ProgramOperationsPanel({
  programId,
  panel,
}: {
  programId: string;
  panel: string;
}) {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, people, calendar] = await Promise.all([
          api.get<{
            data: { program: { name: string }; kpis: Record<string, number> };
          }>(`/admin/programs/${programId}/dashboard`, { signal }),
          api.get<{ data: Participant[] }>(
            `/admin/programs/${programId}/participants`,
            { signal },
          ),
          api.get<{ data: Session[] }>(
            `/admin/programs/${programId}/sessions`,
            { signal },
          ),
        ]);
        if (signal?.aborted) return;
        setKpis(dashboard.data.kpis);
        setTitle(dashboard.data.program.name);
        setParticipants(people.data);
        setSessions(calendar.data);
      } catch (error) {
        if (!signal?.aborted)
          setError(
            error instanceof Error ? error.message : "Unable to load program",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [programId],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  async function progress(
    event: FormEvent<HTMLFormElement>,
    participant: Participant,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(String(participant.id));
    try {
      await api.patch(
        `/admin/programs/${programId}/participants/${participant.id}`,
        {
          completion_percentage: Number(data.get("completion")),
          status: data.get("status"),
          at_risk: data.get("at_risk") === "on",
        },
      );
      toast(ar ? "تم حفظ تقدم المشارك." : "Progress saved.", "success");
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to save", "error");
    } finally {
      setBusy(null);
    }
  }
  async function attendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy("attendance");
    try {
      await api.post(
        `/admin/programs/${programId}/sessions/${data.get("session")}/attendance`,
        { user_id: Number(data.get("user")), status: data.get("status") },
      );
      toast(ar ? "تم حفظ الحضور." : "Attendance saved.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to save", "error");
    } finally {
      setBusy(null);
    }
  }
  const labels: Record<string, string> = ar
    ? {
        applications: "الطلبات",
        participants: "المشاركون",
        cohorts: "الدفعات",
        sessions: "الجلسات",
        accepted: "المقبولون",
        pending_review: "قيد المراجعة",
        completed: "أكملوا البرنامج",
      }
    : {
        applications: "Applications",
        participants: "Participants",
        cohorts: "Cohorts",
        sessions: "Sessions",
        accepted: "Accepted",
        pending_review: "Pending review",
        completed: "Completed",
      };
  if (loading) return <p role="status">{ar ? "جارٍ التحميل…" : "Loading…"}</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <Button onClick={() => void load()}>
          {ar ? "إعادة المحاولة" : "Try again"}
        </Button>
      </div>
    );
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold">{title}</h2>
      {panel === "نظرة عامة" && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(kpis).map(([key, value]) => (
            <div key={key} className="rounded-xl border bg-white p-5">
              <dt className="text-sm text-slate-600">{labels[key] || key}</dt>
              <dd className="mt-3 text-3xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {["المشاركون", "التقدم"].includes(panel) && (
        <div className="space-y-4">
          {!participants.length && (
            <p>
              {ar ? "لا يوجد مشاركون مسجلون." : "No enrolled participants."}
            </p>
          )}
          {participants.map((participant) => (
            <form
              key={participant.id}
              onSubmit={(event) => void progress(event, participant)}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              <h3 className="font-bold">{participant.name}</h3>
              <p dir="auto" className="text-sm text-slate-500">
                {participant.email} · {participant.cohort?.name}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label>
                  {ar ? "الإنجاز %" : "Completion %"}
                  <Input
                    name="completion"
                    type="number"
                    min={0}
                    max={100}
                    required
                    defaultValue={participant.completion_percentage}
                  />
                </label>
                <label>
                  {ar ? "الحالة" : "Status"}
                  <Select name="status" defaultValue={participant.status}>
                    {[
                      "enrolled",
                      "not_started",
                      "in_progress",
                      "at_risk",
                      "completed",
                      "dropped",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="at_risk"
                    defaultChecked={participant.at_risk}
                  />
                  {ar ? "يحتاج متابعة" : "Needs follow-up"}
                </label>
              </div>
              <Button
                type="submit"
                loading={busy === String(participant.id)}
                disabled={busy !== null}
              >
                {ar ? "حفظ التقدم" : "Save progress"}
              </Button>
            </form>
          ))}
        </div>
      )}
      {panel === "الحضور" && (
        <form
          onSubmit={attendance}
          className="space-y-4 rounded-xl border bg-white p-5"
        >
          <label className="block">
            {ar ? "الجلسة" : "Session"}
            <Select name="session" required defaultValue="">
              <option value="">{ar ? "اختر الجلسة" : "Select session"}</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            {ar ? "المشارك" : "Participant"}
            <Select name="user" required defaultValue="">
              <option value="">
                {ar ? "اختر المشارك" : "Select participant"}
              </option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.user_id}>
                  {participant.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            {ar ? "الحضور" : "Attendance"}
            <Select name="status">
              <option value="attended">{ar ? "حاضر" : "Attended"}</option>
              <option value="absent">{ar ? "غائب" : "Absent"}</option>
              <option value="no_show">{ar ? "لم يحضر" : "No show"}</option>
              <option value="not_started">
                {ar ? "لم يبدأ" : "Not started"}
              </option>
            </Select>
          </label>
          <Button
            type="submit"
            loading={busy === "attendance"}
            disabled={!sessions.length || !participants.length}
          >
            {ar ? "حفظ الحضور" : "Save attendance"}
          </Button>
        </form>
      )}
    </section>
  );
}
