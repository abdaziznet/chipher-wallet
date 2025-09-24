
'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { generatePasswordAction } from '@/app/generator/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from './copy-button';

export function PasswordGeneratorForm() {
  const { toast } = useToast();
  const [generatedPassword, setGeneratedPassword] = React.useState('');
  const [passwordLength, setPasswordLength] = React.useState(16);
  const [includeNumbers, setIncludeNumbers] = React.useState(true);
  const [includeSymbols, setIncludeSymbols] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGeneratePassword = React.useCallback(async () => {
    setIsGenerating(true);
    const result = await generatePasswordAction({
      length: passwordLength,
      includeNumbers,
      includeSymbols,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.password) {
      setGeneratedPassword(result.password);
      toast({
        variant: 'success',
        title: 'Password Generated',
        description: 'A new secure password has been created.',
      });
    }
    setIsGenerating(false);
  }, [passwordLength, includeNumbers, includeSymbols, toast]);

  React.useEffect(() => {
    handleGeneratePassword();
  }, [handleGeneratePassword]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your New Password</CardTitle>
        <CardDescription>
          Use the options below to customize your password, then copy it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Input
            readOnly
            value={generatedPassword}
            placeholder="Click 'Generate' to create a password"
            className="pr-20 text-lg font-mono"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
            <CopyButton valueToCopy={generatedPassword} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGeneratePassword}
              disabled={isGenerating}
            >
              <RefreshCw className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="length">Password Length</Label>
              <span className="text-sm font-medium">{passwordLength}</span>
            </div>
            <Slider
              id="length"
              min={8}
              max={64}
              step={1}
              value={[passwordLength]}
              onValueChange={(value) => setPasswordLength(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))}
            />
            <Label htmlFor="numbers" className="font-normal">
              Include Numbers (e.g., 123456)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))}
            />
            <Label htmlFor="symbols" className="font-normal">
              Include Symbols (e.g., @#$%)
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleGeneratePassword}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Password'}
        </Button>
      </CardFooter>
    </Card>
  );
}
