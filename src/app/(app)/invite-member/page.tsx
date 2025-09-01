

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDocument } from '@/services/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InviteMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [group, setGroup] = useState('');
    const [password, setPassword] = useState('password123'); // Default password

    const handleRegisterMember = async () => {
        if (!fullName || !email || !group) {
            toast({
                title: "Validation Error",
                description: "Please fill out the full name, email, and group for the new member.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);

        const newMember = {
            id: uuidv4(),
            name: fullName,
            email,
            phone,
            group,
            password, // In a real app, this should be handled more securely
            role: "Member",
            status: "Pending", // New members start as pending
            contributed: "GH₵0.00",
            avatar: `https://picsum.photos/100/100?a=${Math.random()}`,
        };

        try {
            await addDocument('members', newMember, newMember.id);
            toast({
                title: "Registration Request Sent",
                description: `${fullName}'s account is now pending admin approval.`,
            });
            // Reset form
            setFullName('');
            setEmail('');
            setPhone('');
            setGroup('');
        } catch (error) {
            console.error("Error registering member:", error);
            toast({
                title: "Registration Error",
                description: "Could not submit the registration. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Register a New Member</h1>
            <Card>
                <CardHeader>
                    <CardTitle>New Member's Details</CardTitle>
                    <CardDescription>
                        Fill out the form to register a new member. Their account will require admin approval.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full-name">Full Name</Label>
                            <Input 
                                id="full-name" 
                                placeholder="e.g., Ama Serwaa" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="friend@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+233 12 345 6789" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group">Group</Label>
                            <Select onValueChange={setGroup} value={group} disabled={isLoading}>
                                <SelectTrigger id="group">
                                    <SelectValue placeholder="Select a group" />
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
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRegisterMember} disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
