import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-4">{children}</main>
    </div>
  );
}
