
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSession } from '@/contexts/session-context';
import { checkBreaches, type BreachCheckOutput } from '@/ai/flows/breach-monitoring-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ShieldCheck, ShieldX, RefreshCw, ServerCrash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreachMonitoringPage() {
  const { currentUser } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<BreachCheckOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: currentUser?.email || '',
    },
  });
  
  React.useEffect(() => {
    if (currentUser?.email) {
        form.reset({ email: currentUser.email });
    }
  }, [currentUser, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await checkBreaches(values.email);
      setResult(response);
    } catch (error) {
      console.error('Breach check failed:', error);
      setResult({ breaches: [], error: 'Failed to communicate with the breach monitoring service.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold font-headline">Breach Monitoring</h1>
        <p className="text-muted-foreground">
          Check if your email address has been exposed in a data breach.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Check for Breaches</CardTitle>
          <CardDescription>
            Enter an email address below to see if it has appeared in any known data breaches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                Check Now
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Scanning for breaches...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-4">
            {result.error && (
                 <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                </Alert>
            )}

            {!result.error && result.breaches.length === 0 && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                    <ShieldCheck className="h-4 w-4 !text-green-500" />
                    <AlertTitle>No Breaches Found</AlertTitle>
                    <AlertDescription>
                        Good news! We couldn't find this email in any known data breaches.
                    </AlertDescription>
                </Alert>
            )}
            
            {!result.error && result.breaches.length > 0 && (
                 <Alert variant="destructive">
                    <ShieldX className="h-4 w-4" />
                    <AlertTitle>{result.breaches.length} Breach(es) Found</AlertTitle>
                    <AlertDescription>
                        This email address was found in the following data breaches. We recommend changing your password for these services immediately.
                    </AlertDescription>
                </Alert>
            )}

            {result.breaches.map((breach, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="text-xl">{breach.name}</CardTitle>
                        <CardDescription>Breach Date: {breach.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm">{breach.description}</p>
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Compromised Data:</h4>
                            <div className="flex flex-wrap gap-2">
                                {breach.compromisedData.map(item => (
                                    <Badge key={item} variant="destructive">{item}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
