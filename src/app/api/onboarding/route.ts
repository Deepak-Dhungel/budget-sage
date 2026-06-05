import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/validators/onboarding.schema";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already completed onboarding
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) {
    return NextResponse.json(
      { error: "Onboarding already completed" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const {
    monthlyIncome,
    monthlyBudget,
    currency,
    monthlySavingsGoal,
    essentials,
    subscriptions,
    categories,
  } = parsed.data;

  if (monthlyBudget > monthlyIncome) {
    return NextResponse.json(
      { error: "Monthly budget cannot exceed monthly income" },
      { status: 422 }
    );
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  // Deadline for the savings goal: 1 month from now
  const goalDeadline = new Date();
  goalDeadline.setMonth(goalDeadline.getMonth() + 1);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clerkId,
          email,
          monthlyIncome,
          monthlyBudget,
          currency,
        },
      });

      // Essentials → Subscription records with category = 'essential'
      if (essentials.length > 0) {
        await tx.subscription.createMany({
          data: essentials.map((e) => ({
            userId: user.id,
            name: e.name,
            amount: e.amount,
            category: "essential",
          })),
        });
      }

      // Lifestyle subscriptions
      if (subscriptions.length > 0) {
        await tx.subscription.createMany({
          data: subscriptions.map((s) => ({
            userId: user.id,
            name: s.name,
            amount: s.amount,
            category: "lifestyle",
          })),
        });
      }

      // Budget categories
      if (categories.length > 0) {
        await tx.budgetCategory.createMany({
          data: categories.map((c) => ({
            userId: user.id,
            name: c.name,
            emoji: c.emoji,
            monthlyLimit: c.monthlyLimit,
          })),
        });
      }

      // Savings goal (optional)
      if (monthlySavingsGoal) {
        await tx.goal.create({
          data: {
            userId: user.id,
            title: `Save ${currency}${monthlySavingsGoal} monthly`,
            targetAmount: monthlySavingsGoal,
            deadline: goalDeadline,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding transaction failed:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding data. Please try again." },
      { status: 500 }
    );
  }
}
