import { FooterExtensive } from "../(landing)/_components/footer/footer-extensive";
import Navbar from "../(landing)/_components/navbar/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-1">
        {children}
      </main>
      <FooterExtensive />
    </div>
  )
}