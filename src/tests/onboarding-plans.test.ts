import { describe, it, expect, vi } from 'vitest';
import { STRIPE_PLANS } from '../lib/stripePlans';

describe('Onboarding Plan Selection', () => {
  it('should map each plan key to the correct Stripe price_id', () => {
    expect(STRIPE_PLANS.comunidade.price_id).toBe('price_1TBxbuJkqgigBrKjPIcaDUHo');
    expect(STRIPE_PLANS.crescimento.price_id).toBe('price_1TBxcUJkqgigBrKjg0It5Sko');
    expect(STRIPE_PLANS.pastoral.price_id).toBe('price_1TBxhiJkqgigBrKj55dyOxvA');
  });

  it('should have correct pricing labels for all plans', () => {
    expect(STRIPE_PLANS.comunidade.price).toContain('R$ 79');
    expect(STRIPE_PLANS.crescimento.price).toContain('R$ 129');
    expect(STRIPE_PLANS.pastoral.price).toContain('R$ 199');
  });

  it('should ensure all plans are monthly', () => {
    Object.values(STRIPE_PLANS).forEach(plan => {
      expect(plan.period).toBe('/mês');
    });
  });
});

describe('Trial Logic Simulation', () => {
  it('should calculate 30 days trial from a fixed start date', () => {
    const startDate = new Date('2024-05-17T12:00:00Z');
    const trialEndsAt = new Date(startDate);
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    
    expect(trialEndsAt.toISOString()).toBe('2024-06-16T12:00:00.000Z');
  });
});
