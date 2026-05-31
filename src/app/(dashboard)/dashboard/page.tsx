import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "unknown";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="rounded-xl border border-zinc-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Welcome to BudgetSage
        </h1>
        <p className="mt-2 text-zinc-500">Signed in as {email}</p>
      </div>
    </div>
  );
}
