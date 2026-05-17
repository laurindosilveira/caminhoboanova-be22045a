import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAppInstalled } from '../src/lib/utils';

describe('Redirection Logic Heuristics', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('navigator', { userAgent: 'mozilla/5.0' });
  });

  it('should detect web visitor (default)', () => {
    expect(isAppInstalled()).toBe(false);
  });

  it('should detect standalone mode (PWA installed)', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    expect(isAppInstalled()).toBe(true);
  });

  it('should detect webview mode via UserAgent', () => {
    vi.stubGlobal('navigator', { userAgent: 'mozilla/5.0 android webview' });
    expect(isAppInstalled()).toBe(true);
  });

  it('should detect app active via LocalStorage flag', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('true');
    expect(isAppInstalled()).toBe(true);
  });
});
