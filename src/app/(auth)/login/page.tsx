
'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SusuLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    // Default credentials
    const adminEmail = 'admin@example.com';
    const userEmail = 'user@example.com';
    const defaultPassword = 'password';

    if (email === adminEmail && password === defaultPassword) {
      localStorage.setItem('userRole', 'admin');
      router.push('/dashboard');
    } else if (email === userEmail && password === defaultPassword) {
      localStorage.setItem('userRole', 'user');
      router.push('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <SusuLogo isBank={true} />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Securely sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-primary hover:underline" prefetch={false}>
              Forgot Password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleLogin}>
          Login
        </Button>
        <Button variant="outline" className="w-full" asChild>
           <Link href="/register">Create Account</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Your information is protected with bank-grade security.
        </p>
      </CardFooter>
    </Card>
  );
}
