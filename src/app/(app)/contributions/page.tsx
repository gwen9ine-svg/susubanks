import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  { title: "Total Contributions", value: "$8,750.00" },
  { title: "My Contributions", value: "$2,500.00" },
  { title: "Next Due", value: "July 25, 2024" },
];

const history = [
    { ref: "CONT-07-2024-A1", amount: "$250.00", status: "Completed", date: "July 1, 2024" },
    { ref: "CONT-06-2024-A1", amount: "$250.00", status: "Completed", date: "June 1, 2024" },
    { ref: "CONT-05-2024-A1", amount: "$250.00", status: "Processing", date: "May 1, 2024" },
    { ref: "CONT-04-2024-A1", amount: "$250.00", status: "Completed", date: "April 1, 2024" },
];

const allContributions = [
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "$250.00", date: "July 1, 2024" },
    { desc: "Contribution", member: "Ama Serwaa", type: "Contribution", amount: "$250.00", date: "July 1, 2024" },
    { desc: "Contribution", member: "Kofi Adu", type: "Contribution", amount: "$250.00", date: "June 1, 2024" },
    { desc: "Contribution", member: "Yaw Mensah", type: "Contribution", amount: "$250.00", date: "June 1, 2024" },
];

export default function ContributionsPage() {
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
