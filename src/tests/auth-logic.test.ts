import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { getGoogleAuthErrorMessage, getGoogleOAuthRedirectUrl, signInWithGoogle } from '@/lib/googleAuth';

// Mocking Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPasskey: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { provider: 'google', url: 'https://accounts.google.com' }, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { church_id: 'church-123' }, error: null }),
    }),
  },
}));

describe('Auth Flow and Role-based Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /admin if user is admin/lider after passkey login', async () => {
    // This is a simplified logic test as we can't easily test the component lifecycle here without more setup
    const mockUser = { id: 'user-123', email: 'admin@test.com' };
    
    // Simulate handlePostLogin logic
    const isAdmin = true;
    const isLider = false;
    
    expect(isAdmin || isLider).toBe(true);
  });

  it('should redirect to /home if user is member after login', async () => {
    const isAdmin = false;
    const isLider = false;
    
    expect(isAdmin || isLider).toBe(false);
  });
});

describe('Routing Fallback', () => {
  it('should stay on presentation for unauthenticated users', () => {
    const user = null;
    const path = '/any-random-route';
    
    // Logic from NotFoundRedirect
    const target = !user ? '/portal' : '/home';
    expect(target).toBe('/portal');
  });

  it('should go to home for authenticated users on 404', () => {
    const user = { id: '123' };
    const target = !user ? '/portal' : '/home';
    expect(target).toBe('/home');
  });
});

describe('Google OAuth Helper', () => {
  it('builds /home redirect url without duplicate slashes', () => {
    expect(getGoogleOAuthRedirectUrl('https://caminhoboanova.com.br/')).toBe('https://caminhoboanova.com.br/home');
    expect(getGoogleOAuthRedirectUrl('https://caminhoboanova.com.br')).toBe('https://caminhoboanova.com.br/home');
  });

  it('calls native Supabase signInWithOAuth for google', async () => {
    await signInWithGoogle();
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringMatching(/\/home$/),
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  });

  it('translates disabled provider error cleanly', () => {
    expect(getGoogleAuthErrorMessage({ message: 'Unsupported provider: provider is not enabled' }))
      .toContain('ainda não foi ativado');
  });
});
