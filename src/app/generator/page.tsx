import { PasswordGeneratorForm } from '@/components/password-generator-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeneratorPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold font-headline">Password Generator</h1>
        <p className="text-muted-foreground">
          Create strong and secure passwords tailored to your needs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate a New Password</CardTitle>
          <CardDescription>
            Adjust the options below and let our AI generate a robust password for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordGeneratorForm />
        </CardContent>
      </Card>
    </div>
  );
}
