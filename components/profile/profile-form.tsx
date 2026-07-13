"use client";

import { useActionState } from "react";
import {
  saveOnboardingProfile,
  saveProfileSettings,
  type ProfileFormState,
} from "@/lib/profiles/profile-actions";

const initialState: ProfileFormState = {
  issues: [],
};

const ageDecades = [
  { value: "AGE_18_29", label: "18-29" },
  { value: "AGE_30_39", label: "30-39" },
  { value: "AGE_40_49", label: "40-49" },
  { value: "AGE_50_59", label: "50-59" },
  { value: "AGE_60_PLUS", label: "60+" },
];

const sexes = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];

export type ProfileFormDefaults = {
  emailAddress?: string;
  username?: string;
  displayName?: string;
  description?: string;
  zipCode?: string;
  ageDecade?: string;
  sex?: string;
  photoCount?: string;
};

type ProfileFormProps = {
  defaultEmail: string;
  defaults?: ProfileFormDefaults;
  mode: "onboarding" | "settings";
};

export function ProfileForm({ defaultEmail, defaults = {}, mode }: ProfileFormProps) {
  const serverAction = mode === "onboarding" ? saveOnboardingProfile : saveProfileSettings;
  const [state, action, pending] = useActionState(serverAction, initialState);
  const values = state.values ?? defaults;
  const submitLabel = mode === "onboarding" ? "Save profile" : "Update profile";

  return (
    <form action={action} className="grid gap-5 rounded-lg border border-line bg-white p-5 shadow-soft">
      {state.issues.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-black">Review these items:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email address" name="emailAddress" type="email" defaultValue={values.emailAddress ?? defaultEmail} />
        <Field label="Username" name="username" defaultValue={values.username} placeholder="janedoe" />
        <Field label="Display name" name="displayName" defaultValue={values.displayName} placeholder="Jane" />
        <Field label="ZIP code" name="zipCode" defaultValue={values.zipCode} placeholder="80202" />
        <Field label="Photo count" name="photoCount" type="number" min="0" max="20" defaultValue={values.photoCount ?? "3"} />
        <SelectField label="Age decade" name="ageDecade" options={ageDecades} defaultValue={values.ageDecade} />
        <SelectField label="Sex" name="sex" options={sexes} defaultValue={values.sex} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-bold text-ink" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={80}
          rows={6}
          defaultValue={values.description}
          className="rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-teal-700"
          placeholder="Write at least 80 characters. Do not include social handles, phone numbers, or email addresses."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-md bg-teal-700 px-4 py-2 font-black text-white disabled:cursor-not-allowed disabled:bg-muted"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  min?: string;
  max?: string;
  defaultValue?: string;
  placeholder?: string;
};

function Field({ label, name, type = "text", defaultValue, placeholder, min, max }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        max={max}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-teal-700"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
};

function SelectField({ label, name, options, defaultValue }: SelectFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-ink" htmlFor={name}>
        {label}
      </label>
      <select
        key={`${name}-${defaultValue ?? ""}`}
        id={name}
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-teal-700"
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
