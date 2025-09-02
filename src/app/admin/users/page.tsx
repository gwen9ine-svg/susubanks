

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
import { useEffect, useState } from "react";
import { getCollection, updateDocument, deleteDocument } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Trash2 } from "lucide-react";

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
  phone?: string;
  dob?: string;
  nationality?: string;
  govIdType?: string;
  idNumber?: string;
  sourceOfFunds?: string;
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
        case "Contributor": return "bg-blue-100 text-blue-800";
        case "Active":
        case "Member": return "bg-green-100 text-green-800";
        case "Loan": return "bg-yellow-100 text-yellow-800";
        case "Suspended": return "bg-red-100 text-red-800";
        case "Pending": return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

const DetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium">{value || 'N/A'}</span>
    </div>
);


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
      
      const pendingApprovalUsers = memberData.filter(m => m.status === 'Pending');
      setPendingUsers(pendingApprovalUsers);

      const totalMembers = memberData.length;
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
      if (selectedUser) {
        const updatedSelectedUser = memberData.find(u => u.id === selectedUser.id);
        setSelectedUser(updatedSelectedUser || (memberData.length > 0 ? memberData[0] : null));
      } else if(memberData.length > 0) {
        setSelectedUser(memberData[0]);
      } else {
        setSelectedUser(null);
      }
      
      setLoading(false);
    }
    
    useEffect(() => {
      fetchData();
    }, []);
    
    const handleTerminateUser = async (userId: string) => {
        try {
            await deleteDocument('members', userId);
            toast({
                title: 'User Terminated',
                description: 'The user account has been permanently deleted.',
                variant: 'destructive'
            });
            fetchData();
        } catch (error) {
            console.error('Error terminating user:', error);
            toast({
                title: 'Termination Failed',
                description: 'Could not delete the user. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const userTransactions = selectedUser
        ? allTransactions.filter(tx => tx.email === selectedUser.email)
        : [];
        
    const userLoans = selectedUser
        ? allLoans.filter(loan => loan.email === selectedUser.email)
        : [];

    const userFinancials = React.useMemo(() => {
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
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Input placeholder="Search users..."/>
                    </CardHeader>
                    <CardContent className="p-0">
                       <ul className="divide-y max-h-[600px] overflow-y-auto">
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
                            <Tabs defaultValue="profile">
                                <TabsList className="w-full grid grid-cols-3">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                    <TabsTrigger value="loans">Loans</TabsTrigger>
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
                                                    <TableCell>{loan.date}</TableCell>
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
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Terminate User Account</p>
                                    <p className="text-sm text-muted-foreground">This will permanently delete the user and all associated data.</p>
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
                                            This action cannot be undone. This will permanently delete the
                                            account for <span className="font-bold">{selectedUser?.name}</span> and remove all their data from our servers.
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
                </div>
            </div>
        </div>
    )
}
