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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Copy, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const summaryCards = [
  { title: "Total Volume", value: "$25,345.00", count: "312 entries" },
  { title: "Contributions", value: "$18,750.00", count: "250 entries" },
  { title: "Withdrawals", value: "$6,595.00", count: "48 entries" },
  { title: "Fees & Adjustments", value: "$0.00", count: "14 entries" },
];

const transactions = [
    { ref: "CONT-07-2024-A1", member: "Kofi Adu", email: "k.adu@example.com", avatar: "https://picsum.photos/100/100?a", type: "Contribution", amount: "$250.00", date: "July 1, 2024", status: "Settled" },
    { ref: "WDR-07-2024-C3", member: "Yaw Mensah", email: "y.mensah@example.com", avatar: "https://picsum.photos/100/100?c", type: "Withdrawal", amount: "$1,000.00", date: "July 2, 2024", status: "Pending" },
    { ref: "CONT-07-2024-B2", member: "Ama Serwaa", email: "a.serwaa@example.com", avatar: "https://picsum.photos/100/100?b", type: "Contribution", amount: "$250.00", date: "July 1, 2024", status: "Settled" },
];

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
    switch(status) {
        case 'Settled':
            return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Pending':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline">New Transaction</Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
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
                            {transactions.map((tx, i) => (
                                <TableRow key={i} className="cursor-pointer hover:bg-muted/50">
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Detail</CardTitle>
                    <CardDescription>CONT-07-2024-A1</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between"><span>Member:</span> <span className="font-medium">Kofi Adu</span></div>
                    <div className="flex justify-between"><span>Amount:</span> <span className="font-medium text-green-600">$250.00</span></div>
                    <div className="flex justify-between"><span>Method:</span> <span className="font-medium">Bank Transfer</span></div>
                    <div className="flex justify-between"><span>Status:</span> <span className="font-medium">{getStatusBadge("Settled")}</span></div>
                    <div className="flex justify-between"><span>Category:</span> <span className="font-medium">Contribution</span></div>
                    <div className="flex justify-between"><span>Cycle:</span> <span className="font-medium">Cycle 10</span></div>
                    <div>
                        <p>Notes:</p>
                        <p className="text-muted-foreground">July monthly contribution.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm">Mark Pending</Button>
                        <Button variant="outline" size="sm"><Copy className="mr-2 h-3 w-3" /> Copy Ref</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
                        <div>
                            <p className="font-medium">Payment received</p>
                            <time className="text-xs text-muted-foreground">July 1, 2024, 10:05 AM</time>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary/50" />
                        <div>
                            <p className="font-medium">Status changed to Settled</p>
                             <p className="text-xs text-muted-foreground">by Admin Ama Serwaa</p>
                            <time className="text-xs text-muted-foreground">July 1, 2024, 10:00 AM</time>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
