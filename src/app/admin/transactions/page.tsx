

'use client';

import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Check, X, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { deleteDocument, getCollection, updateDocument, writeBatch } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type Loan = {
    id: string;
    amount: string;
    date: string;
    memberName: string;
    status: string;
    reason?: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Rejected' | string;
  group?: string;
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
        case 'Loan': return <Badge variant="outline" className="border-blue-500/50 text-blue-500">Loan</Badge>;
        case 'Dispute': return <Badge variant="destructive">{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'Approved':
        case 'Completed':
        case 'Paid':
        case 'Active':
            return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Pending': 
        case 'Outstanding':
            return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'Rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

type TransactionTableProps = {
    items: (Transaction | Loan)[];
    handleItemStatus: (itemId: string, newStatus: 'Approved' | 'Rejected', collection: 'transactions' | 'loans') => void;
    handleAcceptAll: (collection: 'transactions' | 'loans') => void;
    handleDeclineAll: (collection: 'transactions' | 'loans') => void;
    handleDeleteItem: (itemId: string, collection: 'transactions' | 'loans') => void;
    isLoanTable?: boolean;
};


const GenericTable = ({ items, handleItemStatus, handleDeleteItem, handleAcceptAll, handleDeclineAll, isLoanTable = false }: TransactionTableProps) => {
    const collection = isLoanTable ? 'loans' : 'transactions';
    
    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isLoanTable ? "Loan Requests" : "User Requests"}</CardTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAcceptAll(collection)}>Accept All</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeclineAll(collection)}>Decline All</Button>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Checkbox /></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Reference/Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell><Checkbox /></TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{isLoanTable ? getTypeBadge('Loan') : getTypeBadge((item as Transaction).type)}</TableCell>
                            <TableCell>{isLoanTable ? (item as Loan).memberName : (item as Transaction).member}</TableCell>
                            <TableCell className="font-medium">{isLoanTable ? (item as Loan).reason : (item as Transaction).ref}</TableCell>
                            <TableCell>{item.amount}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                                {item.status === 'Pending' || item.status === 'Outstanding' ? (
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleItemStatus(item.id, 'Approved', collection)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                        <Button onClick={() => handleItemStatus(item.id, 'Rejected', collection)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                    </div>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            {!isLoanTable && <DropdownMenuItem>Create Dispute</DropdownMenuItem>}
                                            <DropdownMenuItem onClick={() => handleDeleteItem(item.id, collection)} className="text-red-600 hover:text-red-700">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
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
)};

type MemberTableProps = {
    members: Member[];
    handleUserApproval: (userId: string, newStatus: 'Active' | 'Rejected') => void;
};

const MemberRequestsTable = ({ members, handleUserApproval }: MemberTableProps) => (
    <Card>
        <CardHeader>
            <CardTitle>New Member Requests</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length > 0 ? members.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.group ? user.group.replace('group', 'Group ') : 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleUserApproval(user.id, 'Active')} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">Approve</Button>
                                    <Button onClick={() => handleUserApproval(user.id, 'Rejected')} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">Decline</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No new member requests.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);


export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [summaryCards, setSummaryCards] = useState([
        { title: "Total Deposits", value: formatCurrency(0) },
        { title: "Total Withdrawals", value: formatCurrency(0) },
        { title: "Total Loans Given", value: formatCurrency(0) },
        { title: "Profits Made", value: formatCurrency(0) },
    ]);
    const { toast } = useToast();

    async function fetchData() {
        const transactionData = await getCollection('transactions') as Transaction[];
        const loanData = await getCollection('loans') as Loan[];
        const memberData = await getCollection('members') as Member[];

        setTransactions(transactionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoans(loanData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPendingMembers(memberData.filter(m => m.status === 'Pending'));
        
        const totalDeposits = transactionData
            .filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const totalWithdrawals = transactionData
            .filter(tx => tx.type === 'Withdrawal' && (tx.status === 'Approved' || tx.status === 'Completed'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
            
        const totalLoans = loanData
            .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
            .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);
        const profits = totalDeposits * 0.05; // Example profit calculation

        setSummaryCards([
            { title: "Total Deposits", value: formatCurrency(totalDeposits) },
            { title: "Total Withdrawals", value: formatCurrency(totalWithdrawals) },
            { title: "Total Loans Given", value: formatCurrency(totalLoans) },
            { title: "Profits Made", value: formatCurrency(profits) },
        ]);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleItemStatus = async (itemId: string, newStatus: 'Approved' | 'Rejected', collection: 'transactions' | 'loans') => {
        try {
            const finalStatus = collection === 'loans' && newStatus === 'Approved' ? 'Paid' : newStatus;
            await updateDocument(collection, itemId, { status: finalStatus });
            toast({
                title: `Item ${newStatus}`,
                description: `The item has been marked as ${newStatus}.`,
            });
            await fetchData(); // Re-fetch data to update the UI
        } catch (error) {
            console.error(`Error updating ${collection} status:`, error);
            toast({
                title: "Update Error",
                description: `Failed to update ${collection} status. Please try again.`,
                variant: "destructive",
            });
        }
    };
    
    const handleUserApproval = async (userId: string, newStatus: "Active" | "Rejected") => {
        try {
            await updateDocument('members', userId, { status: newStatus });
            toast({
                title: `User ${newStatus === 'Active' ? 'Approved' : 'Rejected'}`,
                description: `The user has been ${newStatus === 'Active' ? 'approved' : 'rejected'}.`
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Update Error",
                description: "Could not update the user status. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteItem = async (itemId: string, collection: 'transactions' | 'loans') => {
        try {
            await deleteDocument(collection, itemId);
            toast({
                title: "Item Deleted",
                description: "The item has been successfully deleted.",
            });
            await fetchData(); // Re-fetch data to update the UI
        } catch (error) {
            console.error(`Error deleting ${collection}:`, error);
            toast({
                title: "Delete Error",
                description: `Failed to delete the ${collection}. Please try again.`,
                variant: "destructive",
            });
        }
    };
    
    const handleAcceptAll = async (collectionName: 'transactions' | 'loans') => {
        let itemsToUpdate;

        if (collectionName === 'transactions') {
            itemsToUpdate = transactions.filter(t => t.status === 'Pending' || t.status === 'Processing');
        } else {
            itemsToUpdate = loans.filter(l => l.status === 'Pending' || l.status === 'Outstanding');
        }

        if (itemsToUpdate.length === 0) {
            toast({ title: `No pending items to approve in ${collectionName}.` });
            return;
        }

        try {
            const batch = writeBatch(db);
            const finalStatus = collectionName === 'loans' ? 'Paid' : 'Approved';
            itemsToUpdate.forEach(item => {
                const docRef = doc(db, collectionName, item.id);
                batch.update(docRef, { status: finalStatus });
            });
            await batch.commit();
            toast({
                title: 'All Pending Items Accepted',
                description: `All pending items in ${collectionName} have been accepted.`,
            });
            fetchData();
        } catch (error) {
            console.error(`Error accepting all items in ${collectionName}:`, error);
            toast({
                title: 'Bulk Accept Error',
                description: `Failed to accept all items. Please try again.`,
                variant: 'destructive',
            });
        }
    };

    const handleDeclineAll = async (collectionName: 'transactions' | 'loans') => {
        let itemsToUpdate;

        if (collectionName === 'transactions') {
            itemsToUpdate = transactions.filter(t => t.status === 'Pending' || t.status === 'Processing');
        } else {
            itemsToUpdate = loans.filter(l => l.status === 'Pending' || l.status === 'Outstanding');
        }
        
        if (itemsToUpdate.length === 0) {
            toast({ title: 'No pending items to decline.' });
            return;
        }

        try {
            const batch = writeBatch(db);
            itemsToUpdate.forEach(item => {
                const docRef = doc(db, collectionName, item.id);
                batch.update(docRef, { status: 'Rejected' });
            });
            await batch.commit();
            toast({
                title: 'All Pending Items Declined',
                description: `All pending items in ${collectionName} have been declined.`,
            });
            fetchData();
        } catch (error) {
            console.error(`Error declining all items in ${collectionName}:`, error);
            toast({
                title: 'Bulk Decline Error',
                description: `Failed to decline all items. Please try again.`,
                variant: 'destructive',
            });
        }
    };

    const allItems = [...transactions, ...loans.map(l => ({...l, type: 'Loan', ref: l.reason || '', member: l.memberName, avatar: ''}))].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const deposits = transactions.filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit');
    const withdrawals = transactions.filter(tx => tx.type === 'Withdrawal');
    const loanRequests = loans;


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">User Requests</h1>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" asChild>
                        <Link href="/withdrawals">New Transaction</Link>
                    </Button>
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

            <div className="grid gap-6">
                <div>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="deposits">Deposits</TabsTrigger>
                            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                            <TabsTrigger value="loan_requests">Loan Requests</TabsTrigger>
                            <TabsTrigger value="new_members">New Members</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <GenericTable items={allItems} handleItemStatus={handleItemStatus} handleDeleteItem={handleDeleteItem} handleAcceptAll={() => { toast({ title: "Please use specific tabs for bulk actions."}) }} handleDeclineAll={() => { toast({ title: "Please use specific tabs for bulk actions."}) }} />
                        </TabsContent>
                         <TabsContent value="deposits">
                             <GenericTable items={deposits} handleItemStatus={handleItemStatus} handleDeleteItem={handleDeleteItem} handleAcceptAll={() => handleAcceptAll('transactions')} handleDeclineAll={() => handleDeclineAll('transactions')} />
                        </TabsContent>
                         <TabsContent value="withdrawals">
                             <GenericTable items={withdrawals} handleItemStatus={handleItemStatus} handleDeleteItem={handleDeleteItem} handleAcceptAll={() => handleAcceptAll('transactions')} handleDeclineAll={() => handleDeclineAll('transactions')} />
                        </TabsContent>
                         <TabsContent value="loan_requests">
                             <GenericTable items={loanRequests} handleItemStatus={handleItemStatus} handleDeleteItem={handleDeleteItem} handleAcceptAll={() => handleAcceptAll('loans')} handleDeclineAll={() => handleDeclineAll('loans')} isLoanTable={true} />
                        </TabsContent>
                        <TabsContent value="new_members">
                            <MemberRequestsTable members={pendingMembers} handleUserApproval={handleUserApproval} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}


    