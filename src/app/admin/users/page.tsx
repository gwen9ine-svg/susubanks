

'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import { getCollection, deleteDocument } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, writeBatch } from "firebase/firestore";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Contributor' | 'Member' | 'Loan' | 'Pending' | 'Terminated' | string;
  address?: string;
  maritalStatus?: string;
  group?: string;
  phone?: string;
  dob?: string;
  nationality?: string;
  govIdType?: string;
  idNumber?: string;
  sourceOfFunds?: string;
  invitedBy?: string;
  role?: 'Admin' | 'Member' | string;
};

type Transaction = {
  id: string;
  type: 'Contribution' | 'Withdrawal' | 'Deposit' | string;
  amount: string;
  email?: string;
  member: string;
  status: string;
  desc?: string;
  date: string;
};

type Loan = {
  id: string;
  amount: string;
  status: 'Outstanding' | 'Paid' | 'Approved' | 'Pending' | string;
  memberName: string;
  email?: string;
  date: string;
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
        case "Contributor": return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
        case "Active":
        case "Member": return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case "Loan": return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case "Suspended": return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        case "Pending": return <Badge className="bg-orange-100 text-orange-800">{status}</Badge>;
        case "Terminated": return <Badge className="bg-gray-500 text-white">{status}</Badge>;
        default: return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
}

const DetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium">{value || 'N/A'}</span>
    </div>
);


