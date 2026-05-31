"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

const EXAMPLES = [
  {
    query: "Can I afford a $200 dinner tonight?",
    response:
      "You have $340 left this month. Dining is at $95 of your $150 budget — dinner works, but keep it under $150 to stay on track.",
    agent: "Budget Agent",
  },
  {
    query: "Where am I overspending this month?",
    response:
      "Food & Dining is 40% over at $210 vs $150 budget. Coffee shops are the main driver — $68 this week alone.",
    agent: "Spending Analysis",
  },
  {
    query: "Help me save $500 before December.",
    response:
      "You need $125/week. Cutting dining to $80/week and pausing 2 unused subscriptions gets you there in 4 weeks.",
    agent: "Planning Agent",
  },
];

export default function HomePage() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mouse, setMouse] = useState({ x: 65, y: 40 });
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % EXAMPLES.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  function goTo(i: number) {
    if (i === active) return;
    setVisible(false);
    setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 350);
  }

  const current = EXAMPLES[active];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] flex flex-col">

      {/* ── Background ── */}

      {/* Dot grid — fades out toward centre so content stays readable */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, black 80%)",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, black 80%)",
        }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right — indigo */}
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: -200,
            right: -180,
            background:
              "radial-gradient(circle, rgba(129,140,248,0.40) 0%, rgba(99,102,241,0.10) 70%)",
            filter: "blur(80px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
        {/* Bottom-left — violet */}
        <div
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            bottom: -160,
            left: -140,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(139,92,246,0.08) 70%)",
            filter: "blur(90px)",
            animation: "float 13s ease-in-out infinite",
            animationDelay: "3.5s",
          }}
        />
        {/* Mid-right — emerald accent */}
        <div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            top: "38%",
            right: "22%",
            background:
              "radial-gradient(circle, rgba(110,231,183,0.22) 0%, rgba(52,211,153,0.05) 70%)",
            filter: "blur(70px)",
            animation: "float 15s ease-in-out infinite",
            animationDelay: "7s",
          }}
        />
      </div>

      {/* Interactive mouse spotlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(650px circle at ${mouse.x}% ${mouse.y}%, rgba(99,102,241,0.09), transparent 70%)`,
        }}
      />

      {/* ── Nav ── */}
      <header className="relative z-10 border-b border-white/70 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            Budget<span className="text-indigo-600">Sage</span>
          </span>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
            >
              Sign in →
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-5xl flex-col items-center gap-14 lg:flex-row">

          {/* Left: copy */}
          <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 self-center rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm lg:self-start">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              AI-powered finance copilot
            </div>

            <h1 className="text-[3.25rem] font-bold leading-[1.1] tracking-tight text-zinc-900">
              Stop guessing.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
                }}
              >
                Know your money.
              </span>
            </h1>

            <p className="max-w-sm text-base leading-relaxed text-zinc-500">
              BudgetSage tracks spending, monitors subscriptions, and answers
              your money questions — grounded in your real data.
            </p>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/sign-up"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-px hover:bg-indigo-700 hover:shadow-indigo-500/40"
              >
                Get started free
              </Link>
              <Link
                href="/sign-in"
                className="rounded-lg border border-zinc-200/80 bg-white/70 px-5 py-2.5 text-sm font-medium text-zinc-700 backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 hover:bg-white"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right: chat card */}
          <div className="w-full max-w-sm flex-1">
            <div
              className="overflow-hidden rounded-2xl bg-white/65 backdrop-blur-xl"
              style={{
                border: "1px solid rgba(255,255,255,0.85)",
                boxShadow:
                  "0 20px 60px -10px rgba(99,102,241,0.15), 0 8px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-100/60 bg-white/40 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-medium text-zinc-600">
                  BudgetSage Copilot
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>

              {/* Messages */}
              <div
                className="flex min-h-40 flex-col gap-3 p-4"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2 text-sm text-white shadow-sm">
                    {current.query}
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    S
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-zinc-100/80 px-3.5 py-2 text-sm text-zinc-700">
                      {current.response}
                    </div>
                    <span className="ml-1 text-[11px] text-zinc-400">
                      {current.agent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dot nav */}
              <div className="flex justify-center gap-1.5 pb-4">
                {EXAMPLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-4 bg-indigo-500"
                        : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-400">
              Click the dots to explore examples
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
