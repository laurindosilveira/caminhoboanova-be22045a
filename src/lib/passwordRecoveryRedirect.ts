const RECOVERY_PATH = "/redefinir-senha";

export function isPasswordRecoveryUrl(pathname: string, search: string, hash: string) {
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  return (
    // Already on the reset page (block auth events regardless of code presence,
    // since Supabase removes ?code= from the URL before events fire)
    pathname === RECOVERY_PATH ||
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery" ||
    // PKCE code present anywhere — will be (or already was) redirected to recovery page
    searchParams.has("code")
  );
}

export function getPasswordRecoveryRedirect(pathname: string, search: string, hash: string) {
  if (pathname === RECOVERY_PATH) return null;

  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  if (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery" ||
    searchParams.has("code")
  ) {
    return `${RECOVERY_PATH}${search}${hash}`;
  }

  return null;
}
