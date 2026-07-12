type ProfileCardProps = {
  displayName: string;
  description: string;
};

export function ProfileCard({ displayName, description }: ProfileCardProps) {
  return (
    <article className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="aspect-[4/3] rounded-md bg-[#dfe7e2]" />
      <div>
        <h2 className="text-2xl font-black text-ink">{displayName}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </article>
  );
}
