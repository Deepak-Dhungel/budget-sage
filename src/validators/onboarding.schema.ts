import { z } from "zod";

const subscriptionItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

const categoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
  monthlyLimit: z.number().min(0, "Budget must be 0 or more"),
});

export const onboardingSchema = z
  .object({
    monthlyIncome: z.number().positive("Monthly income must be greater than 0"),
    monthlyBudget: z.number().positive("Monthly budget must be greater than 0"),
    currency: z.string().min(1).max(3),
    monthlySavingsGoal: z.number().positive().optional(),
    essentials: z
      .array(subscriptionItemSchema)
      .min(1, "Add at least one essential cost"),
    subscriptions: z.array(subscriptionItemSchema),
    categories: z.array(categoryItemSchema),
  })
  .refine(
    (d) => d.monthlyBudget + (d.monthlySavingsGoal ?? 0) <= d.monthlyIncome,
    {
      message:
        "Monthly spending budget and savings goal cannot exceed monthly income",
      path: ["monthlyBudget"],
    }
  );

export type OnboardingInput = z.infer<typeof onboardingSchema>;
