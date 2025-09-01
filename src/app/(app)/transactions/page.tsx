

'use client';

import { useEffect, useState } from "react";
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
import { Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCollection } from "@/services/firestore";

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
};

type SummaryData = {
  totalVolume: number;
  totalContributions: number;
  totalWithdrawals: number;
  contributionEntries: number;
  withdrawalEntries: number;
  totalEntries: number;
};

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'Contribution':
            return <Badge variant="outline" className="border-primary/50 text-primary">{type}</Badge>;
        case 'Withdrawal':
            return <Badge variant="outline" className="border-accent text-accent">{type}</Badge>;
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
}

const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'completed':
        case 'approved':
            return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
        case 'pending':
        case 'processing':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', currencyDisplay: 'symbol' }).format(value);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalVolume: 0,
    totalContributions: 0,
    totalWithdrawals: 0,
    contributionEntries: 0,
    withdrawalEntries: 0,
    totalEntries: 0,
  });

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const transactionData = await getCollection('transactions') as Transaction[];
      
      let userTransactions = transactionData;
      const email = localStorage.getItem('userEmail');
      if(email) {
        userTransactions = transactionData.filter(tx => tx.email === email);
      }
      
      const sortedTransactions = userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sortedTransactions);
      setLoading(false);
    }
    
    fetchTransactions();

  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const summary = transactions.reduce((acc, tx) => {
        const amount = parseAmount(tx.amount);
        const status = tx.status.toLowerCase();

        if (tx.type === 'Contribution') {
          if (status === 'completed' || status === 'approved' || status === 'processing' || status === 'pending') {
            acc.totalContributions += amount;
            acc.contributionEntries++;
          }
        } else if (tx.type === 'Withdrawal') {
          if (status === 'completed' || status === 'approved') {
            acc.totalWithdrawals += amount;
            acc.withdrawalEntries++;
          }
        }
        return acc;
      }, {
        totalVolume: 0,
        totalContributions: 0,
        totalWithdrawals: 0,
        contributionEntries: 0,
        withdrawalEntries: 0,
        totalEntries: 0,
      });

      summary.totalVolume = summary.totalContributions + summary.totalWithdrawals;
      summary.totalEntries = summary.contributionEntries + summary.withdrawalEntries;

      setSummaryData(summary);
    } else {
        setSummaryData({
            totalVolume: 0,
            totalContributions: 0,
            totalWithdrawals: 0,
            contributionEntries: 0,
            withdrawalEntries: 0,
            totalEntries: 0,
        });
    }
  }, [transactions]);
  
  const summaryCards = [
    { title: "Total Volume", value: formatCurrency(summaryData.totalVolume), count: `${summaryData.totalEntries} entries` },
    { title: "Contributions", value: formatCurrency(summaryData.totalContributions), count: `${summaryData.contributionEntries} entries` },
    { title: "Withdrawals", value: formatCurrency(summaryData.totalWithdrawals), count: `${summaryData.withdrawalEntries} entries` },
    { title: "Fees & Adjustments", value: formatCurrency(0), count: "0 entries" },
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Transactions</h1>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>All My Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Member</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center">Loading transactions...</TableCell>
                            </TableRow>
                          ) : transactions.length > 0 ? transactions.map((tx: any) => (
                                <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{tx.ref}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={tx.avatar} data-ai-hint="person avatar" />
                                                <AvatarFallback>{tx.member.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <span>{tx.member}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                    <TableCell>{tx.amount}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">No transactions found.</TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
