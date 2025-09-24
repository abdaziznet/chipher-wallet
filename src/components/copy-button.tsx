
'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyButtonProps extends ButtonProps {
  valueToCopy: string;
  tooltip?: string;
}

export function CopyButton({
  valueToCopy,
  children,
  tooltip,
  ...props
}: CopyButtonProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = () => {
    if (!valueToCopy) {
      toast({
        variant: 'destructive',
        title: 'Nothing to copy',
      });
      return;
    }
    navigator.clipboard.writeText(valueToCopy);
    setHasCopied(true);
    toast({
      title: 'Copied to clipboard!',
      description: 'The value has been successfully copied.',
    });
  };

  const button = (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      {...props}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        children || <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}