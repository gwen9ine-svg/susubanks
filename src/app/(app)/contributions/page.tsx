
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDocument, getCollection } from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

type Transaction = {
  id: string;
  ref: string;
  member: string;
  avatar: string;
  type: 'Contribution' | 'Withdrawal' | 'Deposit' | string;
  amount: string;
  date: string;
  status: string;
  email?: string;
  group?: string;
};

const parseAmount = (amount: string): number => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'completed':
        case 'approved':
            return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'pending': 
        case 'processing':
            return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'Contribution':
        case 'Deposit':
            return <Badge variant="outline" className="border-primary/50 text-primary">{type}</Badge>;
        case 'Withdrawal':
            return <Badge variant="outline" className="border-accent text-accent">{type}</Badge>;
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
}

export default function ContributionsPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [allContributions, setAllContributions] = useState<Transaction[]>([]);
  const [myContributions, setMyContributions] = useState<Transaction[]>([]);
  const [groupContributions, setGroupContributions] = useState<Record<string, number>>({});
  
  const [summaryData, setSummaryData] = useState({
      totalContributions: 0,
      myTotalContributions: 0
  });

  // Form State
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionGroup, setContributionGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function fetchData() {
    setLoading(true);
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    setUserRole(role);
    setUserEmail(email);
    setUserName(name);

    const transactionData = await getCollection('transactions') as Transaction[];
    const contributionTransactions = transactionData.filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setAllContributions(contributionTransactions);

    const totalContributions = contributionTransactions
        .filter(c => c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'approved')
        .reduce((acc, c) => acc + parseAmount(c.amount), 0);

    // Group-level summary for admins
    const groupTotals: Record<string, number> = {};
    for (let i = 1; i <= 6; i++) {
        const groupKey = `group${i}`;
        groupTotals[groupKey] = contributionTransactions
            .filter(c => c.group === groupKey && (c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'approved'))
            .reduce((acc, c) => acc + parseAmount(c.amount), 0);
    }
    setGroupContributions(groupTotals);
    
    // Personal summary for all users
    const myFilteredContributions = contributionTransactions.filter(tx => tx.email === email);
    setMyContributions(myFilteredContributions);

    const myTotalContributions = myFilteredContributions
        .filter(c => c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'approved')
        .reduce((acc, c) => acc + parseAmount(c.amount), 0);

    setSummaryData({
        totalContributions,
        myTotalContributions
    });
    setLoading(false);
  }


  useEffect(() => {
    fetchData();
  }, []);

  const handleContributionSubmit = async () => {
    const amount = parseFloat(contributionAmount);
    if (!contributionAmount || !contributionGroup || !userEmail || !userName) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields for your contribution.",
            variant: "destructive",
        });
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        toast({
            title: "Invalid Amount",
            description: "Please enter a valid amount.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    const newContribution = {
        ref: `CONT-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`,
        member: userName,
        email: userEmail,
        type: 'Contribution',
        amount: formatCurrency(parseFloat(contributionAmount)),
        group: contributionGroup,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Pending',
        avatar: `https://picsum.photos/100/100?a=${Math.random()}`,
    };

    try {
        await addDocument('transactions', newContribution);
        toast({
            title: 'Contribution Submitted',
            description: 'Your contribution has been submitted for approval.',
        });
        setContributionAmount('');
        setContributionGroup('');
        fetchData();
    } catch (error) {
        console.error("Error submitting contribution:", error);
        toast({
            title: "Submission Error",
            description: "Could not submit your contribution. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading contributions...</p>;
  }
  
  if (userRole === 'admin') {
      return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">All Member Contributions</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Total Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{formatCurrency(summaryData.totalContributions)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Contributions by Group</CardTitle>
                    <CardDescription>Total funds contributed to each group.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(groupContributions).map(([group, total]) => (
                        <Link href={`/admin/groups/${group}`} key={group} passHref>
                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium capitalize">{group.replace('group', 'Group ')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(total)}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allContributions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={tx.avatar} data-ai-hint="person avatar"/>
                                                <AvatarFallback>{tx.member.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <span>{tx.member}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tx.amount}</TableCell>
                                    <TableCell>{tx.group ? tx.group.replace('group', 'Group ') : 'N/A'}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      );
  }

  // Default view for non-admin users
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Contributions</h1>
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(summaryData.myTotalContributions)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>My Contribution History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myContributions.length > 0 ? myContributions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{tx.ref}</TableCell>
                                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                        <TableCell>{tx.amount}</TableCell>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No contributions found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>New Contribution</CardTitle>
                        <CardDescription>Submit a new contribution for approval.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contribution-amount">Amount (GHS)</Label>
                            <Input
                                id="contribution-amount"
                                type="number"
                                placeholder="Enter amount"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contribution-group">Group</Label>
                            <Select onValueChange={setContributionGroup} value={contributionGroup} disabled={isSubmitting}>
                                <SelectTrigger id="contribution-group">
                                    <SelectValue placeholder="Select group" />
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
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleContributionSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
