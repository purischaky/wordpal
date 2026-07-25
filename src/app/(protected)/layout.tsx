import { NavBar } from "@/components/layout/NavBar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="flex-1 py-6">{children}</main>
    </>
  );
}
