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
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const summaryCards = [
  { title: "Group Balance", value: "$12,500.00", description: "Total funds in the collective" },
  { title: "My Contributions", value: "$2,500.00", description: "Your total contributions" },
  { title: "Upcoming Payment", value: "$250.00", description: "Due on July 25, 2024" },
];

const metricCards = [
    { title: "Active Members", value: "50" },
    { title: "Loans Outstanding", value: "$3,200.00" },
    { title: "On-time Rate", value: "98.5%" },
]

const members = [
  { id: '1', name: "Kofi Adu", email: "k.adu@example.com", avatar: "https://picsum.photos/100/100?a", role: "Admin", contributed: "$2,500", status: "Active" },
  { id: '2', name: "Ama Serwaa", email: "a.serwaa@example.com", avatar: "https://picsum.photos/100/100?b", role: "Member", contributed: "$1,750", status: "Active" },
  { id: '3', name: "Yaw Mensah", email: "y.mensah@example.com", avatar: "https://picsum.photos/100/100?c", role: "Member", contributed: "$2,000", status: "On Leave" },
  { id: '4', name: "Adwoa Boateng", email: "a.boateng@example.com", avatar: "https://picsum.photos/100/100?d", role: "Member", contributed: "$2,200", status: "Active" },
  { id: '5', name: "Kwame Nkrumah", email: "k.nkrumah@example.com", avatar: "https://picsum.photos/100/100?e", role: "Member", contributed: "$1,500", status: "Suspended" },
];

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
      
      <div className="grid gap-4 md:grid-cols-3">
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
              {members.map((member) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
