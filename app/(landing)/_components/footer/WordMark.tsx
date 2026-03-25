import { APP_CONSTANTS } from "@/constants"
import { cn } from "@/lib/utils"

type WordMarkProps = {
  align?: "left" | "right"
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = {
  sm: "text-[clamp(48px,8vw,96px)]",
  md: "text-[clamp(64px,12vw,120px)]",
  lg: "text-[clamp(72px,14vw,140px)]",
}

export function WordMark({ align = "left", size = "md", className }: WordMarkProps) {
  return (
    <div className={cn(
      "overflow-hidden leading-none mt-1",
      align === "right" && "flex justify-end",
      className
    )}>
      <span
        className={cn(
          "font-black font-serif tracking-tighter select-none text-transparent bg-clip-text whitespace-nowrap",
          sizes[size]
        )}
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(var(--foreground) / 0.08) 0%, transparent 100%)" }}
      >
        {APP_CONSTANTS.name}
      </span>
    </div>
  )
}