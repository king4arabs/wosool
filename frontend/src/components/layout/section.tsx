import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "default" | "muted" | "dark";
}

const variantStyles: Record<NonNullable<SectionProps["variant"]>, string> = {
  default: "bg-white text-primary",
  muted: "bg-muted text-primary",
  dark: "bg-primary text-white",
};

export function Section({
  title,
  subtitle,
  children,
  className,
  variant = "default",
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-20 lg:py-24", variantStyles[variant], className)} {...props}>
      <Container>
        {(title || subtitle) && (
          <div className="mb-12 max-w-3xl text-center lg:mx-auto">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "mt-4 text-lg leading-relaxed",
                  variant === "dark" ? "text-white/70" : "text-secondary/70"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
