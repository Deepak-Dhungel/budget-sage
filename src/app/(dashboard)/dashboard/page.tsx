import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) redirect("/onboarding");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="rounded-xl border border-zinc-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Welcome to BudgetSage
        </h1>
        <p className="mt-2 text-zinc-500">Signed in as {user.email}</p>
      </div>
    </div>
  );
}
