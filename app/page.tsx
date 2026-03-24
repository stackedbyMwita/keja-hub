import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import Navbar from "@/components/layout/Navbar";
import Display from "@/components/theme/Display";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MaxWidthWrapper className="p-8">
        <Display />
      </MaxWidthWrapper>
    </div>
  );
}
