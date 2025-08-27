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
import { Download } from "lucide-react";

const summaryCards = [
  { title: "Available Pool", value: "$10,200.00" },
  { title: "Pending Requests", value: "3" },
  { title: "My Last Withdrawal", value: "$500 on May 15, 2024" },
];

const pendingApprovals = [
    { ref: "WDR-07-2024-C3", amount: "$1,000.00", member: "Yaw Mensah", status: "Awaiting" },
    { ref: "WDR-07-2024-B2", amount: "$500.00", member: "Adwoa Boateng", status: "Needs 1 more" },
    { ref: "WDR-06-2024-A1", amount: "$750.00", member: "Kwame Nkrumah", status: "Awaiting" },
];

const withdrawalHistory = [
    { desc: "Emergency Withdrawal", member: "Kofi Adu", type: "Withdrawal", amount: "$500.00", date: "May 15, 2024" },
    { desc: "Loan Repayment", member: "Ama Serwaa", type: "Loan", amount: "$1,200.00", date: "April 20, 2024" },
    { desc: "Personal Withdrawal", member: "Yaw Mensah", type: "Withdrawal", amount: "$300.00", date: "March 10, 2024" },
];

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'Awaiting':
            return <Badge variant="secondary" className="bg-orange-100 text-orange-800">{status}</Badge>
        case 'Needs 1 more':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}


export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline">New Withdrawal</Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
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
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="500.00" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                 <Select>
                    <SelectTrigger id="destination"><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent><SelectItem value="primary">Primary Account</SelectItem><SelectItem value="secondary">Backup Account</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Reason for withdrawal (e.g., emergency, project)" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="reference">Reference / ID</Label>
                <Input id="reference" placeholder="Optional" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">Withdrawal requests require approval from 2 admins. This may take up to 48 hours.</p>
            <div className="flex gap-2">
                <Button>Submit Request</Button>
                <Button variant="ghost">Cancel</Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingApprovals.map((item, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{item.ref}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>{item.member}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
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
                    {withdrawalHistory.map((item, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{item.desc}</TableCell>
                        <TableCell>{item.member}</TableCell>
                        <TableCell><Badge variant="outline" className="border-accent text-accent">{item.type}</Badge></TableCell>
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
