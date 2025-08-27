'use server';

/**
 * @fileOverview Provides personalized saving plans based on user data and financial goals.
 *
 * - generateSavingsPlan - Generates a personalized savings plan for a user.
 * - GenerateSavingsPlanInput - The input type for the generateSavingsPlan function.
 * - GenerateSavingsPlanOutput - The return type for the generateSavingsPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSavingsPlanInputSchema = z.object({
  userData: z
    .string()
    .describe('Past Susu usage data, including contributions, withdrawals, and transaction history.'),
  financialGoals: z.string().describe('The user\u2019s financial goals and savings targets.'),
});
export type GenerateSavingsPlanInput = z.infer<typeof GenerateSavingsPlanInputSchema>;

const GenerateSavingsPlanOutputSchema = z.object({
  savingsPlan: z
    .string()
    .describe('A personalized savings plan outlining steps to achieve the user\u2019s financial goals.'),
});
export type GenerateSavingsPlanOutput = z.infer<typeof GenerateSavingsPlanOutputSchema>;

export async function generateSavingsPlan(input: GenerateSavingsPlanInput): Promise<GenerateSavingsPlanOutput> {
  return generateSavingsPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSavingsPlanPrompt',
  input: {schema: GenerateSavingsPlanInputSchema},
  output: {schema: GenerateSavingsPlanOutputSchema},
  prompt: `You are an expert financial advisor specializing in creating personalized saving plans.

  Based on the user's past Susu usage data and financial goals, generate a savings plan that outlines steps to achieve their savings targets.

  Past Susu Usage Data: {{{userData}}}
  Financial Goals: {{{financialGoals}}}
  `,
});

const generateSavingsPlanFlow = ai.defineFlow(
  {
    name: 'generateSavingsPlanFlow',
    inputSchema: GenerateSavingsPlanInputSchema,
    outputSchema: GenerateSavingsPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
