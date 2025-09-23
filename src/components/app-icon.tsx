
'use client';

import { Github, Figma,Twitch, Film, Gitlab, ShoppingCart, Globe, Youtube, Instagram, X, Bot, Facebook, Linkedin, Slack } from 'lucide-react';
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
  instagram: Instagram,
  youtube: Youtube,
  gitlab: Gitlab,
  figma: Figma,
  twitch: Twitch
};

export function AppIcon({ appName, ...props }: AppIconProps) {
  const lowerCaseAppName = appName.toLowerCase();

  for (const keyword in iconMap) {
    if (lowerCaseAppName.includes(keyword)) {
      const IconComponent = iconMap[keyword];
      return <IconComponent {...props} />;
    }
  }

  const initial = appName.charAt(0).toUpperCase();

  if (initial) {
    return (
      <span className="font-bold text-lg text-muted-foreground">{initial}</span>
    );
  }

  return <Globe {...props} />;
}
