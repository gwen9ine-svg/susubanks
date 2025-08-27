import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SusuLogo } from "@/components/icons";

export default function LoginPage() {
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
          <Input id="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-primary hover:underline" prefetch={false}>
              Forgot Password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link href="/dashboard">Login</Link>
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
