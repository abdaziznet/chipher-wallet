
'use client';

import * as React from 'react';
import * as CryptoJS from 'crypto-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/copy-button';
import { useSession } from '@/contexts/session-context';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, Key, ArrowRight } from 'lucide-react';

export default function ToolsPage() {
  const { currentUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [encryptInput, setEncryptInput] = React.useState('');
  const [encryptKey, setEncryptKey] = React.useState('');
  const [encryptOutput, setEncryptOutput] = React.useState('');

  const [decryptInput, setDecryptInput] = React.useState('');
  const [decryptKey, setDecryptKey] = React.useState('');
  const [decryptOutput, setDecryptOutput] = React.useState('');

  React.useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push('/');
    }
  }, [currentUser, router, toast]);

  const handleEncrypt = () => {
    if (!encryptInput || !encryptKey) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide both text and a key to encrypt.' });
      return;
    }
    try {
      const encrypted = CryptoJS.AES.encrypt(encryptInput, encryptKey).toString();
      setEncryptOutput(encrypted);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Encryption Failed', description: 'An unexpected error occurred.' });
    }
  };

  const handleDecrypt = () => {
    if (!decryptInput || !decryptKey) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide both encrypted text and a key to decrypt.' });
      return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(decryptInput, decryptKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption resulted in empty text. Check your key.');
      }
      setDecryptOutput(decrypted);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Decryption Failed', description: 'Could not decrypt the text. Please check your key and the input data.' });
    }
  };
  
  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold font-headline">Crypto Tools</h1>
        <p className="text-muted-foreground">
          Encrypt and decrypt text using AES with a password.
        </p>
      </div>
      <Tabs defaultValue="encrypt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encrypt">
            <Lock className="mr-2 h-4 w-4" /> Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt">
            <Unlock className="mr-2 h-4 w-4" /> Decrypt
          </TabsTrigger>
        </TabsList>
        <TabsContent value="encrypt">
          <Card>
            <CardHeader>
              <CardTitle>Encrypt Text</CardTitle>
              <CardDescription>Enter text and a password to generate an encrypted string.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encrypt-input">Text to Encrypt</Label>
                <Textarea
                  id="encrypt-input"
                  value={encryptInput}
                  onChange={(e) => setEncryptInput(e.target.value)}
                  placeholder="Paste your sensitive text here..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encrypt-key">Encryption Key</Label>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="encrypt-key"
                      type="password"
                      value={encryptKey}
                      onChange={(e) => setEncryptKey(e.target.value)}
                      placeholder="Your secret password"
                      className="pl-10"
                    />
                </div>
              </div>
              <Button onClick={handleEncrypt} className="w-full">
                Encrypt Text <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <Label htmlFor="encrypt-output">Encrypted Result</Label>
                <div className="relative">
                  <Textarea
                    id="encrypt-output"
                    value={encryptOutput}
                    readOnly
                    placeholder="Encrypted text will appear here..."
                    rows={4}
                    className="pr-12 bg-muted/50"
                  />
                  {encryptOutput && (
                     <div className="absolute right-2 top-2">
                        <CopyButton valueToCopy={encryptOutput} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="decrypt">
          <Card>
            <CardHeader>
              <CardTitle>Decrypt Text</CardTitle>
              <CardDescription>Enter encrypted text and the password to reveal the original content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="decrypt-input">Text to Decrypt</Label>
                <Textarea
                  id="decrypt-input"
                  value={decryptInput}
                  onChange={(e) => setDecryptInput(e.target.value)}
                  placeholder="Paste your encrypted string here..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decrypt-key">Decryption Key</Label>
                 <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="decrypt-key"
                      type="password"
                      value={decryptKey}
                      onChange={(e) => setDecryptKey(e.target.value)}
                      placeholder="The secret password used to encrypt"
                      className="pl-10"
                    />
                </div>
              </div>
              <Button onClick={handleDecrypt} className="w-full">
                Decrypt Text <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
               <div className="space-y-2">
                <Label htmlFor="decrypt-output">Decrypted Result</Label>
                 <div className="relative">
                  <Textarea
                    id="decrypt-output"
                    value={decryptOutput}
                    readOnly
                    placeholder="Decrypted text will appear here..."
                    rows={4}
                    className="pr-12 bg-muted/50"
                  />
                   {decryptOutput && (
                     <div className="absolute right-2 top-2">
                        <CopyButton valueToCopy={decryptOutput} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
