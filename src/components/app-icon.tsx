import { Github, Film, ShoppingCart, Globe, X, Bot, Facebook, Linkedin, Slack } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface AppIconProps extends LucideProps {
  appName: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  github: Github,
  twitter: X,
  x: X,
  netflix: Film,
  amazon: ShoppingCart,
  google: Bot,
  facebook: Facebook,
  linkedin: Linkedin,
  slack: Slack,
};

export function AppIcon({ appName, ...props }: AppIconProps) {
  const lowerCaseAppName = appName.toLowerCase();
  
  for (const keyword in iconMap) {
    if (lowerCaseAppName.includes(keyword)) {
      const IconComponent = iconMap[keyword];
      return <IconComponent {...props} />;
    }
  }
  
  return <Globe {...props} />;
}
