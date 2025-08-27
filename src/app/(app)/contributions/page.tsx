

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
import { addDocument, getCollection } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Check, X } from 'lucide-react';

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

const allContributions = [
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024", status: "Completed" },
    { desc: "Contribution", member: "Ama Serwaa", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024", status: "Completed" },
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "GH₵250.00", date: "June 1, 2024", status: "Completed" },
    { desc: "Contribution", member: "Yaw Mensah", type: "Contribution", amount: "GH₵250.00", date: "June 1, 2024", status: "Processing" },
];

export default function ContributionsPage() {
  const { toast } = useToast();
  const [depositMethod, setDepositMethod] = useState('bank');
  const [contributionHistory, setContributionHistory] = useState<Transaction[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalContributions: 0,
    myContributions: 0,
  });

  // Form state
  const [amount, setAmount] = useState('');
  const [group, setGroup] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchContributionData() {
    const transactionData = await getCollection('transactions') as Transaction[];
    const contributions = transactionData.filter(tx => tx.type === 'Contribution');
    
    const totalContributions = contributions.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
    
    // Hardcoded user, replace with actual logged in user in a real app
    const myContributions = contributions
      .filter(tx => tx.email === 'user@example.com' || tx.email === 'k.adu@example.com') 
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const myContributionTotal = myContributions.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
      
    setContributionHistory(myContributions);
    setSummaryData({ totalContributions, myContributions: myContributionTotal });
  }

  useEffect(() => {
    fetchContributionData();
  }, []);

  const clearForm = () => {
    setAmount('');
    setGroup('');
    setBankName('');
    setAccountNumber('');
    setMomoNumber('');
    setNote('');
  }

  const handleSubmit = async () => {
    if (!amount || !group) {
        toast({
            title: "Validation Error",
            description: "Please fill in the amount and select a group.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);

    const newContribution = {
      id: uuidv4(),
      // Hardcoding user details for now
      member: "Regular User", 
      email: "user@example.com",
      avatar: "https://picsum.photos/100/100",
      ref: `CONT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      type: 'Contribution',
      amount: formatCurrency(parseFloat(amount)),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'Processing',
      note: note,
      depositDetails: {
        method: depositMethod,
        bankName: depositMethod === 'bank' ? bankName : null,
        accountNumber: depositMethod === 'bank' ? accountNumber : null,
        momoNumber: depositMethod === 'momo' ? momoNumber : null,
      }
    };

    try {
        await addDocument('transactions', newContribution, newContribution.id);
        toast({
            title: "Contribution Submitted",
            description: "Your contribution has been submitted for processing.",
        });
        await fetchContributionData(); // Re-fetch summary data
        clearForm();
    } catch(error) {
        console.error("Error submitting contribution:", error);
        toast({
            title: "Submission Error",
            description: "There was an error submitting your contribution. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


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
                <Input id="amount" type="number" placeholder="50.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="50" max="100000" step="0.01" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Select value={group} onValueChange={setGroup}>
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
                <Select onValueChange={setDepositMethod} defaultValue="bank" value={depositMethod}>
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
                  <Input id="bank-name" placeholder="Enter bank name" value={bankName} onChange={(e) => setBankName(e.target.value)}/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input id="account-number" placeholder="Enter account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}/>
                </div>
              </div>
            )}
            {depositMethod === 'momo' && (
              <div className="space-y-2 rounded-md border p-4">
                 <Label htmlFor="momo-number">Momo Number</Label>
                  <Input id="momo-number" placeholder="Enter momo number" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)}/>
              </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" placeholder="Optional note for the transaction" value={note} onChange={(e) => setNote(e.target.value)}/>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">Your contribution will be marked as 'Processing' until confirmed by an admin.</p>
            <div className="flex flex-col gap-2">
                <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Contribution'}</Button>
                <Button variant="ghost" onClick={clearForm}>Cancel</Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
            <CardDescription>Your recent contributions.</CardDescription>
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
                    {contributionHistory.length > 0 ? (
                      contributionHistory.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.ref}</TableCell>
                          <TableCell>{item.amount}</TableCell>
                          <TableCell><Badge variant={item.status === 'Completed' || item.status === 'Settled' ? 'default' : 'secondary'} className={item.status === 'Completed' || item.status === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{item.status}</Badge></TableCell>
                          <TableCell>{item.date}</TableCell>
                      </TableRow>
                      ))
                    ) : (
                       <TableRow>
                          <TableCell colSpan={4} className="text-center">No contribution history yet.</TableCell>
                       </TableRow>
                    )}
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
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
                        <TableCell><Badge variant={item.status === 'Completed' || item.status === 'Settled' ? 'default' : 'secondary'} className={item.status === 'Completed' || item.status === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{item.status}</Badge></TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
