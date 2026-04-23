import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import FloatingDemoButton from "@/components/shared/FloatingDemoButton";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingDemoButton />
    </>
  );
}
