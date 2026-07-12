type EmailLinkFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  error?: string;
};

const errorMessages: Record<string, string> = {
  "invalid-email": "Enter a valid email address.",
};

export function EmailLinkForm({ action, submitLabel, error }: EmailLinkFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-bold text-ink" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-teal-700"
          placeholder="you@example.com"
        />
        {error ? (
          <p className="text-sm font-semibold text-red-700">
            {errorMessages[error] ?? "Something went wrong. Try again."}
          </p>
        ) : null}
      </div>
      <button className="min-h-11 rounded-md bg-teal-700 px-4 py-2 font-black text-white" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
