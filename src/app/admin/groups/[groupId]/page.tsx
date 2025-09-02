

'use client';

import { useEffect, useState } from 'react';
import { getCollection } from '@/services/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Contributor' | 'Member' | 'Loan' | string;
  role?: 'Admin' | 'Member' | string;
};

type Transaction = {
  id: string;
  type: 'Contribution' | 'Withdrawal' | 'Deposit' | string;
  amount: string;
  email?: string;
  member: string;
  status: string;
  group?: string;
};

type GroupMember = Member & {
    totalContribution: string;
};

const parseAmount = (amount: string): number => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case "active":
            return "bg-green-100 text-green-800";
        case "on leave":
            return "bg-yellow-100 text-yellow-800";
        case "suspended":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export default function GroupDetailsPage({ params }: { params: { groupId: string } }) {
    const { groupId } = params;
    const [loading, setLoading] = useState(true);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const membersData = await getCollection('members') as Member[];
            const transactionsData = await getCollection('transactions') as Transaction[];
            
            const nonAdminMembers = membersData.filter(m => m.role !== 'Admin');

            const groupTransactions = transactionsData.filter(tx => tx.group === groupId && tx.type === 'Contribution' && (tx.status === 'Completed' || tx.status === 'Approved'));
            
            const memberContributions: { [email: string]: number } = {};
            groupTransactions.forEach(tx => {
                if (tx.email) {
                    memberContributions[tx.email] = (memberContributions[tx.email] || 0) + parseAmount(tx.amount);
                }
            });

            const membersWithContributions = nonAdminMembers
              .filter(member => member.group === groupId)
              .map(member => ({
                ...member,
                totalContribution: formatCurrency(memberContributions[member.email] || 0)
              }));

            setGroupMembers(membersWithContributions);
            setLoading(false);
        }

        if (groupId) {
            fetchData();
        }
    }, [groupId]);

    const groupName = groupId.charAt(0).toUpperCase() + groupId.slice(1).replace('group', 'Group ');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/contributions"><ArrowLeft className="h-4 w-4" /></Link>
                 </Button>
                <h1 className="text-2xl font-bold">{groupName} Members</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Contributions</CardTitle>
                    <CardDescription>
                        List of all members and their total contributions to {groupName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Contribution</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading members...</TableCell>
                                </TableRow>
                            ) : groupMembers.length > 0 ? (
                                groupMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.avatar} data-ai-hint="person avatar"/>
                                                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span>{member.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadgeVariant(member.status)}>{member.status}</Badge>
                                        </TableCell>
                                        <TableCell>{member.totalContribution}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No members found for this group.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    