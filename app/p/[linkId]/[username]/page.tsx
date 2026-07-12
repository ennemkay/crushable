import Link from "next/link";
import { ProfileCard } from "@/components/profile/profile-card";

type PublicProfilePageProps = {
  params: Promise<{
    linkId: string;
    username: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { linkId, username } = await params;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-3xl content-center gap-5 px-5 py-8">
      <ProfileCard
        displayName={username}
        description="Public profile links show photos and description by default. Additional fields are user-configurable."
      />
      <div className="flex items-center justify-between rounded-lg border border-line bg-white p-4">
        <p className="text-sm text-muted">Link token: {linkId}</p>
        <Link
          href={`/p/${linkId}/${username}/contact`}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
