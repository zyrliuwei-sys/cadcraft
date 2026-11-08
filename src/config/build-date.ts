declare const __BUILD_DATE__: string;

// Replaced once by Vite, shared by SSR and the client (no hydration date drift).
export const BUILD_DATE = __BUILD_DATE__;
