

'use client';

import { useEffect, useState } from 'react';
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
import { addDocument, getCollection } from '@/services/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type InvitedMember = {
    id: string;
    name: string;
    email: string;
    status: 'Pending' | 'Active' | 'Rejected' | string;
    avatar: string;
    invitedBy?: string;
    group?: string;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Active": return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case "Pending": return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case "Rejected": return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

const formatGroupName = (group: string | undefined) => {
    if (!group) return 'N/A';
    return `Group ${group.replace('group', '')}`;
};


export default function InviteMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [govIdType, setGovIdType] = useState('');
    const [idCard, setIdCard] = useState('');
    const [sourceOfIncome, setSourceOfIncome] = useState('');
    const [group, setGroup] = useState('');
    const [password, setPassword] = useState('password123'); // Default password

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);

    useEffect(() => {
        const loggedInEmail = localStorage.getItem('userEmail');
        setUserEmail(loggedInEmail);
    }, []);

    async function fetchInvitedMembers() {
        if (!userEmail) return;
        const allMembers = await getCollection('members') as InvitedMember[];
        const myInvites = allMembers.filter(member => member.invitedBy === userEmail);
        setInvitedMembers(myInvites);
    }

    useEffect(() => {
        if (userEmail) {
            fetchInvitedMembers();
        }
    }, [userEmail]);

    const handleRegisterMember = async () => {
        if (!fullName || !email || !username || !address || !maritalStatus || !idCard || !sourceOfIncome || !govIdType) {
            toast({
                title: "Validation Error",
                description: "Please fill out all fields for the new member.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);

        const newMember = {
            id: uuidv4(),
            name: fullName,
            username: username,
            email,
            phone,
            address,
            maritalStatus,
            govIdType,
            idCard,
            sourceOfIncome,
            group: group || null, // Group is optional
            password, // In a real app, this should be handled more securely
            role: "Member",
            status: "Pending", // New members start as pending
            contributed: "GH₵0.00",
            avatar: `https://picsum.photos/100/100?a=${Math.random()}`,
            invitedBy: userEmail, // Track who invited this member
        };

        try {
            await addDocument('members', newMember, newMember.id);
            toast({
                title: "Registration Request Sent",
                description: `${fullName}'s account is now pending admin approval.`,
            });
            // Reset form
            setFullName('');
            setUsername('');
            setEmail('');
            setPhone('');
            setAddress('');
            setMaritalStatus('');
            setGovIdType('');
            setIdCard('');
            setSourceOfIncome('');
            setGroup('');
            fetchInvitedMembers(); // Refresh the list
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
                            <Label htmlFor="username">Username</Label>
                            <Input 
                                id="username" 
                                placeholder="e.g., ama_s" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="member@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
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
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Residential Address</Label>
                        <Input 
                            id="address" 
                            placeholder="123 Main St, Accra" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="marital-status">Marital Status</Label>
                            <Select onValueChange={setMaritalStatus} value={maritalStatus} disabled={isLoading}>
                                <SelectTrigger id="marital-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="source-of-income">Source of Income</Label>
                            <Input 
                                id="source-of-income" 
                                placeholder="e.g., Salary, Business" 
                                value={sourceOfIncome}
                                onChange={(e) => setSourceOfIncome(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gov-id-type">ID Card Type</Label>
                             <Select value={govIdType} onValueChange={setGovIdType} disabled={isLoading}>
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
                            <Label htmlFor="id-card">ID Card Number</Label>
                            <Input 
                                id="id-card" 
                                placeholder="GHA-123456789-0" 
                                value={idCard}
                                onChange={(e) => setIdCard(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="group">Group (Optional)</Label>
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

            <Card>
                <CardHeader>
                    <CardTitle>My Invitation History</CardTitle>
                    <CardDescription>Track the approval status of members you have registered.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invitedMembers.length > 0 ? (
                                invitedMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={member.avatar} data-ai-hint="person avatar" />
                                                <AvatarFallback>{member.name.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{formatGroupName(member.group)}</TableCell>
                                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">You haven't invited any members yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
