"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { ApiError, api } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { useToast } from "@/components/ui/toast";
import {
  adminPartners,
  fill,
  isPartnerStatus,
  isPartnerType,
  partnerChecks,
  partnerFieldErrors,
  partnerFieldId,
  partnerFields,
  partnerName,
  partnerPayload,
  partnerStatusLabel,
  partnerStatuses,
  partnerTypeLabel,
  partnerTypes,
  partnerVisibility,
  toPartnerForm,
  validatePartnerForm,
  type AdminPartner,
  type PartnerField,
  type PartnerForm,
  type PartnerFormErrors,
} from "@/lib/admin-partners";

type TextField = "name_ar" | "name_en" | "website" | "logo_url" | "logo_source_url" | "slug" | "display_order" | "approval_note";
type FieldOptions = {
  required?: boolean;
  optional?: boolean;
  hint?: string;
  wide?: boolean;
  multiline?: boolean;
  type?: "text" | "url" | "number";
  dir?: "ltr" | "rtl" | "auto";
};

export default function AdminPartners() {
  const { locale } = useLocale();
  const { toast } = useToast();
  const copy = adminPartners(locale);
  const [rows, setRows] = useState<AdminPartner[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PartnerForm>(() => toPartnerForm());
  const [errors, setErrors] = useState<PartnerFormErrors>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const latestRequest = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [focusField, setFocusField] = useState<PartnerField | null>(null);

  const load = useCallback(async () => {
    const request = ++latestRequest.current;
    setStatus("loading");
    try {
      const response = await api.get<{ data: AdminPartner[] }>("/admin/partners");
      if (request !== latestRequest.current) return;
      setRows(response.data);
      setStatus("ready");
    } catch {
      if (request === latestRequest.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // The editor opens above the list, so move focus (and the view) to it; otherwise keyboard and
  // screen-reader users who pressed "Review and edit" on a card further down stay on that card.
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, editing]);

  // Inputs are disabled while saving and cannot take focus, so wait until saving has finished.
  useEffect(() => {
    if (!focusField || saving) return;
    document.getElementById(partnerFieldId(focusField))?.focus();
    setFocusField(null);
  }, [focusField, saving]);

  const focusFirstError = (found: PartnerFormErrors) => {
    setFocusField(partnerFields.find((field) => found[field]) ?? null);
  };

  const openEditor = (partner?: AdminPartner) => {
    setEditing(partner ?? null);
    setForm(toPartnerForm(partner));
    setErrors({});
    setOpen(true);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setErrors({});
  };

  const update = <K extends keyof PartnerForm>(name: K, value: PartnerForm[K]) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as PartnerField];
      return next;
    });
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const found = validatePartnerForm(locale, form);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      toast(copy.saveInvalid, "error");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const payload = partnerPayload(form);
      if (editing) await api.put(`/admin/partners/${editing.id}`, payload);
      else await api.post("/admin/partners", payload);
      toast(editing ? copy.updated : copy.created, "success");
      setOpen(false);
      setEditing(null);
      void load();
    } catch (err) {
      const apiErrors =
        err instanceof ApiError && err.status === 422
          ? partnerFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
          : {};
      if (Object.keys(apiErrors).length) {
        setErrors(apiErrors);
        focusFirstError(apiErrors);
        toast(copy.saveInvalid, "error");
      } else {
        toast(copy.saveFailed, "error");
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const describedBy = (name: PartnerField, hint?: string) => {
    const id = partnerFieldId(name);
    return errors[name] ? `${id}-error` : hint ? `${id}-hint` : undefined;
  };

  const message = (name: PartnerField, hint?: string) => {
    const id = partnerFieldId(name);
    if (errors[name])
      return (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-[var(--error-text)]">
          {errors[name]}
        </p>
      );
    return hint ? (
      <p id={`${id}-hint`} className="mt-1 text-xs font-normal leading-6 text-slate-600">
        {hint}
      </p>
    ) : null;
  };

  const marker = (options: { required?: boolean; optional?: boolean }) =>
    options.required ? (
      <span className="ms-1 text-xs font-normal text-slate-600">{copy.required}</span>
    ) : options.optional ? (
      <span className="ms-1 text-xs font-normal text-slate-600">{copy.optional}</span>
    ) : null;

  const field = (name: TextField, label: string, options: FieldOptions = {}): ReactNode => {
    const id = partnerFieldId(name);
    const shared = {
      id,
      name,
      value: form[name],
      disabled: saving,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy(name, options.hint),
      "aria-required": options.required || undefined,
      dir: options.dir ?? "auto",
      className: "gateway-input",
    };
    return (
      <div className={options.wide ? "sm:col-span-2" : undefined}>
        <label htmlFor={id} className="gateway-label">
          {label}
          {marker(options)}
        </label>
        {options.multiline ? (
          <textarea {...shared} rows={3} onChange={(event) => update(name, event.target.value)} />
        ) : (
          <input
            {...shared}
            type={options.type ?? "text"}
            inputMode={options.type === "number" ? "numeric" : undefined}
            onChange={(event) => update(name, event.target.value)}
          />
        )}
        {message(name, options.hint)}
      </div>
    );
  };

  const select = (name: "type" | "status", label: string, values: readonly string[], labelFor: (value: string) => string, known: boolean): ReactNode => {
    const id = partnerFieldId(name);
    return (
      <div>
        <label htmlFor={id} className="gateway-label">
          {label}
          {marker({ required: true })}
        </label>
        <select
          id={id}
          name={name}
          className="gateway-input"
          value={form[name]}
          disabled={saving}
          aria-required
          aria-invalid={Boolean(errors[name])}
          aria-describedby={describedBy(name)}
          onChange={(event) => update(name, event.target.value)}
        >
          {values.map((value) => (
            <option key={value} value={value}>
              {labelFor(value)}
            </option>
          ))}
          {!known && <option value={form[name]}>{form[name]}</option>}
        </select>
        {message(name)}
      </div>
    );
  };

  const checkbox = (name: "identity_status" | "asset_status" | "designation_status" | "is_public", label: string): ReactNode => {
    const id = partnerFieldId(name);
    return (
      <div>
        <label htmlFor={id} className="flex min-h-11 items-center gap-3 text-sm leading-7">
          <input
            id={id}
            type="checkbox"
            className="h-4 w-4 shrink-0"
            checked={form[name]}
            disabled={saving}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={describedBy(name)}
            onChange={(event) => update(name, event.target.checked)}
          />
          {label}
        </label>
        {message(name)}
      </div>
    );
  };

  let records: ReactNode;
  if (status === "loading" && rows.length === 0) {
    records = (
      <p role="status" className="text-sm text-slate-600">
        {copy.loading}
      </p>
    );
  } else if (status === "error") {
    records = (
      <div role="alert" className="space-y-3">
        <p className="text-sm">{copy.loadFailed}</p>
        <button type="button" className="gateway-button-secondary" onClick={() => void load()}>
          {copy.retry}
        </button>
      </div>
    );
  } else if (rows.length === 0) {
    records = <p className="text-sm text-slate-600">{copy.empty}</p>;
  } else {
    records = (
      <ul className="grid gap-4 md:grid-cols-2">
        {rows.map((partner) => {
          const name = partnerName(locale, partner);
          const gaps = partnerVisibility(partner);
          return (
            <li className="gateway-card flex flex-col" key={partner.id}>
              {partner.logo_url && (
                <div className="mb-5 flex h-24 justify-center">
                  <Image src={partner.logo_url} alt="" width={180} height={96} unoptimized className="h-24 w-44 object-contain" />
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <h4 className="min-w-0 break-words text-lg font-bold" dir="auto">
                  {name}
                </h4>
                <span className="gateway-badge shrink-0">{fill(copy.order, { order: partner.display_order ?? 0 })}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {partnerTypeLabel(locale, partner.type)} · {partnerStatusLabel(locale, partner.status)}
              </p>
              <p className="mt-3 text-sm font-bold leading-7">{gaps.length ? copy.notListed : copy.listed}</p>
              {gaps.length > 0 && (
                <p className="text-sm leading-7 text-slate-600">
                  {fill(copy.missing, { items: gaps.map((gap) => copy.gaps[gap]).join(copy.listSeparator) })}
                </p>
              )}
              {partner.approval_note && (
                <p className="mt-2 break-words text-xs leading-6 text-slate-600" dir="auto">
                  {partner.approval_note}
                </p>
              )}
              <button
                type="button"
                className="gateway-button-secondary mt-4 self-start"
                onClick={() => openEditor(partner)}
                aria-label={fill(copy.edit, { name })}
              >
                {copy.review}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="gateway-heading">{copy.title}</h2>
      <p className="gateway-lead">{copy.intro}</p>
      <p className="mt-4 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7">{copy.publicNote}</p>
      <button type="button" className="gateway-button mt-5" onClick={() => openEditor()}>
        {copy.add}
      </button>

      {open && (
        <form onSubmit={save} noValidate className="gateway-card mt-6 space-y-5" aria-labelledby="partner-editor-title">
          <div>
            <h3 id="partner-editor-title" ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none">
              {editing ? fill(copy.editTitle, { name: partnerName(locale, editing) }) : copy.addTitle}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{copy.formIntro}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("name_ar", copy.nameAr, { dir: "rtl", hint: copy.nameHint })}
            {field("name_en", copy.nameEn, { dir: "ltr", hint: copy.nameHint })}
            {select("type", copy.type, partnerTypes, (value) => partnerTypeLabel(locale, value), isPartnerType(form.type))}
            {select("status", copy.status, partnerStatuses, (value) => partnerStatusLabel(locale, value), isPartnerStatus(form.status))}
            {field("website", copy.website, { type: "url", dir: "ltr", optional: true })}
            {field("logo_url", copy.logoUrl, { dir: "ltr", optional: true, hint: copy.logoHint })}
            {field("logo_source_url", copy.logoSource, { type: "url", dir: "ltr", optional: true, hint: copy.logoSourceHint })}
            {field("slug", copy.slug, { dir: "ltr", optional: true, hint: copy.slugHint })}
            {field("display_order", copy.displayOrder, { type: "number", dir: "ltr", hint: copy.displayOrderHint })}
          </div>
          <fieldset>
            <legend className="gateway-label">{copy.checksLegend}</legend>
            <div className="mt-1 space-y-1">{partnerChecks.map((check) => <div key={check}>{checkbox(check, copy.checks[check])}</div>)}</div>
          </fieldset>
          {field("approval_note", copy.approvalNote, { multiline: true, optional: true, hint: copy.approvalNoteHint })}
          {checkbox("is_public", copy.isPublic)}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="gateway-button" disabled={saving} aria-busy={saving}>
              {saving ? copy.saving : copy.save}
            </button>
            <button type="button" className="gateway-button-secondary" disabled={saving} onClick={close}>
              {copy.cancel}
            </button>
          </div>
        </form>
      )}

      <section className="mt-7" aria-labelledby="partner-records" aria-busy={status === "loading"}>
        <h3 id="partner-records" className="sr-only">
          {copy.records}
        </h3>
        {records}
      </section>
    </div>
  );
}
