import { redirect } from "@tanstack/react-router";
import { getRefreshTokenService } from "@/api/services";
import { authGetter, authSetter } from "@/store";

export interface AuthRedirectSearch {
  redirect?: string;
}

const isSafeRedirect = (value: string) => {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  return !value.startsWith("/login") && !value.startsWith("/register");
};

export const sanitizeRedirectTo = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  return isSafeRedirect(value) ? value : undefined;
};

export const parseAuthRedirectSearch = (
  search: Record<string, unknown>
): AuthRedirectSearch => ({
  redirect: sanitizeRedirectTo(search.redirect),
});

export const getPostAuthRedirectTo = (redirectTo?: string) =>
  sanitizeRedirectTo(redirectTo) ?? "/focus";

export const ensureAccessToken = async () => {
  const accessToken = authGetter();

  if (accessToken) {
    return accessToken;
  }

  try {
    const refreshedTokens = await getRefreshTokenService();
    authSetter(refreshedTokens.accessToken);
    return refreshedTokens.accessToken;
  } catch {
    authSetter(null);
    return null;
  }
};

export const requireAuth = async (redirectTo?: string) => {
  const accessToken = await ensureAccessToken();

  if (!accessToken) {
    const safeRedirectTo = sanitizeRedirectTo(redirectTo);

    throw redirect({
      to: "/login",
      search: safeRedirectTo ? { redirect: safeRedirectTo } : {},
    });
  }

  return accessToken;
};

export const redirectIfAuthenticated = async (redirectTo?: string) => {
  const accessToken = await ensureAccessToken();

  if (accessToken) {
    throw redirect({ to: getPostAuthRedirectTo(redirectTo) as any });
  }
};
