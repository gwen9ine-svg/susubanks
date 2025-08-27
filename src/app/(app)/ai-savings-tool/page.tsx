import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiSavingsForm } from "./ai-savings-form";

export default function AiSavingsToolPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">AI Savings Tool</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personalized Savings Plan Generator</CardTitle>
          <CardDescription>
            Let our AI help you create a personalized savings plan to reach your financial goals faster.
            Provide your financial data and goals below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiSavingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
