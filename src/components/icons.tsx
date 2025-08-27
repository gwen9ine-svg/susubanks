import { cn } from "@/lib/utils";
import { CircleDollarSign } from "lucide-react";

type LogoProps = {
  isBank?: boolean;
  className?: string;
};

export function SusuLogo({ isBank = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <CircleDollarSign className="h-6 w-6" />
      <span className="text-foreground">{isBank ? "Susu Bank" : "Susu"}</span>
    </div>
  );
}
