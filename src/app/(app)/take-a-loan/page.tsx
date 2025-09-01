

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { addDocument, getCollection } from '@/services/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Loan = {
  id: string;
  ref: string;
  memberName: string;
  email?: string;
  amount: string;
  reason: string;
  group: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Outstanding' | string;
};

const parseAmount = (amount: string): number => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    if (isNaN(value)) return '';
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'approved':
        case 'paid':
            return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'pending': 
            return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        case 'outstanding': return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function TakeLoanPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isRepaying, setIsRepaying] = useState(false);

    // Loan request form state
    const [loanAmount, setLoanAmount] = useState('');
    const [loanReason, setLoanReason] = useState('');
    const [repaymentPlan, setRepaymentPlan] = useState('');
    const [collateral, setCollateral] = useState('');
    const [guarantorName, setGuarantorName] = useState('');
    const [guarantorPhone, setGuarantorPhone] = useState('');
    const [group, setGroup] = useState('');

    // Repayment form state
    const [repaymentAmount, setRepaymentAmount] = useState('');

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [myLoans, setMyLoans] = useState<Loan[]>([]);
    const [outstandingLoan, setOutstandingLoan] = useState(0);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        setUserEmail(email);
        setUserName(name);
    }, []);

    async function fetchMyLoans() {
        if (!userEmail) return;
        const allLoans = await getCollection('loans') as Loan[];
        const userLoans = allLoans
            .filter(loan => loan.email === userEmail)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMyLoans(userLoans);

        const outstanding = userLoans
            .filter(loan => loan.status === 'Approved' || loan.status === 'Paid' || loan.status === 'Outstanding')
            .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);
        setOutstandingLoan(outstanding);
    }

    useEffect(() => {
        if (userEmail) {
            fetchMyLoans();
        }
    }, [userEmail]);

    const handleLoanRequest = async () => {
        if (!loanAmount || !loanReason || !repaymentPlan || !group || !userEmail || !userName) {
            toast({
                title: "Validation Error",
                description: "Please fill out all required fields.",
                variant: "destructive",
            });
            return;
        }
        
        const amount = parseFloat(loanAmount);
        if (isNaN(amount) || amount < 1000) {
            toast({
                title: "Invalid Amount",
                description: "Minimum loan amount is GH₵1,000.00.",
                variant: "destructive",
            });
            return;
        }

        if (amount % 500 !== 0) {
             toast({
                title: "Invalid Amount",
                description: "Loan amount must be in increments of 500 (e.g., 1000, 1500, 2000).",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const newLoanRequest = {
            ref: `LOAN-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`,
            memberName: userName,
            email: userEmail,
            amount: formatCurrency(amount),
            reason: loanReason,
            repaymentPlan,
            collateral,
            guarantorName,
            guarantorPhone,
            group,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Pending',
        };

        try {
            await addDocument('loans', newLoanRequest);
            toast({
                title: "Loan Request Submitted",
                description: "Your loan request has been sent for admin approval.",
            });
            // Reset form
            setLoanAmount('');
            setLoanReason('');
            setRepaymentPlan('');
            setCollateral('');
            setGuarantorName('');
            setGuarantorPhone('');
            setGroup('');
            fetchMyLoans(); // Refresh the list
        } catch (error) {
            console.error("Error submitting loan request:", error);
            toast({
                title: "Submission Error",
                description: "Could not submit your loan request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRepayment = async () => {
        const amount = parseFloat(repaymentAmount);
        if (!repaymentAmount || isNaN(amount) || amount <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid repayment amount.",
                variant: "destructive",
            });
            return;
        }

        if (amount > outstandingLoan) {
             toast({
                title: "Invalid Amount",
                description: "Repayment amount cannot be greater than your outstanding loan.",
                variant: "destructive",
            });
            return;
        }

        setIsRepaying(true);

        const repaymentTransaction = {
            ref: `REPAY-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`,
            member: userName,
            email: userEmail,
            type: 'Contribution',
            amount: formatCurrency(amount),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Pending',
            desc: 'Loan Repayment',
        };

        try {
            await addDocument('transactions', repaymentTransaction);
            toast({
                title: "Repayment Submitted",
                description: "Your loan repayment has been submitted for processing.",
            });
            setRepaymentAmount('');
            // We don't update the outstanding loan here. It will be updated when an admin approves the transaction.
            // You can fetch data again if you want to reflect the pending transaction somewhere.
        } catch (error) {
             console.error("Error submitting repayment:", error);
            toast({
                title: "Repayment Error",
                description: "Could not submit your repayment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsRepaying(false);
        }
    }


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Request a Loan</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Application Form</CardTitle>
                            <CardDescription>
                                Please provide the following details for your loan request. All requests are subject to approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loan-amount">Loan Amount (GHS)</Label>
                                    <Input 
                                        id="loan-amount" 
                                        type="number"
                                        placeholder="e.g., 1000" 
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        disabled={isLoading}
                                        min="1000"
                                        step="500"
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="group">Your Group</Label>
                                    <Select onValueChange={setGroup} value={group} disabled={isLoading}>
                                        <SelectTrigger id="group">
                                            <SelectValue placeholder="Select your group" />
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
                            <div className="space-y-2">
                                <Label htmlFor="loan-reason">Reason for Loan</Label>
                                <Textarea 
                                    id="loan-reason" 
                                    placeholder="e.g., Business expansion, school fees, emergency..." 
                                    value={loanReason}
                                    onChange={(e) => setLoanReason(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="repayment-plan">Proposed Repayment Plan</Label>
                                <Textarea 
                                    id="repayment-plan" 
                                    placeholder="e.g., I will pay back GHS 200 monthly for 6 months." 
                                    value={repaymentPlan}
                                    onChange={(e) => setRepaymentPlan(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="collateral">Collateral (Optional)</Label>
                                <Input 
                                    id="collateral" 
                                    placeholder="e.g., Vehicle, Land Title, etc."
                                    value={collateral}
                                    onChange={(e) => setCollateral(e.target.value)}
                                    disabled={isLoading} 
                                />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="guarantor-name">Guarantor's Name (Optional)</Label>
                                    <Input 
                                        id="guarantor-name" 
                                        placeholder="Full name of your guarantor" 
                                        value={guarantorName}
                                        onChange={(e) => setGuarantorName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="guarantor-phone">Guarantor's Phone (Optional)</Label>
                                    <Input 
                                        id="guarantor-phone" 
                                        type="tel"
                                        placeholder="+233..." 
                                        value={guarantorPhone}
                                        onChange={(e) => setGuarantorPhone(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleLoanRequest} disabled={isLoading}>
                                {isLoading ? 'Submitting...' : 'Submit Loan Request'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Loan Repayment</CardTitle>
                            <CardDescription>Make a payment towards your outstanding loan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Outstanding Loan Balance</p>
                                <p className="text-2xl font-bold">{formatCurrency(outstandingLoan)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repayment-amount">Repayment Amount (GHS)</Label>
                                <Input 
                                    id="repayment-amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={repaymentAmount}
                                    onChange={(e) => setRepaymentAmount(e.target.value)}
                                    disabled={isRepaying || outstandingLoan === 0}
                                />
                            </div>
                             <Button onClick={handleRepayment} disabled={isRepaying || outstandingLoan === 0}>
                                {isRepaying ? 'Processing...' : 'Make Repayment'}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Loan History</CardTitle>
                            <CardDescription>Track your past and current loans.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLoans.length > 0 ? (
                                        myLoans.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loan.amount}</TableCell>
                                            <TableCell>{loan.date}</TableCell>
                                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                                        </TableRow>
                                    ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">You have no loan history.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

