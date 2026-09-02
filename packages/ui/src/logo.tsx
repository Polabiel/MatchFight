import { cn } from "@acme/ui";

/**
 * MatchFight brand lockup.
 * "Match" in foreground (charcoal/white) + "Fight" in Blood Red (primary).
 * The red "Fight" span is exempt from the One Accent Rule (brand element).
 * Wrap in a `<Link>`/`<a>` when a navigation target is needed.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-1", className)}>
      <span className="text-headline-md text-foreground">Match</span>
      <span className="text-headline-md text-primary">Fight</span>
    </span>
  );
}
