import { Summary } from "../schema/summarySchema";
import { prisma } from "../db/prisma";

export async function createHistoryEntry(
  userId: string,
  topics: string[],
  result: Summary
) {
  return prisma.summaryHistory.create({
    data: {
      userId,
      topics,
      result,
    },
  });
}

export async function getHistory(userId: string, limit = 20) {
  const cappedLimit = Math.max(1, Math.min(50, limit));

  return prisma.summaryHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: cappedLimit,
    select: {
      id: true,
      topics: true,
      result: true,
      createdAt: true,
    },
  });
}
