
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Search, MoreVertical, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getCollection } from "@/services/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type Transaction = {
  id: string;
  ref: string;
  member: string;
  avatar: string;
  type: 'Contribution' | 'Withdrawal' | 'Dispute' | string;
  amount: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Completed' | string;
};

const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'Contribution':
        case 'Deposit':
             return <Badge variant="outline" className="border-primary/50 text-primary">{type}</Badge>;
        case 'Withdrawal': return <Badge variant="outline" className="border-accent text-accent">{type}</Badge>;
        case 'Dispute': return <Badge variant="destructive">{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'Approved':
        case 'Completed':
            return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Pending': return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'Rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summaryCards, setSummaryCards] = useState([
        { title: "Total Deposits", value: formatCurrency(0) },
        { title: "Total Withdrawals", value: formatCurrency(0) },
        { title: "Pending Reviews", value: "0" },
        { title: "Disputes", value: "0" },
    ]);
    const { toast } = useToast();

    async function fetchTransactions() {
        const transactionData = await getCollection('transactions') as Transaction[];
        setTransactions(transactionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        const totalDeposits = transactionData
            .filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const totalWithdrawals = transactionData
            .filter(tx => tx.type === 'Withdrawal')
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
            
        const pendingReviews = transactionData.filter(tx => tx.status === 'Pending').length;
        const disputes = transactionData.filter(tx => tx.type === 'Dispute').length;

        setSummaryCards([
            { title: "Total Deposits", value: formatCurrency(totalDeposits) },
            { title: "Total Withdrawals", value: formatCurrency(totalWithdrawals) },
            { title: "Pending Reviews", value: pendingReviews.toString() },
            { title: "Disputes", value: disputes.toString() },
        ]);
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleTransactionStatus = async (transactionId: string, newStatus: 'Approved' | 'Rejected') => {
        const transactionRef = doc(db, 'transactions', transactionId);
        try {
            await setDoc(transactionRef, { status: newStatus }, { merge: true });
            toast({
                title: `Transaction ${newStatus}`,
                description: `The transaction has been marked as ${newStatus}.`,
            });
            await fetchTransactions(); // Re-fetch data to update the UI
        } catch (error) {
            console.error("Error updating transaction status:", error);
            toast({
                title: "Update Error",
                description: "Failed to update transaction status. Please try again.",
                variant: "destructive",
            });
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Transactions</h1>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button variant="outline">New Transaction</Button>
                    <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <Input placeholder="Search by member, ref..." />
                           <Input type="date" placeholder="From"/>
                           <Input type="date" placeholder="To"/>
                           <div className="flex gap-2">
                            <Button className="w-full">Apply</Button>
                            <Button variant="ghost" className="w-full">Clear</Button>
                           </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Bulk Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground">0 items selected</p>
                           <div className="flex flex-col gap-2">
                             <Button variant="outline" className="w-full" disabled>Approve All</Button>
                             <Button variant="destructive" className="w-full" disabled>Reject All</Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="deposits">Deposits</TabsTrigger>
                            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                            <TabsTrigger value="disputes">Disputes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead><Checkbox /></TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Member</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((tx, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Checkbox /></TableCell>
                                                    <TableCell>{tx.date}</TableCell>
                                                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                                    <TableCell>{tx.member}</TableCell>
                                                    <TableCell className="font-medium">{tx.ref}</TableCell>
                                                    <TableCell>{tx.amount}</TableCell>
                                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                                    <TableCell>
                                                        {tx.status === 'Pending' ? (
                                                            <div className="flex gap-1">
                                                                <Button onClick={() => handleTransactionStatus(tx.id, 'Approved')} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                                <Button onClick={() => handleTransactionStatus(tx.id, 'Rejected')} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                            </div>
                                                        ) : (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Create Dispute</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
