
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
    const [newMemberRole, setNewMemberRole] = useState('');

    const handleAddMember = async () => {
        if (!newMemberName || !newMemberEmail || !newMemberRole) {
            toast({
                title: "Validation Error",
                description: "Please provide name, email, and role for the new member.",
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
            role: newMemberRole,
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
            setNewMemberRole('');
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
                            <Label htmlFor="new-member-role">Role</Label>
                            <Select onValueChange={setNewMemberRole} value={newMemberRole}>
                                <SelectTrigger id="new-member-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Member">Member</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
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
