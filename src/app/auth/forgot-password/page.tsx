
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SusuLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { getCollection, updateDocument } from '@/services/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Member = {
  id: string;
  name: string;
  email: string;
  dob?: string; // Date of Birth
  idNumber?: string; // Government ID number
  group?: string; // Susu group
  password?: string;
};

const securityQuestions = [
    { key: 'dob', label: 'What is your date of birth?' },
    { key: 'idNumber', label: 'What is your ID card number?' },
    { key: 'group', label: 'Which group do you belong to?' },
];

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<Member | null>(null);
    const [answers, setAnswers] = useState({ dob: '', idNumber: '', group: '' });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();
    const { toast } = useToast();

    const handleEmailSubmit = async () => {
        setIsLoading(true);
        if (!email) {
            toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
            setIsLoading(false);
            return;
        }
        try {
            const members = await getCollection('members') as Member[];
            const foundUser = members.find(member => member.email.toLowerCase() === email.toLowerCase());

            if (foundUser) {
                setUser(foundUser);
                setStep(2);
            } else {
                toast({ title: 'User not found', description: 'No account found with that email address.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Could not verify email. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswersSubmit = () => {
        setIsLoading(true);
        if (!user) {
            setIsLoading(false);
            return;
        }

        // In a real app, this data would be hashed or encrypted and compared securely.
        // For this demo, we do a simple string comparison.
        const isDobCorrect = !answers.dob || (user.dob && new Date(answers.dob).getTime() === new Date(user.dob).getTime());
        const isIdCorrect = !answers.idNumber || (user.idNumber && user.idNumber.toLowerCase() === answers.idNumber.toLowerCase());
        const isGroupCorrect = !answers.group || (user.group && user.group === answers.group);

        if (isDobCorrect && isIdCorrect && isGroupCorrect) {
            setStep(3);
        } else {
            toast({ title: 'Verification Failed', description: 'One or more answers are incorrect. Please try again.', variant: 'destructive' });
        }
        setIsLoading(false);
    };
    
    const handlePasswordReset = async () => {
        if (newPassword.length < 6) {
            toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: 'Passwords do not match', description: 'Please ensure your passwords match.', variant: 'destructive' });
            return;
        }
        if (!user) return;

        setIsLoading(true);
        try {
            await updateDocument('members', user.id, { password: newPassword });
            toast({ title: 'Password Reset Successful', description: 'You can now log in with your new password.' });
            router.push('/auth/login');
        } catch (error) {
            toast({ title: 'Error', description: 'Could not reset password. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">Enter your email address and we'll help you reset your password.</p>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </CardContent>
                );
            case 2:
                return (
                     <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">Please answer the following security questions to verify your identity.</p>
                        <div className="space-y-2">
                            <Label htmlFor="dob">What is your date of birth?</Label>
                            <Input id="dob" type="date" value={answers.dob} onChange={e => setAnswers({...answers, dob: e.target.value})} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="idNumber">What is your ID card number?</Label>
                            <Input id="idNumber" type="text" placeholder="GHA-123..." value={answers.idNumber} onChange={e => setAnswers({...answers, idNumber: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group">Which group do you belong to?</Label>
                            <Select onValueChange={value => setAnswers({...answers, group: value})} value={answers.group}>
                                <SelectTrigger id="group"><SelectValue placeholder="Select a group" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="group1">Group 1</SelectItem>
                                    <SelectItem value="group2">Group 2</SelectItem>
                                    <SelectItem value="group3">Group 3</SelectItem>
                                    <SelectItem value="group4">Group 4</SelectItem>
                                    <SelectItem value="group5">Group 5</SelectItem>
                                    <SelectItem value="group6">Group 6</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                );
            case 3:
                return (
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">Create a new, strong password.</p>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                        </div>
                    </CardContent>
                );
            default:
                return null;
        }
    };

    const renderFooter = () => {
         switch (step) {
            case 1:
                return (
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handleEmailSubmit} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Continue'}
                        </Button>
                        <Button variant="link" className="text-sm" asChild><Link href="/auth/login">Back to Login</Link></Button>
                    </CardFooter>
                );
            case 2:
                return (
                     <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handleAnswersSubmit} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify Answers'}
                        </Button>
                        <Button variant="link" className="text-sm" onClick={() => setStep(1)}>Back</Button>
                    </CardFooter>
                );
            case 3:
                 return (
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handlePasswordReset} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Reset Password'}
                        </Button>
                         <Button variant="link" className="text-sm" onClick={() => setStep(2)}>Back</Button>
                    </CardFooter>
                );
            default: return null;
        }
    }


    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    <SusuLogo isBank={true} />
                </div>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>Step {step} of 3</CardDescription>
            </CardHeader>
            {renderStepContent()}
            {renderFooter()}
        </Card>
    );
}
