

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from 'lucide-react';

export default function InviteMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    const referralLink = "https://susu.bank/auth/register?ref=DERRICK";

    const handleSendInvite = () => {
        if (!email) {
            toast({
                title: "Email Required",
                description: "Please enter an email address to send an invitation.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Invitation Sent!",
                description: `An invite has been sent to ${email}.`,
            });
            setEmail('');
            setIsLoading(false);
        }, 1500);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast({
            title: "Link Copied!",
            description: "Your referral link has been copied to the clipboard.",
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Invite a New Member</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Send an Email Invitation</CardTitle>
                        <CardDescription>
                            Enter the email address of the person you want to invite. We'll send them a link to sign up.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="invite-email">Recipient's Email</Label>
                            <Input 
                                id="invite-email" 
                                type="email" 
                                placeholder="friend@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSendInvite} disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Invite'}
                        </Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Share Your Referral Link</CardTitle>
                        <CardDescription>
                            Alternatively, you can copy your unique referral link and share it directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Input id="referral-link" value={referralLink} readOnly />
                            <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
