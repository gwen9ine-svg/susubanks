

// src/app/(app)/dashboard/page.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCollection, seedDatabase } from "@/services/firestore"
import { HandCoins, Landmark, Banknote, Users, TrendingUp, TrendingDown } from "lucide-react"

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

type Loan = {
  id: string;
  amount: string;
  status: 'Outstanding' | 'Paid' | 'Approved' | 'Pending' | string;
  email?: string;
  group?: string;
};

type Member = {
    id: string;
    group?: string;
    email: string;
    name: string;
    avatar: string;
    status: string;
    contributed: string;
};

const parseAmount = (amount: string): number => {
    if (!amount || typeof amount !== 'string') return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

// ✅ Helper for status color
function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-500"
    case "Pending":
      return "bg-yellow-500"
    case "Inactive":
    case "Suspended":
      return "bg-red-500"
    default:
      return "bg-gray-200"
  }
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Admin state
  const [members, setMembers] = useState<any[]>([])
  const [adminSummary, setAdminSummary] = useState({
    totalUsers: "0",
    totalGroups: "6",
    approvedWithdrawals: formatCurrency(0),
    totalContributions: formatCurrency(0),
  });

  // Member state
  const [memberSummary, setMemberSummary] = useState({
      myContributions: 0,
      myWithdrawals: 0,
      myApprovedLoans: 0,
  });
  const [groupSummary, setGroupSummary] = useState({
      groupName: '',
      groupContributions: 0,
      groupWithdrawals: 0,
      groupLoans: 0,
  });
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);

  const handleSeed = async () => {
    setLoading(true);
    await seedDatabase();
    await fetchData();
  }

  async function fetchData() {
    setLoading(true);
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    setUserRole(role);
    setUserEmail(email);
    setUserName(name);

    if (role === 'admin') {
      const memberData = await getCollection('members');
      const transactionData = await getCollection('transactions');
      
      const totalMembers = memberData.length;
      
      const approvedWithdrawals = transactionData
          .filter((tx: any) => tx.type === 'Withdrawal' && (tx.status === 'Approved' || tx.status === 'Completed'))
          .reduce((acc: number, tx: any) => acc + parseAmount(tx.amount), 0);

      const totalContributions = transactionData
          .filter((tx: any) => (tx.type === 'Contribution' || tx.type === 'Deposit') && (tx.status === 'Completed' || tx.status === 'Approved'))
          .reduce((acc: number, tx: any) => acc + parseAmount(tx.amount), 0);

      setAdminSummary({
        totalUsers: totalMembers.toString(),
        totalGroups: "6",
        approvedWithdrawals: formatCurrency(approvedWithdrawals),
        totalContributions: formatCurrency(totalContributions),
      });
      setMembers(memberData);

    } else if (email) {
      const allTransactions = await getCollection('transactions') as Transaction[];
      const allLoans = await getCollection('loans') as Loan[];
      const allMembers = await getCollection('members') as Member[];

      const currentUser = allMembers.find(m => m.email === email);
      const userGroup = currentUser?.group;

      const userTransactions = allTransactions.filter(tx => tx.email === email);
      const userLoans = allLoans.filter(loan => loan.email === email);

      const myContributions = userTransactions
          .filter(tx => tx.type === 'Contribution' && (tx.status === 'Completed' || tx.status === 'Approved'))
          .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      const myWithdrawals = userTransactions
          .filter(tx => tx.type === 'Withdrawal' && (tx.status === 'Completed' || tx.status === 'Approved'))
          .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
      
      const myApprovedLoans = userLoans
            .filter(loan => loan.status === 'Approved' || loan.status === 'Paid' || loan.status === 'Outstanding')
            .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

      setMemberSummary({ myContributions, myWithdrawals, myApprovedLoans });
      setMyTransactions(userTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

      if(userGroup){
         const groupContributions = allTransactions
            .filter(tx => tx.group === userGroup && tx.type === 'Contribution' && (tx.status === 'Completed' || tx.status === 'Approved'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const groupWithdrawals = allTransactions
            .filter(tx => tx.group === userGroup && tx.type === 'Withdrawal' && (tx.status === 'Completed' || tx.status === 'Approved'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const groupLoans = allLoans
            .filter(loan => loan.group === userGroup && (loan.status === 'Approved' || loan.status === 'Paid' || loan.status === 'Outstanding'))
            .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

        setGroupSummary({
            groupName: userGroup.replace('group', 'Group '),
            groupContributions,
            groupWithdrawals,
            groupLoans
        });
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [])

  if (loading) {
      return <p>Loading dashboard...</p>
  }
  
  if (userRole === 'admin') {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Total number of registered users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary.totalGroups}</div>
                <p className="text-xs text-muted-foreground">Number of active groups</p>
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminSummary.totalContributions}</div>
                  <p className="text-xs text-muted-foreground">Across all groups</p>
                </CardContent>
              </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminSummary.approvedWithdrawals}</div>
                </CardContent>
              </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>An overview of your group members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Contributed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading members...</TableCell>
                    </TableRow>
                  ) : members.length > 0 ? (
                    members.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.contributed}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                            {member.status}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center space-y-4 py-8">
                        <p>No members found in the database.</p>
                        <Button onClick={handleSeed}>Seed Database</Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )
  }

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Total Contributions</CardTitle>
                    <HandCoins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(memberSummary.myContributions)}</div>
                    <p className="text-xs text-muted-foreground">All-time contributions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Total Withdrawals</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(memberSummary.myWithdrawals)}</div>
                     <p className="text-xs text-muted-foreground">All-time withdrawals</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Approved Loans</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(memberSummary.myApprovedLoans)}</div>
                    <p className="text-xs text-muted-foreground">All-time approved loans</p>
                </CardContent>
            </Card>
        </div>
        
        {groupSummary.groupName && (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">{groupSummary.groupName} Summary</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Contributions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(groupSummary.groupContributions)}</div>
                        <p className="text-xs text-muted-foreground">Total contributions from your group</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Withdrawals</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(groupSummary.groupWithdrawals)}</div>
                        <p className="text-xs text-muted-foreground">Total withdrawals from your group</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Loans</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(groupSummary.groupLoans)}</div>
                        <p className="text-xs text-muted-foreground">Total approved loans in your group</p>
                    </CardContent>
                </Card>
            </div>
        </div>
        )}

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Recent Transactions</CardTitle>
                    <CardDescription>A quick look at your latest activity.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myTransactions.length > 0 ? myTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell>{tx.type}</TableCell>
                                <TableCell>{tx.amount}</TableCell>
                                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No recent transactions.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
