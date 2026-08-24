import { AnnouncementBanner } from "@/components/Components/announcementBanner"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      {children}
    </div>
  )
}