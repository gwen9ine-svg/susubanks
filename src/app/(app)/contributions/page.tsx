
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCollection } from '@/services/firestore';

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

const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[^0-9.-]+/g,""));
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);
}

const history = [
    { ref: "CONT-07-2024-A1", amount: "GH₵250.00", status: "Completed", date: "July 1, 2024" },
    { ref: "CONT-06-2024-A1", amount: "GH₵250.00", status: "Completed", date: "June 1, 2024" },
    { ref: "CONT-05-2024-A1", amount: "GH₵250.00", status: "Processing", date: "May 1, 2024" },
    { ref: "CONT-04-2024-A1", amount: "GH₵250.00", status: "Completed", date: "April 1, 2024" },
];

const allContributions = [
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024" },
    { desc: "Contribution", member: "Ama Serwaa", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024" },
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "GH₵250.00", date: "June 1, 2024" },
    { desc: "Contribution", member: "Yaw Mensah", type: "Contribution", amount: "GH₵250.00", date: "June 1, 2024" },
];

export default function ContributionsPage() {
  const [depositMethod, setDepositMethod] = useState('bank');
  const [summaryData, setSummaryData] = useState({
    totalContributions: 0,
    myContributions: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const transactionData = await getCollection('transactions') as Transaction[];
      const contributions = transactionData.filter(tx => tx.type === 'Contribution');
      
      const totalContributions = contributions.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
      
      // NOTE: Hardcoding 'my' contributions to a specific user for now.
      // In a real app, this would be based on the logged-in user's ID.
      const myContributions = contributions
        .filter(tx => tx.email === 'k.adu@example.com')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      setSummaryData({ totalContributions, myContributions });
    }
    fetchData();
  }, []);

  const summaryCards = [
    { title: "Total Contributions", value: formatCurrency(summaryData.totalContributions) },
    { title: "My Contributions", value: formatCurrency(summaryData.myContributions) },
    { title: "Next Due", value: "July 25, 2024" }, // This remains static for now
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Contributions</h1>
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
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Make a Contribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="250.00" />
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
                <Label htmlFor="deposit-to">Deposit To</Label>
                <Select onValueChange={setDepositMethod} defaultValue="bank">
                  <SelectTrigger id="deposit-to">
                    <SelectValue placeholder="Select deposit method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="momo">Momo</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            {depositMethod === 'bank' && (
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
            {depositMethod === 'momo' && (
              <div className="space-y-2 rounded-md border p-4">
                 <Label htmlFor="momo-number">Momo Number</Label>
                  <Input id="momo-number" placeholder="Enter momo number" />
              </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" placeholder="Optional note for the transaction" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">Your contribution will be marked as 'Processing' until confirmed by an admin.</p>
            <div className="flex flex-col gap-2">
                <Button>Submit Contribution</Button>
                <Button variant="ghost">Cancel</Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{item.ref}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell><Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className={item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{item.status}</Badge></TableCell>
                        <TableCell>{item.date}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>All Contributions</CardTitle>
            <CardDescription>A log of all contributions from every member.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allContributions.map((item, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{item.desc}</TableCell>
                        <TableCell>{item.member}</TableCell>
                        <TableCell><Badge variant="outline" className="border-primary/50 text-primary">{item.type}</Badge></TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>{item.date}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
