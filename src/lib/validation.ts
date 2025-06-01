
import { z } from "zod";

// Project validation schema
export const projectSchema = z.object({
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  finalPrice: z.number().min(0, "Price must be positive").max(999999999, "Price too large"),
  vatRate: z.number().min(0).max(100),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  currency: z.enum(["GBP", "USD", "EUR"]),
  clientName: z.string().max(100, "Name too long").optional(),
  clientEmail: z.string().email("Invalid email").max(100, "Email too long").optional(),
  clientPhone: z.string().max(20, "Phone too long").optional(),
  clientAddress: z.string().max(300, "Address too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional()
});

// Payment validation schema
export const paymentSchema = z.object({
  stage: z.string().min(1, "Stage is required").max(100, "Stage name too long"),
  date: z.date(),
  invoice: z.number().min(0, "Invoice amount must be positive").max(999999999, "Amount too large"),
  transfer: z.number().min(0, "Transfer amount must be positive").max(999999999, "Amount too large"),
  cash: z.number().min(0, "Cash amount must be positive").max(999999999, "Amount too large"),
  vat: z.number().min(0, "VAT must be positive").max(999999999, "VAT too large")
});

// Client validation schema
export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email").max(100, "Email too long").optional(),
  phone: z.string().max(20, "Phone too long").optional(),
  address: z.string().max(300, "Address too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional()
});

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Financial calculation validation
export const validateCalculation = (base: number, rate: number, result: number): boolean => {
  const expectedResult = base * (1 + rate / 100);
  return Math.abs(expectedResult - result) < 0.01; // Allow for rounding differences
};
