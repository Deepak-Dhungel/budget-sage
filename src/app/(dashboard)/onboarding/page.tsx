import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // If user already completed onboarding, go to dashboard
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] flex flex-col">
      {/* Background orbs (reuses home page aesthetic) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            top: -160,
            right: -160,
            background:
              "radial-gradient(circle, rgba(129,140,248,0.30) 0%, rgba(99,102,241,0.08) 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            bottom: -120,
            left: -120,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(139,92,246,0.06) 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4d4d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, black 80%)",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, black 80%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/70 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            Budget<span className="text-indigo-600">Sage</span>
          </span>
          <span className="ml-3 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            Setup
          </span>
        </div>
      </header>

      {/* Wizard */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Let&apos;s set up your budget
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Takes about 3 minutes. You can always change these later.
          </p>
        </div>
        <OnboardingWizard />
      </main>
    </div>
  );
}