export default function UsersDirectoryPage() {
    const [allUsers, setAllUsers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allLoans, setAllLoans] = useState<Loan[]>([]);
    const [selectedUser, setSelectedUser] = useState<Member | null>(null);
    const [summaryCards, setSummaryCards] = useState([
        { title: "Total Members", value: "0" },
        { title: "Active Groups", value: "0" },
        { title: "Monthly Deposits", value: formatCurrency(0) },
        { title: "Total Loans Given", value: formatCurrency(0) },
    ]);
    const { toast } = useToast();
    const [allGroups, setAllGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    async function fetchData() {
      setLoading(true);
      const memberData = await getCollection('members') as Member[];
      const transactionData = await getCollection('transactions') as Transaction[];
      const loanData = await getCollection('loans') as Loan[];
      
      const activeUsers = memberData.filter(u => u.status !== 'Terminated' && u.role !== 'Admin');
      const uniqueGroups = [...new Set(memberData.filter(m => m.role !== 'Admin').map(m => m.group).filter(Boolean))] as string[];

      setAllGroups(uniqueGroups);
      setAllTransactions(transactionData);
      setAllLoans(loanData);
      setAllUsers(memberData.filter(m => m.role !== 'Admin'));

      const monthlyDeposits = transactionData
        .filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      const totalLoansGiven = loanData
        .filter(loan => loan.status === 'Approved' || loan.status === 'Paid')
        .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

      setSummaryCards([
        { title: "Total Members", value: activeUsers.length.toString() },
        { title: "Active Groups", value: uniqueGroups.length.toString() },
        { title: "Monthly Deposits", value: formatCurrency(monthlyDeposits) },
        { title: "Total Loans Given", value: formatCurrency(totalLoansGiven) },
      ]);
      
      if (selectedUser) {
        const updatedSelectedUser = memberData.find(u => u.id === selectedUser.id);
        setSelectedUser(updatedSelectedUser || null);
      } else if(activeUsers.length > 0) {
        setSelectedUser(activeUsers[0]);
      } else {
        setSelectedUser(null);
      }
      
      setLoading(false);
    }
    
    useEffect(() => {
      fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        return allUsers
            .filter(user => user.status !== 'Terminated')
            .filter(user => {
                const matchesGroup = selectedGroup ? user.group === selectedGroup : true;
                const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesGroup && matchesSearch;
            });
    }, [allUsers, selectedGroup, searchTerm]);

    useEffect(() => {
        if (filteredUsers.length > 0) {
            setSelectedUser(u => filteredUsers.find(fu => fu.id === u?.id) || filteredUsers[0]);
        } else {
            setSelectedUser(null);
        }
    }, [filteredUsers]);
    
    const handleTerminateUser = async (userId: string) => {
        try {
            await deleteDocument('members', userId);
            toast({
                title: 'User Account Deleted',
                description: 'The user account has been permanently deleted.',
                variant: 'destructive'
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Deletion Failed',
                description: 'Could not delete the user. Please try again.',
                variant: 'destructive'
            });
        }
    };
    
    const handleTerminateGroup = async (groupId: string | undefined) => {
        if (!groupId) {
            toast({ title: 'No group selected.', variant: 'destructive'});
            return;
        }

        try {
            const membersToDelete = allUsers.filter(user => user.group === groupId);
            const batch = writeBatch(db);

            membersToDelete.forEach(member => {
                const docRef = doc(db, 'members', member.id);
                batch.delete(docRef);
            });

            await batch.commit();

            toast({
                title: 'Group Terminated',
                description: `Group ${groupId.replace('group', ' ')} and all its members have been deleted.`,
                variant: 'destructive'
            });
            fetchData();
        } catch (error) {
            console.error(`Error deleting group ${groupId}:`, error);
            toast({
                title: 'Group Deletion Failed',
                description: 'Could not delete the group. Please try again.',
                variant: 'destructive'
            });
        }
    }


    const userTransactions = selectedUser
        ? allTransactions.filter(tx => tx.email === selectedUser.email)
        : [];
        
    const pendingMemberRequests = selectedUser
        ? allUsers.filter(u => u.invitedBy === selectedUser.email && u.status === 'Pending')
        : [];

    const userFinancials = useMemo(() => {
        if (!selectedUser) {
            return {
                totalContributions: 0,
                totalWithdrawals: 0,
                totalLoans: 0
            };
        }

        const totalContributions = allTransactions
            .filter(tx => tx.email === selectedUser.email && (tx.type === 'Contribution' || tx.type === 'Deposit') && (tx.status === 'Completed' || tx.status === 'Approved'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const totalWithdrawals = allTransactions
            .filter(tx => tx.email === selectedUser.email && tx.type === 'Withdrawal' && (tx.status === 'Completed' || tx.status === 'Approved'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        
        const totalLoans = allLoans
            .filter(loan => loan.email === selectedUser.email && (loan.status === 'Approved' || loan.status === 'Paid' || loan.status === 'Outstanding'))
            .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

        return { totalContributions, totalWithdrawals, totalLoans };
    }, [selectedUser, allTransactions, allLoans]);


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users</h1>
            
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
                 <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Groups</CardTitle>
                            <CardDescription>Select a group to view its members.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <Button
                                variant={!selectedGroup ? 'secondary' : 'outline'}
                                className="w-full justify-start"
                                onClick={() => setSelectedGroup(null)}
                            >
                                All Users
                            </Button>
                            {allGroups.map(group => {
                                const memberCount = allUsers.filter(u => u.group === group && u.status !== 'Terminated').length;
                                return (
                                <div key={group} className="flex items-center gap-2">
                                     <Button
                                        variant={selectedGroup === group ? 'secondary' : 'outline'}
                                        className="w-full justify-start"
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        <span className="flex-1">{group.replace('group', 'Group ')} ({memberCount})</span>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive/70 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action is irreversible. This will permanently delete <span className="font-bold">{group.replace('group', 'Group ')}</span> and all of its members.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleTerminateGroup(group)}>
                                                Continue
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </CardHeader>
                        <CardContent className="p-0">
                           <ul className="divide-y max-h-[600px] overflow-y-auto">
                             {loading ? (
                                 <li className="p-4 text-center text-muted-foreground">Loading users...</li>
                             ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <li key={user.id} onClick={() => setSelectedUser(user)} className={`p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} data-ai-hint="person avatar"/>
                                                <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(user.status)}
                                    </li>
                                 ))
                             ) : (
                                <li className="p-4 text-center text-muted-foreground">No users found.</li>
                             )}
                           </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {!selectedUser && !loading && (
                         <Card className="flex items-center justify-center h-96">
                            <CardContent>
                                <p className="text-muted-foreground">Select a user to view their details.</p>
                            </CardContent>
                        </Card>
                    )}
                    {loading && (
                        <Card className="flex items-center justify-center h-96">
                           <CardContent>
                               <p className="text-muted-foreground">Loading user details...</p>
                           </CardContent>
                       </Card>
                    )}
                    {selectedUser && (
                        <>
                        <Card>
                            <CardHeader>
                                <CardTitle>User Details for {selectedUser?.name || '...'}</CardTitle>
                                <CardDescription>View and manage user information.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="profile">
                                    <TabsList className="w-full grid grid-cols-3">
                                        <TabsTrigger value="profile">Profile</TabsTrigger>
                                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                        <TabsTrigger value="requests">Member Requests</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="profile" className="pt-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <DetailItem label="Full Name" value={selectedUser?.name} />
                                                <DetailItem label="Email Address" value={selectedUser?.email} />
                                                <DetailItem label="Phone Number" value={selectedUser?.phone} />
                                                <DetailItem label="Group" value={selectedUser?.group ? selectedUser.group.replace('group', 'Group ') : 'N/A'} />
                                                <DetailItem label="Status" value={selectedUser?.status} />
                                                <DetailItem label="Date of Birth" value={selectedUser?.dob} />
                                                <DetailItem label="Nationality" value={selectedUser?.nationality} />
                                                <DetailItem label="Residential Address" value={selectedUser?.address} />
                                                <DetailItem label="Marital Status" value={selectedUser?.maritalStatus} />
                                                <DetailItem label="ID Type" value={selectedUser?.govIdType} />
                                                <DetailItem label="ID Number" value={selectedUser?.idNumber} />
                                                <DetailItem label="Source of Funds" value={selectedUser?.sourceOfFunds} />
                                            </div>
                                        </div>
                                    </TabsContent>
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
                                                        <TableCell>{tx.date}</TableCell>
                                                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center">No transactions for this user.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                    <TabsContent value="requests" className="pt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Group</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pendingMemberRequests.length > 0 ? pendingMemberRequests.map(req => (
                                                    <TableRow key={req.id}>
                                                        <TableCell>{req.name}</TableCell>
                                                        <TableCell>{req.email}</TableCell>
                                                        <TableCell>{req.group ? req.group.replace('group', 'Group ') : 'N/A'}</TableCell>
                                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center">No pending member requests from this user.</TableCell>
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
                                <CardTitle>Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="text-sm text-muted-foreground">Total Contributions</h4>
                                    <p className="text-xl font-bold">{formatCurrency(userFinancials.totalContributions)}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="text-sm text-muted-foreground">Total Withdrawals</h4>
                                    <p className="text-xl font-bold">{formatCurrency(userFinancials.totalWithdrawals)}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="text-sm text-muted-foreground">Total Loans</h4>
                                    <p className="text-xl font-bold">{formatCurrency(userFinancials.totalLoans)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Terminate User Account</p>
                                        <p className="text-sm text-muted-foreground">This will permanently delete the user's account.</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={!selectedUser}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Terminate User
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the account for <span className="font-bold">{selectedUser?.name}</span> and all associated data.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => selectedUser && handleTerminateUser(selectedUser.id)}>
                                                Continue
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
