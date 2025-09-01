

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
import { addDocument, getCollection } from "@/services/firestore";
import { v4 as uuidv4 } from "uuid";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [govIdType, setGovIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [group, setGroup] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccount = async () => {
    setIsLoading(true);

    if (!fullName || !email || !password || !confirmPassword || !group || !agreed) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields, select a group, and agree to the terms.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match. Please re-enter them.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
        const existingMembers = await getCollection('members');
        const isFirstUser = existingMembers.length === 0;

        const newMember = {
            id: uuidv4(),
            name: fullName,
            email: email,
            phone: phone,
            dob: dob,
            nationality: nationality,
            address: address,
            govIdType: govIdType,
            idNumber: idNumber,
            sourceOfFunds: sourceOfFunds,
            password: password, // In a real app, this should be hashed.
            role: isFirstUser ? "Admin" : "Member", // First user is Admin
            status: "Pending", // Default status is now Pending
            group: group,
            contributed: "GH₵0.00", // Initial contribution
            avatar: `https://picsum.photos/100/100?a=${Math.random()}`,
        };
        
        const result = await addDocument('members', newMember, newMember.id);
        if (result.success) {
            toast({
              title: "Account Request Sent!",
              description: "Your registration is pending approval. You'll be notified upon confirmation.",
            });
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } else {
            throw new Error(result.error || "An unknown error occurred");
        }
    } catch (error) {
        console.error("Registration error:", error);
        toast({
            title: "Registration Failed",
            description: "Could not create your account. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
         <div className="mx-auto mb-4">
          <SusuLogo isBank={true} />
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Please fill out the form below to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" placeholder="As shown on your government ID" required value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" required value={dob} onChange={e => setDob(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Select value={nationality} onValueChange={setNationality}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+233 12 345 6789" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Residential Address</Label>
          <Input id="address" placeholder="123 Main St, Anytown, USA" required value={address} onChange={e => setAddress(e.target.value)} />
          <p className="text-xs text-muted-foreground">We use this to verify your identity and eligibility.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gov-id-type">Government ID Type</Label>
            <Select value={govIdType} onValueChange={setGovIdType}>
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
            <Input id="id-number" placeholder="Enter ID number" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Select a group to join" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group1">Group 1</SelectItem>
                <SelectItem value="group2">Group 2</SelectItem>
                <SelectItem value="group3">Group 3</SelectItem>
                <SelectItem value="group4">Group 4</SelectItem>
                <SelectItem value="group5">Group 5</SelectItem>
                <SelectItem value="group6">Group 6</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
              <Label htmlFor="source-of-funds">Source of Funds</Label>
              <Input id="source-of-funds" placeholder="Employment, Savings, Business, etc." value={sourceOfFunds} onChange={e => setSourceOfFunds(e.target.value)} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
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
          <Link href="/auth/login">Back</Link>
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreateAccount} disabled={isLoading}>
            <span>{isLoading ? 'Sending Request...' : 'Create Account'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
