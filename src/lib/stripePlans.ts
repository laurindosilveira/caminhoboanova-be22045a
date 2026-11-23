export const STRIPE_PLANS = {
  comunidade: {
    name: "Comunidade",
    price_id: "price_1TukmLJHIVmo8Dvw2OU1NIzy",
    product_id: "prod_UuZw2jt79ka7I3",
    price: "R$ 79",
    period: "/mês",
  },
  crescimento: {
    name: "Crescimento",
    price_id: "price_1TukjMJHIVmo8DvwenID0H30",
    product_id: "prod_UuZtkU2SzqH0yK",
    price: "R$ 129",
    period: "/mês",
  },
  pastoral: {
    name: "Pastoral",
    price_id: "price_1TukjyJHIVmo8DvwAEQwsLsL",
    product_id: "prod_UuZtWDMyJCVaaN",
    price: "R$ 199",
    period: "/mês",
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

export function getPlanByProductId(productId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.product_id === productId) return key as PlanKey;
  }
  return null;
}
