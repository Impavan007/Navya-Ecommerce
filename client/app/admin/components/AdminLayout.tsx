'use client';

/**
 * @deprecated This layout is now handled globally in app/admin/layout.tsx
 * Individual pages no longer need to wrap their content in <adminLayout>.
 */
export default function adminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

