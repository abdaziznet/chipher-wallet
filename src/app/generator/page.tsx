
import { PasswordGeneratorForm } from '@/components/password-generator-form';

export default function GeneratorPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold font-headline">Password Generator</h1>
        <p className="text-muted-foreground">
          Create strong and secure passwords to protect your accounts.
        </p>
      </div>
      <PasswordGeneratorForm />
    </div>
  );
}
