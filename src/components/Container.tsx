import { Header } from "./Header";
import { Footer } from "./Footer";

export function Container({
  authed = true,
  children,
}: {
  authed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header authed={authed} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}
