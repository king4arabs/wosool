"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { gatewayError } from "@/lib/gateway";
type Ops = {
  program_id: number;
  cohorts: { id: number; name: string }[];
  sessions: {
    id: number;
    title: string;
    starts_at: string;
    cohort_id: number | null;
  }[];
  resources: {
    id: number;
    title: string;
    url: string;
    cohort_id: number | null;
    is_archived: boolean;
  }[];
  participants: { user_id: number; name: string; cohort_id: number | null }[];
  mentors: { id: number; name: string }[];
  assignments: { user_id: number; participant_user_id: number }[];
  progress: {
    user_id: number;
    milestones: { title: string; completed: boolean }[];
  }[];
  attendance: { program_session_id: number; user_id: number; status: string }[];
};
export function ProgramOperations() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [data, setData] = useState<Ops | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await api.get<{ data: Ops }>("/admin/accelerator/operations");
      setData(r.data);
    } catch (e) {
      setError(gatewayError(e, ar));
    }
  }, [ar]);
  useEffect(() => {
    void load();
  }, [load]);
  async function mutate(path: string, body: unknown, put = false) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (put) await api.put(path, body);
      else await api.post(path, body);
      await load();
      setMessage(t("تم الحفظ.", "Saved."));
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  function cohortSelect() {
    return (
      <label className="gateway-label">
        {t("الدفعة (اختياري)", "Cohort (optional)")}
        <select name="cohort_id" className="gateway-input">
          <option value="">{t("لكل البرنامج", "Whole program")}</option>
          {data?.cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function formData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    return {
      ...Object.fromEntries(f),
      cohort_id: f.get("cohort_id") ? Number(f.get("cohort_id")) : null,
    };
  }
  if (!data)
    return (
      <p className="mt-6">
        {error ||
          t("جارٍ تحميل إدارة البرنامج…", "Loading program operations…")}
      </p>
    );
  return (
    <details className="gateway-card mt-8">
      <summary className="cursor-pointer text-lg font-bold">
        {t("الدفعات والجلسات والمشاركة", "Cohorts, sessions and participation")}
      </summary>
      {error && (
        <p role="alert" className="gateway-error mt-4">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4">
          {message}
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            const f = formData(e);
            void mutate(`/admin/programs/${data.program_id}/cohorts`, {
              ...f,
              status: "draft",
            });
          }}
        >
          <h2 className="text-lg font-bold">
            {t("إنشاء دفعة", "Create cohort")}
          </h2>
          <label className="gateway-label">
            {t("الاسم", "Name")}
            <input
              name="name"
              required
              className="gateway-input"
              maxLength={255}
            />
          </label>
          <label className="gateway-label">
            {t(
              "تاريخ البداية المؤكد (اختياري)",
              "Confirmed start date (optional)",
            )}
            <input name="starts_at" type="date" className="gateway-input" />
          </label>
          <label className="gateway-label">
            {t(
              "تاريخ النهاية المؤكد (اختياري)",
              "Confirmed end date (optional)",
            )}
            <input name="ends_at" type="date" className="gateway-input" />
          </label>
          <button disabled={busy} className="gateway-button">
            {t("حفظ الدفعة", "Save cohort")}
          </button>
        </form>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            const f = formData(e) as Record<string, unknown>;
            const start = String(f.starts_at);
            void mutate(`/admin/programs/${data.program_id}/sessions`, {
              ...f,
              starts_at: start + ":00+03:00",
              session_type: "workshop",
              status: "scheduled",
            });
          }}
        >
          <h2 className="text-lg font-bold">
            {t("جدولة جلسة", "Schedule session")}
          </h2>
          <label className="gateway-label">
            {t("العنوان", "Title")}
            <input
              name="title"
              required
              className="gateway-input"
              maxLength={255}
            />
          </label>
          {cohortSelect()}
          <label className="gateway-label">
            {t("الموعد بتوقيت الرياض", "Date and time in Riyadh")}
            <input
              name="starts_at"
              type="datetime-local"
              required
              className="gateway-input"
            />
          </label>
          <label className="gateway-label">
            {t("رابط الجلسة الآمن (اختياري)", "HTTPS session link (optional)")}
            <input name="online_link" type="url" className="gateway-input" />
          </label>
          <button disabled={busy} className="gateway-button">
            {t("حفظ الجلسة", "Save session")}
          </button>
        </form>
        <form
          className="space-y-4"
          onSubmit={(e) =>
            void mutate("/admin/accelerator/resources", formData(e))
          }
        >
          <h2 className="text-lg font-bold">
            {t("إضافة مورد للمشاركين", "Add participant resource")}
          </h2>
          <label className="gateway-label">
            {t("العنوان", "Title")}
            <input
              name="title"
              required
              className="gateway-input"
              maxLength={255}
            />
          </label>
          <label className="gateway-label">
            {t("الرابط الآمن", "HTTPS resource URL")}
            <input name="url" type="url" required className="gateway-input" />
          </label>
          {cohortSelect()}
          <button className="gateway-button" disabled={busy}>
            {t("حفظ المورد", "Save resource")}
          </button>
        </form>
        <section>
          <h2 className="text-lg font-bold">
            {t("الموارد الحالية", "Current resources")}
          </h2>
          <ul className="mt-4 space-y-3">
            {data.resources.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 text-sm"
              >
                <span>{r.title}</span>
                <button
                  disabled={busy}
                  className="gateway-button-secondary"
                  onClick={() =>
                    void mutate("/admin/accelerator/resources", {
                      ...r,
                      is_archived: !r.is_archived,
                    })
                  }
                >
                  {r.is_archived
                    ? t("استعادة", "Restore")
                    : t("أرشفة", "Archive")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <h2 className="mt-10 text-xl font-bold">
        {t("المشاركون", "Participants")}
      </h2>
      {!data.participants.length && (
        <p className="mt-3 text-sm text-slate-600">
          {t(
            "تظهر الحسابات بعد اكتمال الانضمام.",
            "Accounts appear after onboarding is complete.",
          )}
        </p>
      )}
      {data.participants.map((p) => (
        <section
          className="mt-5 rounded-xl border border-slate-200 p-5"
          key={p.user_id}
        >
          <h3 className="font-bold">{p.name}</h3>
          <label className="gateway-label mt-4">
            {t("المرشد أو المدرب", "Mentor or coach")}
            <select
              className="gateway-input"
              disabled={busy}
              value={
                data.assignments.find(
                  (a) => a.participant_user_id === p.user_id,
                )?.user_id || ""
              }
              onChange={(e) =>
                void mutate(
                  "/admin/accelerator/participant",
                  {
                    user_id: p.user_id,
                    mentor_user_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  },
                  true,
                )
              }
            >
              <option value="">{t("غير مكلّف", "Unassigned")}</option>
              {data.mentors.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <h4 className="mt-5 font-semibold">{t("الحضور", "Attendance")}</h4>
          {data.sessions
            .filter((s) => !s.cohort_id || s.cohort_id === p.cohort_id)
            .map((s) => (
              <label key={s.id} className="mt-3 block text-sm">
                {s.title}
                <select
                  className="gateway-input"
                  disabled={busy}
                  value={
                    data.attendance.find(
                      (a) =>
                        a.program_session_id === s.id &&
                        a.user_id === p.user_id,
                    )?.status || "not_started"
                  }
                  onChange={(e) =>
                    void mutate(
                      `/admin/programs/${data.program_id}/sessions/${s.id}/attendance`,
                      { user_id: p.user_id, status: e.target.value },
                    )
                  }
                >
                  {[
                    ["not_started", "غير مسجل", "Not recorded"],
                    ["attended", "حضر", "Attended"],
                    ["absent", "غائب", "Absent"],
                    ["no_show", "لم يحضر", "No-show"],
                  ].map(([v, a, e]) => (
                    <option key={v} value={v}>
                      {t(a, e)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          <h4 className="mt-5 font-semibold">
            {t("المراحل المستهدفة", "Milestones")}
          </h4>
          {(
            data.progress.find((r) => r.user_id === p.user_id)?.milestones || []
          ).map((m, i, all) => (
            <label key={i} className="mt-3 flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={m.completed}
                disabled={busy}
                onChange={(e) =>
                  void mutate(
                    "/admin/accelerator/participant",
                    {
                      user_id: p.user_id,
                      milestones: all.map((x, j) =>
                        i === j ? { ...x, completed: e.target.checked } : x,
                      ),
                    },
                    true,
                  )
                }
              />
              {m.title}
            </label>
          ))}
          <form
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const milestones =
                data.progress.find((r) => r.user_id === p.user_id)
                  ?.milestones || [];
              void mutate(
                "/admin/accelerator/participant",
                {
                  user_id: p.user_id,
                  milestones: [
                    ...milestones,
                    { title: f.get("title"), completed: false },
                  ],
                },
                true,
              );
            }}
          >
            <input
              required
              name="title"
              aria-label={t("مرحلة مستهدفة جديدة", "New milestone")}
              className="gateway-input mt-0"
              maxLength={255}
            />
            <button className="gateway-button-secondary" disabled={busy}>
              {t("إضافة", "Add")}
            </button>
          </form>
        </section>
      ))}
    </details>
  );
}
