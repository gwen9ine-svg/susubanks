

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
  type: 'Contribution' | 'Withdrawal' | 'Dispute' | 'Deposit' | string;
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

type HistoryItem = (Transaction | Loan) & { itemType: 'transaction' | 'loan' };

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
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'Outstanding':
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'Rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

type GenericTableCardProps = {
    items: any[];
    handleItemStatus?: (itemId: string, newStatus: 'Approved' | 'Rejected', collection: 'transactions' | 'loans') => void;
    handleBulkAction?: (action: 'approve' | 'decline') => void;
    handleDeleteItem?: (itemId: string, collection: string) => void;
    isHistoryTable?: boolean;
    title: string;
    isRequestTable?: boolean;
};


const GenericTableCard = ({ items, handleItemStatus, handleDeleteItem, handleBulkAction, isHistoryTable = false, title, isRequestTable = false }: GenericTableCardProps) => {
    
    if (items.length === 0 && !isHistoryTable) {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">No {isRequestTable ? 'pending requests' : 'items'} found.</p>
          </CardContent>
        </Card>
      );
    }
    
    if(isHistoryTable && items.length === 0){
        return null;
    }

    return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {isRequestTable && handleBulkAction && (
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>Accept All</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('decline')}>Decline All</Button>
              </div>
            )}
        </CardHeader>
        <CardContent className="pt-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        {isRequestTable && <TableHead><Checkbox /></TableHead>}
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
                    {items.map((item) => {
                        const collection = item.itemType === 'loan' ? 'loans' : 'transactions';
                        return (
                        <TableRow key={item.id}>
                            {isRequestTable && <TableCell><Checkbox /></TableCell>}
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.itemType === 'loan' ? getTypeBadge('Loan') : getTypeBadge((item as Transaction).type)}</TableCell>
                            <TableCell>{item.itemType === 'loan' ? (item as Loan).memberName : (item as Transaction).member}</TableCell>
                            <TableCell className="font-medium">{item.itemType === 'loan' ? (item as Loan).reason : (item as Transaction).ref}</TableCell>
                            <TableCell>{item.amount}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                                {isRequestTable && handleItemStatus ? (
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
                                            {!isHistoryTable && <DropdownMenuItem>Create Dispute</DropdownMenuItem>}
                                            {handleDeleteItem && (
                                                <DropdownMenuItem onClick={() => handleDeleteItem(item.id, collection)} className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)};

type MemberTableProps = {
    members: Member[];
    handleUserApproval: (userId: string, newStatus: 'Active' | 'Rejected') => void;
};

const MemberRequestsTable = ({ members, handleUserApproval }: MemberTableProps) => {
     if (members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>New Member Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No new member requests found.</p>
                </CardContent>
            </Card>
        );
    }
    return (
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
                    {members.map(user => (
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
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)};


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

    const handleDeleteItem = async (itemId: string, collection: string) => {
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
    
     const handleBulkAction = async (items: (Transaction | Loan)[], collectionName: 'transactions' | 'loans', action: 'approve' | 'decline') => {
        if (items.length === 0) {
            toast({ title: `No pending items to ${action}.` });
            return;
        }

        const newStatus = action === 'approve' ? (collectionName === 'loans' ? 'Paid' : 'Approved') : 'Rejected';

        try {
            const batch = writeBatch(db);
            items.forEach(item => {
                const docRef = doc(db, collectionName, item.id);
                batch.update(docRef, { status: newStatus });
            });
            await batch.commit();
            toast({
                title: `All Pending Items ${action === 'approve' ? 'Accepted' : 'Declined'}`,
                description: `All pending items in ${collectionName} have been ${action === 'approve' ? 'accepted' : 'declined'}.`,
            });
            fetchData();
        } catch (error) {
            console.error(`Error with bulk ${action} in ${collectionName}:`, error);
            toast({
                title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Error`,
                description: `Failed to ${action} all items. Please try again.`,
                variant: 'destructive',
            });
        }
    };


    const deposits = transactions.filter(tx => (tx.type === 'Contribution' || tx.type === 'Deposit') && (tx.status === 'Pending' || tx.status === 'Processing')).map(tx => ({...tx, itemType: 'transaction'}));
    const withdrawals = transactions.filter(tx => tx.type === 'Withdrawal' && (tx.status === 'Pending' || tx.status === 'Processing')).map(tx => ({...tx, itemType: 'transaction'}));
    const loanRequests = loans.filter(l => l.status === 'Pending' || l.status === 'Outstanding').map(l => ({...l, itemType: 'loan'}));
    
    const transactionHistory = transactions
        .filter(t => ['Approved', 'Completed', 'Rejected'].includes(t.status))
        .map(t => ({ ...t, itemType: 'transaction' as const }));

    const loanHistory = loans
        .filter(l => ['Paid', 'Rejected'].includes(l.status))
        .map(l => ({ ...l, itemType: 'loan' as const }));

    const combinedHistory: HistoryItem[] = [...transactionHistory, ...loanHistory]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">User Requests</h1>
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
                <GenericTableCard 
                    items={deposits} 
                    handleItemStatus={handleItemStatus} 
                    handleDeleteItem={(id) => handleDeleteItem(id, 'transactions')} 
                    handleBulkAction={(action) => handleBulkAction(deposits, 'transactions', action)}
                    title="Deposit Requests"
                    isRequestTable={true}
                />
                <GenericTableCard 
                    items={withdrawals} 
                    handleItemStatus={handleItemStatus} 
                    handleDeleteItem={(id) => handleDeleteItem(id, 'transactions')} 
                    handleBulkAction={(action) => handleBulkAction(withdrawals, 'transactions', action)}
                    title="Withdrawal Requests"
                    isRequestTable={true}
                />
                <GenericTableCard 
                    items={loanRequests} 
                    handleItemStatus={handleItemStatus} 
                    handleDeleteItem={(id) => handleDeleteItem(id, 'loans')} 
                    handleBulkAction={(action) => handleBulkAction(loanRequests, 'loans', action)}
                    title="Loan Requests"
                    isRequestTable={true}
                />
                <MemberRequestsTable members={pendingMembers} handleUserApproval={handleUserApproval} />
                <GenericTableCard
                    items={combinedHistory}
                    title="History"
                    handleDeleteItem={handleDeleteItem}
                    isHistoryTable={true}
                />
            </div>
        </div>
    )
}
