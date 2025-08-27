
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SusuLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleCreateAccount = () => {
    // Basic validation
    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the Terms of Service to create an account.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would handle form data submission here.
    toast({
      title: "Account Created Successfully!",
      description: "You will now be redirected to the login page.",
    });

    setTimeout(() => {
        router.push('/login');
    }, 2000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
         <div className="mx-auto mb-4">
          <SusuLogo isBank={true} />
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" placeholder="As shown on your government ID" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Select>
              <SelectTrigger id="nationality">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usa">United States</SelectItem>
                <SelectItem value="can">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                 <SelectItem value="nga">Nigeria</SelectItem>
                <SelectItem value="gha">Ghana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Residential Address</Label>
          <Input id="address" placeholder="123 Main St, Anytown, USA" required />
          <p className="text-xs text-muted-foreground">We use this to verify your identity and eligibility.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gov-id-type">Government ID Type</Label>
            <Select>
              <SelectTrigger id="gov-id-type">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ghana_card">Ghana Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="voters_id">Voter's ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id-number">ID Number</Label>
            <Input id="id-number" placeholder="Enter ID number" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" required />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source-of-funds">Source of Funds</Label>
          <Input id="source-of-funds" placeholder="Employment, Savings, Business, etc." />
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" onCheckedChange={(checked) => setAgreed(!!checked)} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that the information provided is accurate and agree to the Terms of Service.
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/login">Back</Link>
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreateAccount}>
            <span>Create Account</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
