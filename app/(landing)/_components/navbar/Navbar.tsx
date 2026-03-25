import { AppLogo } from '@/components/logo/Logo';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AuthButton } from "./AuthButton";
import NavMenu from "./Menu";

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
         <AppLogo />

        <div className="hidden lg:block">
          <NavMenu orientation="desktop" />
        </div>

        <div className="flex items-center gap-2">
          <AuthButton />
          <div className='hidden md:block'>
            <ThemeToggle />
          </div>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">Main navigation links</SheetDescription>
              <SheetHeader>
                 <AppLogo />
              </SheetHeader>
              
              <NavMenu orientation="mobile" />
              <SheetFooter>
                <ThemeToggle />
              </SheetFooter>
            </SheetContent>
            
          </Sheet>
        </div>
      </div>
    </nav>
  )
}