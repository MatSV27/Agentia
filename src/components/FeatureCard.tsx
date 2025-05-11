
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  iconBgColor = "bg-brand-purple/10",
  iconColor = "text-brand-purple"
}: FeatureCardProps) => {
  return (
    <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", iconBgColor)}>
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
