
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
import { MoreVertical, MessageSquare, CheckCircle, XCircle, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getCollection } from "@/services/firestore";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Contributor' | 'Member' | 'Loan' | string;
};

type Transaction = {
  id: string;
  type: 'Contribution' | 'Withdrawal' | 'Deposit' | string;
  amount: string;
  email?: string;
};

type Loan = {
  id: string;
  amount: string;
  status: 'Outstanding' | 'Paid' | string;
}

const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Contributor": return "bg-blue-100 text-blue-800";
        case "Active":
        case "Member": return "bg-green-100 text-green-800";
        case "Loan": return "bg-yellow-100 text-yellow-800";
        case "Suspended": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

export default function UsersDirectoryPage() {
    const [users, setUsers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [summaryCards, setSummaryCards] = useState([
        { title: "Total Members", value: "0" },
        { title: "Active Groups", value: "1" },
        { title: "Monthly Deposits", value: formatCurrency(0) },
        { title: "Loan Outstanding", value: formatCurrency(0) },
    ]);

    useEffect(() => {
      async function fetchData() {
        setLoading(true);
        const memberData = await getCollection('members') as Member[];
        const transactionData = await getCollection('transactions') as Transaction[];
        const loanData = await getCollection('loans') as Loan[];

        const totalMembers = memberData.length;
        const monthlyDeposits = transactionData
          .filter(tx => tx.type === 'Contribution' || tx.type === 'Deposit')
          .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const loansOutstanding = loanData
          .filter(loan => loan.status === 'Outstanding')
          .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

        setSummaryCards([
          { title: "Total Members", value: totalMembers.toString() },
          { title: "Active Groups", value: "1" },
          { title: "Monthly Deposits", value: formatCurrency(monthlyDeposits) },
          { title: "Loan Outstanding", value: formatCurrency(loansOutstanding) },
        ]);

        setUsers(memberData);
        setLoading(false);
      }
      fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users Directory</h1>
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
                                <li key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
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
                            <CardTitle>User Details</CardTitle>
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
                                            <TableRow>
                                                <TableCell>Contribution</TableCell>
                                                <TableCell>GH₵250.00</TableCell>
                                                <TableCell>July 1, 2024</TableCell>
                                                <TableCell><Badge className="bg-green-100 text-green-800">Approved</Badge></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Withdrawal</TableCell>
                                                <TableCell>GH₵500.00</TableCell>
                                                <TableCell>May 15, 2024</TableCell>
                                                <TableCell><Badge className="bg-red-100 text-red-800">Rejected</Badge></TableCell>
                                            </TableRow>
                                        </TableBody>
                                     </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Member</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Full Name" />
                                <Input placeholder="Phone Number" />
                                 <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
                                <Button>Add Member</Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Pending Requests</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs defaultValue="withdrawals">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                                        <TabsTrigger value="joins">Join Requests</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="withdrawals" className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Yaw Mensah</p>
                                                    <p className="text-sm text-muted-foreground">GH₵1,000 for emergency</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                             <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Adwoa Boateng</p>
                                                    <p className="text-sm text-muted-foreground">GH₵250 for school fees</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="joins" className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Abena Yeboah</p>
                                                    <p className="text-sm text-muted-foreground">Wants to join Accra Group</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
