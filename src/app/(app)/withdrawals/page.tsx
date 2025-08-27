
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCollection } from '@/services/firestore';
import { format } from 'date-fns';

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
};

const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);
}

export default function WithdrawalsPage() {
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [withdrawalHistory, setWithdrawalHistory] = useState<Transaction[]>([]);
  const [summaryData, setSummaryData] = useState({
    availablePool: 0,
    pendingRequests: 0,
    myLastWithdrawal: "N/A",
  });

  async function fetchData() {
    const transactionData = await getCollection('transactions') as Transaction[];
    
    const totalContributions = transactionData
      .filter(tx => tx.type === 'Contribution')
      .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
      
    const totalWithdrawals = transactionData
      .filter(tx => tx.type === 'Withdrawal')
      .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

    const pendingWithdrawals = transactionData.filter(tx => tx.type === 'Withdrawal' && tx.status === 'Pending');

    // Hardcoded user, replace with actual logged in user in a real app
    const myWithdrawals = transactionData
      .filter(tx => tx.type === 'Withdrawal' && (tx.email === 'user@example.com' || tx.email === 'k.adu@example.com'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setWithdrawalHistory(myWithdrawals);

    let lastWithdrawalString = "N/A";
    if (myWithdrawals.length > 0) {
      const lastTx = myWithdrawals[0];
      lastWithdrawalString = `${lastTx.amount} on ${format(new Date(lastTx.date), 'MMM d, yyyy')}`;
    }

    setSummaryData({
      availablePool: totalContributions - totalWithdrawals,
      pendingRequests: pendingWithdrawals.length,
      myLastWithdrawal: lastWithdrawalString,
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const summaryCards = [
    { title: "Available Pool", value: formatCurrency(summaryData.availablePool) },
    { title: "Pending Requests", value: summaryData.pendingRequests.toString() },
    { title: "My Last Withdrawal", value: summaryData.myLastWithdrawal },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Withdrawals</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="500.00" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Select>
                  <SelectTrigger id="group-name">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accra">Susu Collective Accra</SelectItem>
                    <SelectItem value="kumasi">Susu Collective Kumasi</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                 <Select onValueChange={setWithdrawalMethod} defaultValue="bank">
                    <SelectTrigger id="destination"><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="momo">Momo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {withdrawalMethod === 'bank' && (
              <div className="space-y-4 rounded-md border p-4">
                 <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input id="bank-name" placeholder="Enter bank name" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input id="account-number" placeholder="Enter account number" />
                </div>
              </div>
            )}
            {withdrawalMethod === 'momo' && (
              <div className="space-y-2 rounded-md border p-4">
                 <Label htmlFor="momo-number">Momo Number</Label>
                  <Input id="momo-number" placeholder="Enter momo number" />
              </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Reason for withdrawal (e.g., emergency, project)" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">Withdrawal requests require approval from 2 admins. This may take up to 48 hours.</p>
            <div className="flex flex-col gap-2">
                <Button>Submit Request</Button>
                <Button variant="ghost">Cancel</Button>
            </div>
          </CardFooter>
        </Card>

         <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>My Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawalHistory.length > 0 ? withdrawalHistory.map((item, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium">{item.desc || item.type}</TableCell>
                            <TableCell><Badge variant="outline" className="border-accent text-accent">{item.type}</Badge></TableCell>
                            <TableCell>{item.amount}</TableCell>
                            <TableCell>{item.date}</TableCell>
                        </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">No withdrawal history.</TableCell>
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
