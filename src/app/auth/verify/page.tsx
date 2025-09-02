
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SusuLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPage() {
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleVerify = () => {
    setIsLoading(true);
    // In a real application, you would send the emailCode and phoneCode
    // to your backend for verification against the codes you sent.
    // For this demo, we'll simulate a successful verification.
    
    if (!emailCode || !phoneCode) {
      toast({
        title: "Verification Failed",
        description: "Please enter both verification codes.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    console.log("Verifying with Email Code:", emailCode, "and Phone Code:", phoneCode);

    setTimeout(() => {
        toast({
          title: "Account Verified!",
          description: "You have successfully verified your account.",
        });
        router.push('/dashboard');
        setIsLoading(false);
    }, 1500);
  };
  
  const handleResend = () => {
    // In a real app, this would trigger your backend to resend the codes.
    toast({
      title: "Codes Resent",
      description: "New verification codes have been sent to your email and phone."
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <SusuLogo isBank={true} />
        </div>
        <CardTitle className="text-2xl">Verify your details</CardTitle>
        <CardDescription>Step 2 of 3</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Codes Sent</AlertTitle>
          <AlertDescription className="text-green-700">
            For your security, we sent codes to your email and phone.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label htmlFor="email-code">Email Verification Code</Label>
          <Input id="email-code" type="text" placeholder="123456" required value={emailCode} onChange={(e) => setEmailCode(e.target.value)} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone-code">Phone Verification Code</Label>
          <Input id="phone-code" type="text" placeholder="123456" required value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} disabled={isLoading} />
        </div>
        <div className="text-center text-sm text-muted-foreground">
          <span>Code expires in 04:59. </span>
          <Button variant="link" className="p-0 h-auto" onClick={handleResend} disabled={isLoading}>
            Resend
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Optional
            </span>
          </div>
        </div>
         <Button variant="secondary" className="w-full" disabled={isLoading}>Use authenticator app</Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleVerify} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Continue'}
        </Button>
        <div className="flex justify-between w-full">
            <Button variant="link" className="p-0" asChild>
                <Link href="/auth/register">Back</Link>
            </Button>
            <Button variant="link" className="p-0" disabled={isLoading}>
                Change email/phone
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
