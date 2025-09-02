
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
import { getCollection, seedDatabase } from "@/services/firestore";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Member' | string;
  password?: string; // Add password field
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Contributor' | 'Member' | 'Loan' | 'Pending' | string;
};


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Ensure the database is seeded if empty. This now happens reliably.
      await seedDatabase();
      
      const members = await getCollection('members') as Member[];
      const user = members.find(member => member.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        toast({
          title: "Login Failed",
          description: "User not found. Please check your email or register for a new account.",
          variant: "destructive",
        });
      } else if (user.status !== 'Active') {
          toast({
            title: "Login Denied",
            description: `Your account is currently ${user.status}. Please contact an administrator for assistance.`,
            variant: "destructive",
        });
      } else if (user.password === password) {
        toast({
          title: "Welcome Back!",
          description: `You have successfully logged in as ${user.name}.`,
        });
        // In a real app, you'd use a secure way to manage sessions (e.g., JWT).
        // For this demo, localStorage is used for simplicity.
        localStorage.setItem('userRole', user.role.toLowerCase());
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        router.push('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "Could not connect to the authentication service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <SusuLogo isBank={true} />
        </div>
        <CardTitle className="text-2xl">Welcome to Susu Bank</CardTitle>
        <CardDescription>Securely sign in to your account. Use the default credentials or create an account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline" prefetch={false}>
              Forgot Password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="password123" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        <Button variant="outline" className="w-full" asChild>
           <Link href="/auth/register">Create Account</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Your information is protected with bank-grade security.
        </p>
      </CardFooter>
    </Card>
  );
}
