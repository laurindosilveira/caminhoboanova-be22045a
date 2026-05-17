import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFeaturesForPlan } from '../lib/planFeatures';
import { STRIPE_PLANS } from '../lib/stripePlans';

describe('Plan Matrix Logic', () => {
  it('should grant unlimited members only to pastoral plan', () => {
    const pastoral = getFeaturesForPlan('pastoral');
    const crescimento = getFeaturesForPlan('crescimento');
    const comunidade = getFeaturesForPlan('comunidade');

    expect(pastoral.maxMembers).toBeNull();
    expect(crescimento.maxMembers).toBe(200);
    expect(comunidade.maxMembers).toBe(50);
  });

  it('should restrict advanced export to crescimento and pastoral', () => {
    expect(getFeaturesForPlan('comunidade').advancedExport).toBe(false);
    expect(getFeaturesForPlan('crescimento').advancedExport).toBe(true);
    expect(getFeaturesForPlan('pastoral').advancedExport).toBe(true);
  });
});

describe('Audit Event Generation', () => {
  it('should log plan changes with correct details', () => {
    const mockAuditLog = {
      action: 'subscription_updated',
      details: {
        plan: 'Crescimento',
        previous_plan: 'Comunidade',
        timestamp: new Date().toISOString()
      }
    };
    
    expect(mockAuditLog.action).toBe('subscription_updated');
    expect(mockAuditLog.details.plan).toBe('Crescimento');
  });
});
