

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addDocument } from "@/services/firestore";
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';

export default function AddMemberPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [newMemberAddress, setNewMemberAddress] = useState('');
    const [newMemberMaritalStatus, setNewMemberMaritalStatus] = useState('');
    const [nationality, setNationality] = useState('');
    const [group, setGroup] = useState('');
    const [sourceOfFunds, setSourceOfFunds] = useState('');


    const handleAddMember = async () => {
        if (!newMemberName || !newMemberEmail || !group) {
            toast({
                title: "Validation Error",
                description: "Please provide name, email, and group for the new member.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const newMember = {
            id: uuidv4(),
            name: newMemberName,
            email: newMemberEmail,
            phone: newMemberPhone,
            address: newMemberAddress,
            maritalStatus: newMemberMaritalStatus,
            role: "Member",
            nationality: nationality,
            group: group,
            sourceOfFunds: sourceOfFunds,
            status: "Active", // Admins add active users directly
            contributed: "GH₵0.00",
            avatar: `https://picsum.photos/100/100?a=${Math.random()}`,
            password: "password123", // default password
        };

        try {
            await addDocument('members', newMember, newMember.id);
            toast({
                title: "Member Added",
                description: `${newMemberName} has been added to the directory.`,
            });
            // Reset form
            setNewMemberName('');
            setNewMemberEmail('');
            setNewMemberPhone('');
            setNewMemberAddress('');
            setNewMemberMaritalStatus('');
            setNationality('');
            setGroup('');
            setSourceOfFunds('');

        } catch (error) {
            console.error("Error adding member:", error);
            toast({
                title: "Error",
                description: "Could not add the new member. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Add New Member</h1>
            <Card>
                <CardHeader>
                    <CardTitle>New Member Details</CardTitle>
                    <CardDescription>Fill out the form below to register a new member in the system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-member-name">Full Name</Label>
                            <Input id="new-member-name" placeholder="Full Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-member-email">Email</Label>
                            <Input id="new-member-email" placeholder="Email" type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                         </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-member-phone">Phone Number</Label>
                            <Input id="new-member-phone" placeholder="Phone Number" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-member-address">Residential Address</Label>
                            <Input id="new-member-address" placeholder="Residential Address" value={newMemberAddress} onChange={(e) => setNewMemberAddress(e.target.value)} />
                         </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-member-marital-status">Marital Status</Label>
                            <Select onValueChange={setNewMemberMaritalStatus} value={newMemberMaritalStatus}>
                                <SelectTrigger id="new-member-marital-status"><SelectValue placeholder="Select marital status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                </SelectContent>
                            </Select>
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
                    <Button onClick={handleAddMember} disabled={isLoading}>
                        {isLoading ? 'Adding Member...' : 'Add Member'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
