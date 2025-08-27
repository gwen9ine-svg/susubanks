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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreVertical, MessageSquare, CheckCircle, XCircle, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const summaryCards = [
    { title: "Total Members", value: "52" },
    { title: "Active Groups", value: "1" },
    { title: "Monthly Deposits", value: "$8,750.00" },
    { title: "Loan Outstanding", value: "$3,200.00" },
];

const users = [
    { name: "Kofi Adu", avatar: "https://picsum.photos/100/100?a", status: "Contributor", id: "U-12345" },
    { name: "Ama Serwaa", avatar: "https://picsum.photos/100/100?b", status: "Member", id: "U-12346" },
    { name: "Yaw Mensah", avatar: "https://picsum.photos/100/100?c", status: "Loan", id: "U-12347" },
    { name: "Adwoa Boateng", avatar: "https://picsum.photos/100/100?d", status: "Member", id: "U-12348" },
    { name: "Kwame Nkrumah", avatar: "https://picsum.photos/100/100?e", status: "Suspended", id: "U-12349" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Contributor": return "bg-blue-100 text-blue-800";
        case "Member": return "bg-green-100 text-green-800";
        case "Loan": return "bg-yellow-100 text-yellow-800";
        case "Suspended": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

export default function UsersDirectoryPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Users Directory</h1>
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

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Input placeholder="Search users..."/>
                    </CardHeader>
                    <CardContent className="p-0">
                       <ul className="divide-y">
                         {users.map(user => (
                            <li key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                </div>
                                <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                            </li>
                         ))}
                       </ul>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src="https://picsum.photos/100/100?a" data-ai-hint="person avatar"/>
                                        <AvatarFallback>KA</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>Kofi Adu</CardTitle>
                                        <CardDescription>ID: U-12345 | Joined: Jan 15, 2023</CardDescription>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4"/></Button>
                                    <Button variant="destructive" size="sm">Suspend</Button>
                                    <Button size="sm">Verify KYC</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview">
                                <TabsList>
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                    <TabsTrigger value="loans">Loans</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="pt-4">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Contribution</TableCell>
                                                <TableCell>$250.00</TableCell>
                                                <TableCell>July 1, 2024</TableCell>
                                                <TableCell><Badge className="bg-green-100 text-green-800">Approved</Badge></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Withdrawal</TableCell>
                                                <TableCell>$500.00</TableCell>
                                                <TableCell>May 15, 2024</TableCell>
                                                <TableCell><Badge className="bg-red-100 text-red-800">Rejected</Badge></TableCell>
                                            </TableRow>
                                        </TableBody>
                                     </Table>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Member</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input placeholder="Full Name" />
                                <Input placeholder="Phone Number" />
                                 <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
                                <Button>Add Member</Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Pending Requests</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs defaultValue="withdrawals">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                                        <TabsTrigger value="joins">Join Requests</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="withdrawals" className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Yaw Mensah</p>
                                                    <p className="text-sm text-muted-foreground">$1,000 for emergency</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                             <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Adwoa Boateng</p>
                                                    <p className="text-sm text-muted-foreground">$250 for school fees</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="joins" className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Abena Yeboah</p>
                                                    <p className="text-sm text-muted-foreground">Wants to join Accra Group</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"><Check className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700"><X className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
