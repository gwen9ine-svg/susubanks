

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { addDocument, getCollection, updateDocument } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

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
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [newMemberAddress, setNewMemberAddress] = useState('');
    const [newMemberMaritalStatus, setNewMemberMaritalStatus] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');
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

    const handleAddMember = async () => {
        if (!newMemberName || !newMemberEmail || !newMemberRole) {
            toast({
                title: "Validation Error",
                description: "Please provide name, email, and role for the new member.",
                variant: "destructive",
            });
            return;
        }

        const newMember = {
            id: uuidv4(),
            name: newMemberName,
            email: newMemberEmail,
            phone: newMemberPhone,
            address: newMemberAddress,
            maritalStatus: newMemberMaritalStatus,
            role: newMemberRole,
            status: "Active",
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
            setNewMemberName('');
            setNewMemberEmail('');
            setNewMemberPhone('');
            setNewMemberAddress('');
            setNewMemberMaritalStatus('');
            setNewMemberRole('');
            await fetchData(); // Refresh user list
        } catch (error) {
            console.error("Error adding member:", error);
            toast({
                title: "Error",
                description: "Could not add the new member. Please try again.",
                variant: "destructive",
            });
        }
    };
    
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
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Member</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Full Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                                <Input placeholder="Email" type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                                <Input placeholder="Phone Number" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} />
                                <Input placeholder="Residential Address" value={newMemberAddress} onChange={(e) => setNewMemberAddress(e.target.value)} />
                                <Select onValueChange={setNewMemberMaritalStatus} value={newMemberMaritalStatus}><SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select>
                                <Select onValueChange={setNewMemberRole} value={newMemberRole}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent></Select>
                                <Button onClick={handleAddMember}>Add Member</Button>
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
        </div>
    )
}
