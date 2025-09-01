
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { getCollection } from '@/services/firestore';
import { Button } from '@/components/ui/button';

type Transaction = {
  id: string;
  ref: string;
  member: string;
  avatar: string;
  type: 'Contribution' | 'Withdrawal' | string;
  amount: string;
  date: string;
  status: string;
  email?: string;
  desc?: string;
  group?: string;
};

const parseAmount = (amount: string): number => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'approved':
        case 'completed':
            return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'pending': 
        case 'processing':
            return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

const formatGroupName = (group: string | undefined) => {
    if (!group) return 'N/A';
    return `Group ${group.replace('group', '')}`;
};


export default function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Admin state
  const [allWithdrawals, setAllWithdrawals] = useState<Transaction[]>([]);
  const [groupWithdrawals, setGroupWithdrawals] = useState<Record<string, number>>({});
  const [adminSummary, setAdminSummary] = useState({
    totalWithdrawals: 0,
    pendingRequests: 0,
  });

  // Member state
  const [myWithdrawals, setMyWithdrawals] = useState<Transaction[]>([]);
  const [memberSummary, setMemberSummary] = useState({
    myTotalWithdrawals: 0,
    myPendingWithdrawalsCount: 0,
    myPendingWithdrawalsAmount: 0,
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    setUserRole(role);
    setUserEmail(email);
  }, []);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const transactionData = await getCollection('transactions') as Transaction[];
      const withdrawalTransactions = transactionData.filter(tx => tx.type === 'Withdrawal')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (userRole === 'admin') {
        setAllWithdrawals(withdrawalTransactions);

        const groupTotals: Record<string, number> = {};
        for (let i = 1; i <= 6; i++) {
            const groupKey = `group${i}`;
            groupTotals[groupKey] = withdrawalTransactions
                .filter(c => c.group === groupKey && (c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'approved'))
                .reduce((acc, c) => acc + parseAmount(c.amount), 0);
        }
        setGroupWithdrawals(groupTotals);

        const totalWithdrawals = withdrawalTransactions
            .filter(tx => tx.status === 'Completed' || tx.status === 'Approved')
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        
        const pendingWithdrawals = withdrawalTransactions.filter(tx => tx.status.toLowerCase() === 'pending' || tx.status.toLowerCase() === 'processing');

        setAdminSummary({
          totalWithdrawals: totalWithdrawals,
          pendingRequests: pendingWithdrawals.length,
        });

      } else if (userEmail) {
        const myFilteredWithdrawals = withdrawalTransactions.filter(tx => tx.email === userEmail);
        setMyWithdrawals(myFilteredWithdrawals);
        
        const myTotalWithdrawals = myFilteredWithdrawals
          .filter(c => c.status.toLowerCase() === 'completed' || c.status.toLowerCase() === 'approved')
          .reduce((acc, c) => acc + parseAmount(c.amount), 0);
        
        const myPendingWithdrawals = myFilteredWithdrawals
          .filter(c => c.status.toLowerCase() === 'pending' || c.status.toLowerCase() === 'processing');

        const myPendingWithdrawalsCount = myPendingWithdrawals.length;
        const myPendingWithdrawalsAmount = myPendingWithdrawals.reduce((acc, c) => acc + parseAmount(c.amount), 0);
        
        setMemberSummary({ 
          myTotalWithdrawals,
          myPendingWithdrawalsCount,
          myPendingWithdrawalsAmount,
        });
      }
      setLoading(false);
    }

    if (userRole) {
      fetchData();
    }
  }, [userRole, userEmail]);

  if (loading) {
    return <p>Loading withdrawals...</p>;
  }

  // Admin View
  if (userRole === 'admin') {
      const summaryCards = [
        { title: "Total User Withdrawals", value: formatCurrency(adminSummary.totalWithdrawals) },
        { title: "Pending Withdrawal Requests", value: adminSummary.pendingRequests.toString() },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Withdrawal History</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

          <Card>
            <CardHeader>
                <CardTitle>Withdrawals by Group</CardTitle>
                <CardDescription>Total withdrawals for each group.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupWithdrawals).map(([group, total]) => (
                    <Link href={`/admin/groups/${group}`} key={group} passHref>
                        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium capitalize">{group.replace('group', 'Group ')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(total)}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle>All Withdrawal History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Group</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allWithdrawals.length > 0 ? allWithdrawals.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>{item.member}</TableCell>
                                <TableCell className="font-medium">{item.desc || item.type}</TableCell>
                                <TableCell>{formatGroupName(item.group)}</TableCell>
                                <TableCell>{item.amount}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>{item.date}</TableCell>
                            </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">No withdrawal history.</TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </div>
      );
  }

  // Member View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Withdrawals</h1>
        <Button variant="outline" asChild>
          <Link href="/transactions">New Withdrawal</Link>
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Approved Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(memberSummary.myTotalWithdrawals)}</p>
                <p className="text-xs text-muted-foreground">All-time approved withdrawals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(memberSummary.myPendingWithdrawalsAmount)}</p>
                <p className="text-xs text-muted-foreground">{memberSummary.myPendingWithdrawalsCount} request(s) awaiting approval</p>
            </CardContent>
          </Card>
       </div>
      
      <Card>
        <CardHeader>
            <CardTitle>My Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {myWithdrawals.length > 0 ? myWithdrawals.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell>{item.ref}</TableCell>
                          <TableCell className="font-medium">{item.desc || item.type}</TableCell>
                          <TableCell>{item.amount}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No withdrawal history.</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
