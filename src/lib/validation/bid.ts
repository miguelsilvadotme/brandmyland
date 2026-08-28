import { z } from "zod";

export const bidFormSchema = z.object({
  placementId: z.string().min(1),
  amountCents: z.number().int().positive(),
  fullName: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().email().max(200),
  companyName: z.string().trim().min(2).max(120),
  companyWebsite: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//i.test(v), "Enter a full URL including https://"),
  twitterHandle: z.string().trim().max(80).optional().or(z.literal("")),
  publicMessage: z.string().trim().max(280).optional().or(z.literal("")),
  hidePublicName: z.boolean().optional(),
  acceptTerms: z.literal(true, { error: "You must accept the auction terms." }),
  acceptRegulatory: z.literal(true, {
    error: "Regulatory acknowledgement is required.",
  }),
});

export type BidFormValues = z.infer<typeof bidFormSchema>;
