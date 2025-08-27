import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, PlusCircle, Phone, Mail, History } from "lucide-react";

const metricCards = [
  { title: "Total Saved", value: "GH₵2,500.00" },
  { title: "Loans Outstanding", value: "GH₵0.00" },
  { title: "Last Contribution", value: "July 1, 2024" },
  { title: "Missed Payments", value: "0" },
];

const recentActivity = [
    { action: "Contribution added", details: "GH₵250.00 for Cycle 10", time: "2 days ago" },
    { action: "Withdrawal approved", details: "GH₵500.00 for personal use", time: "1 month ago" },
    { action: "Profile updated", details: "Changed phone number", time: "3 months ago" },
];

export default function MemberOverviewPage({ params: { id } }: { params: { id: string }, searchParams: {} }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://picsum.photos/100/100?a=${id}`} data-ai-hint="person avatar" />
                <AvatarFallback>KA</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Kofi Adu</CardTitle>
                <CardDescription>Role: Admin</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Charge
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>+233 24 123 4567</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>k.adu@example.com</span>
              </div>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recentActivity.map((activity, i) => (
                        <li key={i} className="flex items-start gap-3">
                             <div className="mt-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
                             <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.details}</p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                             </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {metricCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="min-h-[300px]">
             <CardHeader>
                <CardTitle>Contribution History</CardTitle>
                <CardDescription>Mini Chart</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center text-muted-foreground h-full">
                <p>Chart data will be displayed here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
