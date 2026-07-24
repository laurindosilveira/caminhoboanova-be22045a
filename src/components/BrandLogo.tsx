import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  inverse?: boolean;
  compact?: boolean;
}

export default function BrandLogo({
  className,
  markClassName,
  inverse = false,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <img
        src={inverse ? "/discipulado-3m-mark-white.png" : "/discipulado-3m-mark.png"}
        alt=""
        aria-hidden="true"
        className={cn("h-12 w-12 object-contain", markClassName)}
      />
      {!compact && (
        <div className={cn("leading-none", inverse ? "text-white" : "text-foreground")}>
          <span className="block font-inter text-[0.62rem] font-extrabold uppercase tracking-[0.28em]">
            Discipulado
          </span>
          <span className="mt-0.5 block font-montserrat text-3xl font-black tracking-[-0.04em]">
            3M
          </span>
        </div>
      )}
    </div>
  );
}
