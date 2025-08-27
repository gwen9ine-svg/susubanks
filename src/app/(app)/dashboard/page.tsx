

'use client'

import { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCollection, seedDatabase } from "@/services/firestore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  contributed: string;
  status: 'Active' | 'On Leave' | 'Suspended' | string;
}

type Transaction = {
  id: string;
  type: 'Contribution' | 'Withdrawal' | string;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500";
    case "On Leave":
      return "bg-yellow-500";
    case "Suspended":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};


export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [summary, setSummary] = useState({
    groupBalance: 0,
    myContributions: 0,
    activeMembers: 0,
    loansOutstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const memberData = await getCollection('members') as Member[];
      const transactionData = await getCollection('transactions') as Transaction[];
      const loanData = await getCollection('loans') as Loan[];
      
      const totalContributions = transactionData
        .filter(tx => tx.type === 'Contribution')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      const totalWithdrawals = transactionData
        .filter(tx => tx.type === 'Withdrawal')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        
      const myContributions = transactionData
        .filter(tx => tx.type === 'Contribution' && tx.email === 'k.adu@example.com')
        .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

      const activeMembers = memberData.filter(m => m.status === 'Active').length;

      const loansOutstanding = loanData
        .filter(loan => loan.status === 'Outstanding')
        .reduce((acc, loan) => acc + parseAmount(loan.amount), 0);

      setMembers(memberData);
      setSummary({
        groupBalance: totalContributions - totalWithdrawals,
        myContributions,
        activeMembers,
        loansOutstanding,
      });

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    await seedDatabase();
    // Re-fetch data after seeding
    const memberData = await getCollection('members');
    setMembers(memberData as Member[]);
    setLoading(false);
    router.refresh();
  };

  const summaryCards = [
    { title: "Group Balance", value: formatCurrency(summary.groupBalance), description: "Total funds in the collective" },
    { title: "My Contributions", value: formatCurrency(summary.myContributions), description: "Your total contributions" },
    { title: "Upcoming Payment", value: "GH₵250.00", description: "Due on July 25, 2024" }, // Static for now
  ];

  const metricCards = [
      { title: "Active Members", value: summary.activeMembers.toString() },
      { title: "Loans Outstanding", value: formatCurrency(summary.loansOutstanding) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {metricCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>An overview of all collective members.</CardDescription>
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
              ) : members.length > 0 ? members.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} data-ai-hint="person avatar" />
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
              )) : (
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
  );
}
