import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PageShell({
  children,
  wide = false,
  showFooter = true,
}: {
  children: ReactNode;
  wide?: boolean;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="conteudo" className="flex-1">
        <div className={wide ? "mx-auto w-full max-w-[1500px] px-4 py-6" : "mx-auto w-full max-w-6xl px-4 py-10"}>
          {children}
        </div>
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
