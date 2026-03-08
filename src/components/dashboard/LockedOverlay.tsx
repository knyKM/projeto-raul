import { ReactNode } from "react";
import { Lock, Crown, Zap } from "lucide-react";
import { Feature, hasFeature, getRequiredTierLabel, getRequiredTier } from "@/lib/featureAccess";
import { LicenseTier } from "@/lib/configStore";
import { cn } from "@/lib/utils";

interface LockedOverlayProps {
  feature: Feature;
  children: ReactNode;
  className?: string;
  /** If true, completely hides content instead of blurring */
  hideContent?: boolean;
}

const tierColors: Record<LicenseTier, string> = {
  free: "text-muted-foreground",
  pro: "text-secondary",
  proplus: "text-primary",
};

const tierIcons: Record<LicenseTier, typeof Lock> = {
  free: Lock,
  pro: Crown,
  proplus: Zap,
};

/**
 * Wraps content that requires a specific license tier.
 * If the user doesn't have the required tier, shows a blur overlay with upgrade prompt.
 * 
 * IMPORTANT: This is a visual lock only. The API backend MUST also enforce
 * feature access based on the license tier stored in the database.
 * Never trust client-side tier checks for security-critical operations.
 */
const LockedOverlay = ({ feature, children, className, hideContent = false }: LockedOverlayProps) => {
  const unlocked = hasFeature(feature);

  if (unlocked) {
    return <>{children}</>;
  }

  const requiredTier = getRequiredTier(feature);
  const tierLabel = getRequiredTierLabel(feature);
  const TierIcon = tierIcons[requiredTier];
  const tierColor = tierColors[requiredTier];

  return (
    <div className={cn("relative", className)}>
      {/* Blurred content — purely decorative, no interaction possible */}
      <div
        className={cn(
          "pointer-events-none select-none",
          hideContent ? "opacity-0 h-0 overflow-hidden" : "blur-[6px] opacity-40"
        )}
        aria-hidden="true"
        tabIndex={-1}
        // Prevent any keyboard/focus interaction with locked content
        onFocus={(e) => e.preventDefault()}
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center z-10 rounded-lg",
        "bg-background/60 backdrop-blur-sm"
      )}>
        <div className="flex flex-col items-center gap-3 p-6 max-w-sm text-center">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "bg-muted border-2 border-border"
          )}>
            <TierIcon className={cn("w-6 h-6", tierColor)} />
          </div>
          <div>
            <p className="font-display font-bold text-foreground text-base">
              Recurso exclusivo do plano {tierLabel}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Faça upgrade para desbloquear esta funcionalidade.
            </p>
          </div>
          <a
            href="#/dashboard/settings"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Crown className="w-4 h-4" />
            Ver Planos
          </a>
        </div>
      </div>
    </div>
  );
};

export default LockedOverlay;
