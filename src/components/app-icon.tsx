import { Github, Film, ShoppingCart, Globe, X } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface AppIconProps extends LucideProps {
  appName: string;
}

export function AppIcon({ appName, ...props }: AppIconProps) {
  const lowerCaseAppName = appName.toLowerCase();

  if (lowerCaseAppName.includes('github')) {
    return <Github {...props} />;
  }
  if (lowerCaseAppName.includes('twitter') || lowerCaseAppName.includes('x')) {
    return <X {...props} />;
  }
  if (lowerCaseAppName.includes('netflix')) {
    return <Film {...props} />;
  }
  if (lowerCaseAppName.includes('amazon')) {
    return <ShoppingCart {...props} />;
  }
  
  return <Globe {...props} />;
}
