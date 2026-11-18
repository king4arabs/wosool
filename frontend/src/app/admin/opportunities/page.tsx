"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale } from "@/lib/locale";
import { api, ApiError } from "@/lib/api";
import { gatewayError, recordLabel } from "@/lib/gateway";
import type { EcosystemRecord } from "@/components/accelerator/OpportunityDirectory";
import {
  adminEcosystem,
  ecosystemApplicationStatuses,
  ecosystemFieldErrors,
  ecosystemFieldId,
  ecosystemFields,
  ecosystemPayload,
  ecosystemVerificationStatuses,
  fill,
  toEcosystemForm,
  utcToday,
  validateEcosystemForm,
  type EcosystemField,
  type EcosystemForm,
  type EcosystemFormErrors,
} from "@/lib/admin-ecosystem";

const optionalFields: readonly EcosystemField[] = ["application_url", "deadline"];

export default function DataReview() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const copy = adminEcosystem(locale);
  const [rows, setRows] = useState<EcosystemRecord[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [record, setRecord] = useState<EcosystemRecord | null>(null);
  const [form, setForm] = useState<EcosystemForm | null>(null);
  const [errors, setErrors] = useState<EcosystemFormErrors>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingFocus = useRef<EcosystemField | "heading" | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const r = await api.get<{ data: EcosystemRecord[] }>("/admin/ecosystem");
      setRows(r.data);
      setState("ready");
    } catch {
      setState("failed");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  // Focus moves only after React has rendered (and re-enabled) the target.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || busy) return;
    pendingFocus.current = null;
    if (target === "heading") {
      headingRef.current?.focus();
      formRef.current?.scrollIntoView?.({ block: "start" });
    } else {
      document.getElementById(ecosystemFieldId(target))?.focus();
    }
  });

  function open(row: EcosystemRecord) {
    setRecord(row);
    setForm(toEcosystemForm(row));
    setErrors({});
    setError("");
    setNotice("");
    pendingFocus.current = "heading";
  }

  function close() {
    setRecord(null);
    setForm(null);
    setErrors({});
    setError("");
  }

  function update(field: EcosystemField, value: string) {
    if (!form) return;
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function focusFirst(found: EcosystemFormErrors) {
    pendingFocus.current = ecosystemFields.find((field) => found[field]) ?? null;
  }

  async function save() {
    if (!record || !form || busy) return;
    const found = validateEcosystemForm(locale, form);
    setErrors(found);
    setNotice("");
    if (Object.keys(found).length) {
      setError(copy.errors.fixFields);
      focusFirst(found);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/ecosystem/" + record.id, ecosystemPayload(record, form));
      close();
      setNotice(copy.saved);
      await load();
    } catch (e) {
      const data = e instanceof ApiError && e.status === 422 ? (e.data as { errors?: unknown }) : null;
      const mapped = ecosystemFieldErrors(locale, data?.errors);
      if (Object.keys(mapped).length) {
        setErrors(mapped);
        setError(copy.errors.fixFields);
        focusFirst(mapped);
      } else {
        setError(gatewayError(e, ar));
      }
    } finally {
      setBusy(false);
    }
  }

  function field(name: EcosystemField, control: (props: {
    id: string;
    className: string;
    value: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    disabled: boolean;
  }) => ReactNode) {
    if (!form) return null;
    const id = ecosystemFieldId(name);
    const hint = (copy.hints as Partial<Record<EcosystemField, string>>)[name];
    const describedBy = [hint && `${id}-hint`, errors[name] && `${id}-error`].filter(Boolean).join(" ");
    return (
      <div key={name}>
        <label className="gateway-label" htmlFor={id}>
          {copy.labels[name]}{" "}
          <span className="text-xs font-normal text-slate-600">
            ({optionalFields.includes(name) ? copy.optional : copy.required})
          </span>
        </label>
        {control({
          id,
          className: "gateway-input",
          value: form[name],
          "aria-invalid": Boolean(errors[name]),
          "aria-describedby": describedBy || undefined,
          disabled: busy,
        })}
        {hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">
            {hint}
          </p>
        )}
        {errors[name] && (
          <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-red-700">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  const text = (name: EcosystemField, dir: "rtl" | "ltr", type = "text") =>
    field(name, (props) => (
      <input {...props} type={type} dir={dir} onChange={(e) => update(name, e.target.value)} />
    ));
  const area = (name: EcosystemField, dir: "rtl" | "ltr", rows = 3) =>
    field(name, (props) => (
      <textarea {...props} rows={rows} dir={dir} onChange={(e) => update(name, e.target.value)} />
    ));
  const select = (name: EcosystemField, values: readonly string[]) =>
    field(name, (props) => (
      <select {...props} onChange={(e) => update(name, e.target.value)}>
        {values.map((v) => (
          <option key={v} value={v}>
            {recordLabel(v, ar)}
          </option>
        ))}
      </select>
    ));

  return (
    <div>
      <h2 className="gateway-heading">{copy.heading}</h2>
      <p className="gateway-lead">{copy.lead}</p>
      <div aria-live="polite">
        {notice && <p className="mt-5 text-sm font-semibold text-emerald-700">{notice}</p>}
      </div>
      {record && form && (
        <form
          ref={formRef}
          noValidate
          className="gateway-card mt-6 space-y-4"
          aria-busy={busy}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <h3 ref={headingRef} tabIndex={-1} className="text-lg font-bold">
            {fill(copy.editing, { name: ar ? record.name_ar : record.name_en })}
          </h3>
          {error && (
            <p role="alert" className="gateway-error">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("name_ar", "rtl")}
            {text("name_en", "ltr")}
            {area("description_ar", "rtl")}
            {area("description_en", "ltr")}
            {text("website_url", "ltr", "url")}
            {text("application_url", "ltr", "url")}
          </div>
          {area("source_urls", "ltr", 4)}
          <div className="grid gap-4 sm:grid-cols-2">
            {select("verification_status", ecosystemVerificationStatuses)}
            {select("application_status", ecosystemApplicationStatuses)}
            {text("deadline", "ltr", "date")}
            {field("verified_at", (props) => (
              <input
                {...props}
                type="date"
                dir="ltr"
                max={utcToday()}
                onChange={(e) => update("verified_at", e.target.value)}
              />
            ))}
          </div>
          {field("note", (props) => (
            <textarea {...props} rows={3} onChange={(e) => update("note", e.target.value)} />
          ))}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="gateway-button">
              {busy ? copy.saving : copy.save}
            </button>
            <button type="button" disabled={busy} className="gateway-button-secondary" onClick={close}>
              {copy.cancel}
            </button>
          </div>
        </form>
      )}
      {state === "loading" && rows.length === 0 && (
        <p className="mt-6 text-sm text-slate-600" role="status">
          {copy.loading}
        </p>
      )}
      {state === "failed" && (
        <div className="gateway-error mt-6" role="alert">
          <p>{copy.loadFailed}</p>
          <button type="button" className="gateway-button-secondary mt-3" onClick={() => void load()}>
            {copy.retry}
          </button>
        </div>
      )}
      {state === "ready" && rows.length === 0 && <p className="mt-6 text-sm text-slate-600">{copy.empty}</p>}
      <div className="mt-6 space-y-3">
        {rows.map((r) => {
          const name = ar ? r.name_ar : r.name_en;
          return (
            <article
              key={r.id}
              className="gateway-card flex flex-wrap items-center justify-between gap-4"
              aria-current={record?.id === r.id ? "true" : undefined}
            >
              <div>
                <h3 className="font-bold">{name}</h3>
                <p className="mt-2 text-xs text-slate-600">
                  {recordLabel(r.entity_type, ar)} · {recordLabel(r.verification_status, ar)} ·{" "}
                  <span dir="ltr">{r.verified_at.slice(0, 10)}</span>
                </p>
              </div>
              <button
                type="button"
                className="gateway-button-secondary"
                disabled={busy}
                aria-label={fill(copy.reviewNamed, { name })}
                onClick={() => open(r)}
              >
                {copy.review}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
