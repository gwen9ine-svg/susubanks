

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

const summaryCards = [
  { title: "Group Balance", value: "GH₵12,500.00", description: "Total funds in the collective" },
  { title: "My Contributions", value: "GH₵2,500.00", description: "Your total contributions" },
  { title: "Upcoming Payment", value: "GH₵250.00", description: "Due on July 25, 2024" },
];

const metricCards = [
    { title: "Active Members", value: "50" },
    { title: "Loans Outstanding", value: "GH₵3,200.00" },
]

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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      const memberData = await getCollection('members');
      setMembers(memberData);
      setLoading(false);
    }
    fetchMembers();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    await seedDatabase();
    const memberData = await getCollection('members');
    setMembers(memberData);
    setLoading(false);
    router.refresh();
  };

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
