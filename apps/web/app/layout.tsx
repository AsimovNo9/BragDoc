import type { ReactNode } from "react";

export const metadata = {
  title: "WinLog",
  description: "A local-first work achievement journal.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
