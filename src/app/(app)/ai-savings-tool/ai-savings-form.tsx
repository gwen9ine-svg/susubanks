"use client";

import { useState, useTransition } from "react";
import { generateSavingsPlan, GenerateSavingsPlanInput } from "@/ai/flows/ai-savings-tool";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AiSavingsForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input: GenerateSavingsPlanInput = {
      userData: formData.get("userData") as string,
      financialGoals: formData.get("financialGoals") as string,
    };
    
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await generateSavingsPlan(input);
        setResult(response.savingsPlan);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="userData">Past Susu Usage Data</Label>
            <Textarea
              id="userData"
              name="userData"
              placeholder="e.g., Contributed $250/month for 12 months. One withdrawal of $500 in May. No missed payments."
              className="min-h-[150px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="financialGoals">Financial Goals</Label>
            <Textarea
              id="financialGoals"
              name="financialGoals"
              placeholder="e.g., Save $5,000 for a down payment on a car in the next 18 months. Build an emergency fund of $2,000."
              className="min-h-[150px]"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Plan
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-6 bg-green-50/50">
          <CardHeader>
            <CardTitle>Your Personalized Savings Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
