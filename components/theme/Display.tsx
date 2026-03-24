"use client"

import { ToastContent } from '@/components/toast/toast-content';
import { useToast } from '@/components/toast/use-toast-hook';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function Display() {
  const { toast } = useToast();

  return (
    <main className="space-y-12">
      <h1>Design System</h1>
      <p className="mb-8">
        This page showcases all the available colors, typography, and design tokens in your theme.
      </p>

      {/* Background Colors */}
      <section>
        <h2>Background Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-background border rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Background</p>
            <p className="text-sm text-muted-foreground">bg-background</p>
          </div>
          <div className="bg-foreground text-background rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Foreground</p>
            <p className="text-sm opacity-80">bg-foreground</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Card</p>
            <p className="text-sm text-muted-foreground">bg-card</p>
          </div>
          <div className="bg-popover border rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Popover</p>
            <p className="text-sm text-muted-foreground">bg-popover</p>
          </div>
          <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Primary</p>
            <p className="text-sm opacity-80">bg-primary</p>
          </div>
          <div className="bg-secondary text-secondary-foreground rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Secondary</p>
            <p className="text-sm opacity-80">bg-secondary</p>
          </div>
          <div className="bg-muted text-muted-foreground rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Muted</p>
            <p className="text-sm opacity-80">bg-muted</p>
          </div>
          <div className="bg-accent text-accent-foreground rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Accent</p>
            <p className="text-sm opacity-80">bg-accent</p>
          </div>
          <div className="bg-destructive text-destructive-foreground rounded-lg p-4 shadow-sm">
            <p className="font-semibold">Destructive</p>
            <p className="text-sm opacity-80">bg-destructive</p>
          </div>
        </div>
      </section>

      {/* Text Colors */}
      <section>
        <h2>Text Colors</h2>
        <div className="space-y-3 mt-4 p-6 border rounded-lg bg-card">
          <p className="text-foreground">text-foreground - Default text color</p>
          <p className="text-muted-foreground">text-muted-foreground - Muted text color</p>
          <p className="text-primary">text-primary - Primary color text</p>
          <p className="text-secondary-foreground">text-secondary-foreground - Secondary text</p>
          <p className="text-accent-foreground">text-accent-foreground - Accent text</p>
          <p className="text-destructive">text-destructive - Destructive/error text</p>
          <p className="text-card-foreground bg-card">text-card-foreground - Card text color</p>
        </div>
      </section>

      {/* Border Colors */}
      <section>
        <h2>Border Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div className="border border-border rounded-lg p-4">
            <p className="font-semibold">Border</p>
            <p className="text-sm text-muted-foreground">border-border</p>
          </div>
          <div className="border border-input rounded-lg p-4">
            <p className="font-semibold">Input</p>
            <p className="text-sm text-muted-foreground">border-input</p>
          </div>
          <div className="border border-ring rounded-lg p-4">
            <p className="font-semibold">Ring</p>
            <p className="text-sm text-muted-foreground">border-ring</p>
          </div>
        </div>
      </section>

      {/* Chart Colors */}
      <section>
        <h2>Chart Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-chart-1 rounded-lg p-4 h-24 flex items-end">
            <p className="text-white font-semibold">Chart 1</p>
          </div>
          <div className="bg-chart-2 rounded-lg p-4 h-24 flex items-end">
            <p className="text-white font-semibold">Chart 2</p>
          </div>
          <div className="bg-chart-3 rounded-lg p-4 h-24 flex items-end">
            <p className="text-white font-semibold">Chart 3</p>
          </div>
          <div className="bg-chart-4 rounded-lg p-4 h-24 flex items-end">
            <p className="text-white font-semibold">Chart 4</p>
          </div>
          <div className="bg-chart-5 rounded-lg p-4 h-24 flex items-end">
            <p className="text-white font-semibold">Chart 5</p>
          </div>
        </div>
      </section>

      {/* Typography Showcase */}
      <section>
        <h2>Typography</h2>
        <div className="space-y-6 mt-4 p-6 border rounded-lg bg-card">
          <div>
            <h1>Heading 1 (h1)</h1>
            <p className="text-sm text-muted-foreground mt-1">font-serif, 5xl-7xl, font-bold</p>
          </div>
          <div>
            <h2>Heading 2 (h2)</h2>
            <p className="text-sm text-muted-foreground mt-1">font-serif, 4xl-5xl, font-semibold</p>
          </div>
          <div>
            <h3>Heading 3 (h3)</h3>
            <p className="text-sm text-muted-foreground mt-1">font-serif, 2xl-3xl, font-semibold</p>
          </div>
          <div>
            <h4>Heading 4 (h4) - Monospace</h4>
            <p className="text-sm text-muted-foreground mt-1">font-mono, xl-2xl, font-medium</p>
          </div>
          <div>
            <p>Paragraph (p) - This is the default body text using Outfit font. It has a relaxed line height for better readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p className="text-sm text-muted-foreground mt-1">font-sans, text-base, leading-relaxed</p>
          </div>
          <div>
            <p className="text-large">Large text style</p>
            <p className="text-sm text-muted-foreground mt-1">.text-large - font-sans, text-lg to xl</p>
          </div>
          <div>
            <p className="text-small">Small text style</p>
            <p className="text-sm text-muted-foreground mt-1">.text-small - font-sans, text-sm</p>
          </div>
          <div>
            <blockquote>
              "This is a blockquote style with serif font, italic, and a left border."
            </blockquote>
            <p className="text-sm text-muted-foreground mt-1">blockquote - font-serif, italic, border-left</p>
          </div>
          <div>
            <p>Here's an example of <code>inline code</code> with monospace font.</p>
            <p className="text-sm text-muted-foreground mt-1">code - font-mono, bg-muted, rounded</p>
          </div>
          <div>
            <a href="#">This is a link with hover effects</a>
            <p className="text-sm text-muted-foreground mt-1">a - primary color, underline on hover</p>
          </div>
          <div>
            <ul>
              <li>Unordered list item 1</li>
              <li>Unordered list item 2</li>
              <li>Unordered list item 3</li>
            </ul>
            <ol>
              <li>Ordered list item 1</li>
              <li>Ordered list item 2</li>
              <li>Ordered list item 3</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-1">Lists - font-sans, proper spacing and padding</p>
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section>
        <h2>Component Examples</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Button Examples */}
          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <h3 className="text-xl font-semibold">Toasts</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => toast.success("Success!", {
                  description: "Your action was completed successfully.",
                  duration: 4000,
                })}
              >
                Success Toast
              </Button>
              
              <Button 
                onClick={() => toast.error("Error!", {
                  description: "Something went wrong. Please try again.",
                })}
              >
                Error Toast
              </Button>
              
              <Button 
                onClick={() => toast.info("Information", {
                  description: "Here's some helpful information for you.",
                })}
              >
                Info Toast
              </Button>
              
              <Button 
                onClick={() => toast.warning("Warning!", {
                  description: "Please review your input before proceeding.",
                })}
              >
                Warning Toast
              </Button>
              
              <Button 
                onClick={() => {
                  const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                  toast.promise(promise, {
                    loading: "Processing your request...",
                    success: "Request completed successfully!",
                    error: "Failed to process request.",
                  });
                }}
              >
                Promise Toast
              </Button>
              
              <Button 
                onClick={() => {
                  const id = toast.loading("Loading...", {
                    description: "This will take a moment",
                  });
                  
                  setTimeout(() => {
                    toast.dismiss(id);
                    toast.success("Loaded!", {
                      description: "Content loaded successfully",
                    });
                  }, 3000);
                }}
              >
                Loading with Dismiss
              </Button>
              
              <Button 
                onClick={() => {
                  toast.custom(
                    <ToastContent
                      title="Custom Styled Toast"
                      description="This toast uses your custom fonts and theme colors"
                      icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                    />,
                    {
                      duration: 5000,
                    }
                  );
                }}
              >
                Custom Toast
              </Button>
            </div>
          </div>

          {/* Card Examples */}
          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold">Cards</h3>
            <div className="border rounded-lg p-4 bg-card shadow-sm">
              <h4 className="text-lg font-semibold mb-2">Card Title</h4>
              <p className="text-muted-foreground">This is a card component using theme colors.</p>
            </div>
            <div className="border rounded-lg p-4 bg-muted">
              <h4 className="text-lg font-semibold mb-2">Muted Card</h4>
              <p className="text-muted-foreground">Another card variant with muted background.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Mode Toggle Note */}
      <section className="p-4 bg-muted rounded-lg border">
        <h3 className="font-semibold mb-2">Dark Mode Support</h3>
        <p className="text-muted-foreground">
          This theme includes dark mode variables. Add a theme toggle to switch between light and dark modes.
          All colors will automatically adjust based on the `.dark` class.
        </p>
      </section>
    </main>
  );
}