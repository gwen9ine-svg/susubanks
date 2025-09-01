

'use client';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getCollection, updateDocument } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Contributor' | 'Member' | 'Loan' | 'Pending' | string;
  address?: string;
  maritalStatus?: string;
  group?: string;
};

type Transaction = {
  id: string;
  type: 'Contribution' | 'Withdrawal' | 'Deposit' | string;
  amount: string;
  email?: string;
  member: string;
  status: string;
  desc?: string;
};

type Loan = {
  id: string;
  amount: string;
  status: 'Outstanding' | 'Paid' | 'Approved' | 'Pending' | string;
  memberName: string;
  email?: string;
};

const parseAmount = (amount: string): number => {
    if (!amount || typeof amount === 'number') return amount || 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Contributor": return "bg-blue-100 text-blue-800";
        case "Active":
        case "Member": return "bg-green-100 text-green-800";
        case "Loan": return "bg-yellow-100 text-yellow-800";
        case "Suspended": return "bg-red-100 text-red-800";
        case "Pending": return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

export default function UsersDirectoryPage() {
    const [users, setUsers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allLoans, setAllLoans] = useState<Loan[]>([]);
    const [selectedUser, setSelectedUser] = useState<Member | null>(null);
    const [summaryCards, setSummaryCards] = useState([
        { title: "Total Members", value: "0" },
        { title: "Active Groups", value: "6" },
        { title: "Monthly Deposits", value: formatCurrency(0) },
        { title: "Total Loans Given", value: formatCurrency(0) },
    ]);
    const { toast } = useToast();
    const [pendingUsers, setPendingUsers] = useState<Member[]>([]);


    async function fetchData() {
      setLoading(true);
      const memberData = await getCollection('members') as Member[];
      const transactionData = await getCollection('transactions') as Transaction[];
      const loanData = await getCollection('loans') as Loan[];

      setAllTransactions(transactionData);
      setAllLoans(loanData);
      
      const activeMembers = memberData.filter(m => m.status === 'Active');
      const pendingApprovalUsers = memberData.filter(m => m.status === 'Pending');
      setPendingUsers(pendingApprovalUsers);

      const totalMembers = activeMembers.length;
      const monthlyDeposits = transactionData
        .filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      const totalLoansGiven = loanData
        .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
        .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

      setSummaryCards([
        { title: "Total Members", value: totalMembers.toString() },
        { title: "Active Groups", value: "6" },
        { title: "Monthly Deposits", value: formatCurrency(monthlyDeposits) },
        { title: "Total Loans Given", value: formatCurrency(totalLoansGiven) },
      ]);

      setUsers(memberData);
      if(memberData.length > 0) {
        setSelectedUser(memberData[0]);
      }
      setLoading(false);
    }
    
    useEffect(() => {
      fetchData();
    }, []);
    
    const handleUserApproval = async (userId: string, newStatus: "Active" | "Rejected") => {
        try {
            if (newStatus === 'Rejected') {
                // Optionally delete the user doc or mark as rejected
                 await updateDocument('members', userId, { status: newStatus });
            } else {
                 await updateDocument('members', userId, { status: newStatus });
            }
           
            toast({
                title: `User ${newStatus === 'Active' ? 'Approved' : 'Declined'}`,
                description: `The user has been ${newStatus === 'Active' ? 'approved' : 'declined'}.`
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

    const userTransactions = selectedUser
        ? allTransactions.filter(tx => tx.email === selectedUser.email)
        : [];
        
    const userLoans = selectedUser
        ? allLoans.filter(loan => loan.email === selectedUser.email)
        : [];


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Registered Users</h1>
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

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Input placeholder="Search users..."/>
                    </CardHeader>
                    <CardContent className="p-0">
                       <ul className="divide-y">
                         {loading ? (
                             <li className="p-4 text-center text-muted-foreground">Loading users...</li>
                         ) : (
                            users.map(user => (
                                <li key={user.id} onClick={() => setSelectedUser(user)} className={`p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} data-ai-hint="person avatar"/>
                                            <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                    <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                                </li>
                             ))
                         )}
                       </ul>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details for {selectedUser?.name || '...'}</CardTitle>
                            <CardDescription>View and manage user information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="transactions">
                                <TabsList>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                    <TabsTrigger value="loans">Loans</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>
                                <TabsContent value="transactions" className="pt-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userTransactions.length > 0 ? userTransactions.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell>{tx.type}</TableCell>
                                                    <TableCell>{tx.amount}</TableCell>
                                                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                                                    <TableCell><Badge className={getStatusBadge(tx.status)}>{tx.status}</Badge></TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center">No transactions for this user.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                     </Table>
                                </TabsContent>
                                 <TabsContent value="loans" className="pt-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userLoans.length > 0 ? userLoans.map(loan => (
                                                <TableRow key={loan.id}>
                                                    <TableCell>{loan.amount}</TableCell>
                                                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                                                    <TableCell><Badge className={getStatusBadge(loan.status)}>{loan.status}</Badge></TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center">No loans for this user.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                     </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>New User Approval</CardTitle>
                            <CardDescription>Review and approve new member requests.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <p>Loading requests...</p>
                            ) : pendingUsers.length > 0 ? (
                                pendingUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                            <p className="text-sm text-muted-foreground">Group: {user.group ? user.group.replace('group', 'Group ') : 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleUserApproval(user.id, 'Active')} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">Approve</Button>
                                            <Button onClick={() => handleUserApproval(user.id, 'Rejected')} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">Decline</Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">No new user requests.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
