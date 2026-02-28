import { z } from "zod";

export const DetectTopicsRequestSchema = z.object({
  pageText: z.string().min(50)
});

export const DetectTopicsResponseSchema = z.object({
  topics: z.array(z.string()).min(1).max(6)
});

export type DetectTopicsRequest = z.infer<typeof DetectTopicsRequestSchema>;
