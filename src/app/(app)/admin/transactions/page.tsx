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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Search, MoreVertical, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const summaryCards = [
    { title: "Total Deposits", value: "$18,750.00" },
    { title: "Total Withdrawals", value: "$6,595.00" },
    { title: "Pending Reviews", value: "5" },
    { title: "Disputes", value: "1" },
];

const transactions = [
    { time: "10:05 AM", type: "Deposit", member: "Kofi Adu", ref: "CONT-07-24-A1", amount: "$250.00", status: "Approved" },
    { time: "11:30 AM", type: "Withdrawal", member: "Yaw Mensah", ref: "WDR-07-24-C3", amount: "$1,000.00", status: "Pending" },
    { time: "02:15 PM", type: "Deposit", member: "Ama Serwaa", ref: "CONT-07-24-B2", amount: "$250.00", status: "Approved" },
    { time: "04:00 PM", type: "Dispute", member: "Adwoa Boateng", ref: "DIS-07-24-D4", amount: "$50.00", status: "Rejected" },
];

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'Deposit': return <Badge variant="outline" className="border-primary/50 text-primary">{type}</Badge>;
        case 'Withdrawal': return <Badge variant="outline" className="border-accent text-accent">{type}</Badge>;
        case 'Dispute': return <Badge variant="destructive">{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'Approved': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Pending': return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'Rejected': return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function AdminTransactionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Transactions</h1>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Button variant="outline">New Transaction</Button>
                    <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
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
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <Input placeholder="Search by member, ref..." />
                           <Input type="date" placeholder="From"/>
                           <Input type="date" placeholder="To"/>
                           <div className="flex gap-2">
                            <Button className="w-full">Apply</Button>
                            <Button variant="ghost" className="w-full">Clear</Button>
                           </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Bulk Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground">2 items selected</p>
                           <div className="flex flex-col gap-2">
                             <Button variant="outline" className="w-full">Approve All</Button>
                             <Button variant="destructive" className="w-full">Reject All</Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="deposits">Deposits</TabsTrigger>
                            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                            <TabsTrigger value="disputes">Disputes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead><Checkbox /></TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Member</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((tx, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Checkbox /></TableCell>
                                                    <TableCell>{tx.time}</TableCell>
                                                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                                    <TableCell>{tx.member}</TableCell>
                                                    <TableCell className="font-medium">{tx.ref}</TableCell>
                                                    <TableCell>{tx.amount}</TableCell>
                                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                                    <TableCell>
                                                        {tx.status === 'Pending' ? (
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                            </div>
                                                        ) : (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Create Dispute</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
