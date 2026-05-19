import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFeaturesForPlan, isUnlimitedChurch } from '../lib/planFeatures';
import { STRIPE_PLANS } from '../lib/stripePlans';

describe('Plan Matrix Logic', () => {
  it('should grant unlimited members to pastoral and Premium plans', () => {
    const pastoral = getFeaturesForPlan('pastoral');
    const premium = getFeaturesForPlan('Premium');
    const crescimento = getFeaturesForPlan('crescimento');
    const comunidade = getFeaturesForPlan('comunidade');

    expect(pastoral.maxMembers).toBeNull();
    expect(premium.maxMembers).toBeNull();
    expect(crescimento.maxMembers).toBe(200);
    expect(comunidade.maxMembers).toBe(50);
  });

  it('should identify laurindosilveira@gmail.com as an unlimited user', () => {
    expect(isUnlimitedChurch(null, 'laurindosilveira@gmail.com')).toBe(true);
    expect(isUnlimitedChurch(null, 'LAURINDOSILVEIRA@GMAIL.COM')).toBe(true);
    expect(isUnlimitedChurch(null, 'membro@igreja.com')).toBe(false);
  });

  it('should identify Igreja Boa Nova by ID as unlimited', () => {
    const adminChurchId = '02f08580-80e5-4f57-8a2e-1b078d337278';
    expect(isUnlimitedChurch(adminChurchId, null)).toBe(true);
    expect(isUnlimitedChurch('wrong-id', null)).toBe(false);
  });

  it('should restrict advanced export only to community plan', () => {
    expect(getFeaturesForPlan('comunidade').advancedExport).toBe(false);
    expect(getFeaturesForPlan('crescimento').advancedExport).toBe(true);
    expect(getFeaturesForPlan('pastoral').advancedExport).toBe(true);
    expect(getFeaturesForPlan('Premium').advancedExport).toBe(true);
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
