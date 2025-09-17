
'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePasswordAction } from '@/app/generator/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { CopyButton } from './copy-button';
import { Bot, Sparkles } from 'lucide-react';

const formSchema = z.object({
  length: z.coerce.number().min(8).max(64),
});

type FormValues = z.infer<typeof formSchema>;

const initialState = {
  password: '',
  error: '',
};

export function PasswordGeneratorForm() {
  const [state, formAction] = useActionState(generatePasswordAction, initialState);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 16,
    },
  });

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <div className="relative">
          <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            readOnly
            value={state?.password || 'Your generated password will appear here'}
            className="pl-10 pr-12 text-lg h-12 font-mono"
          />
          {state?.password && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <CopyButton valueToCopy={state.password} />
            </div>
          )}
        </div>
        {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <div className="space-y-6 rounded-lg border p-6">
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                    <FormLabel>Password Length</FormLabel>
                    <span className="text-sm font-medium text-primary">{field.value}</span>
                </div>
                <FormControl>
                  <Slider
                    min={8}
                    max={64}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                    Choose the length of your password (between 8 and 64 characters).
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Password
        </Button>
      </form>
    </Form>
  );
}
