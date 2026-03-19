const SESSION_KEY = 'bkt_session';

/** Mark the current browser session as authenticated. */
export function setSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1');
}

/** Remove the session, effectively signing the user out. */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Returns true when an active session exists. */
export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
