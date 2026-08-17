import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MemoryLayer } from '@prisma/client';

export interface RetrievedContext {
  key: string;
  value: string;
  layer: MemoryLayer;
  score: number;
  confidence: number;
  version: number;
  isConflicted: boolean;
  tags: string[];
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  content: string;
  layer: MemoryLayer;
  confidence: number;
  version: number;
  isConflicted: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  executiveId: string | null;
  missionId: string | null;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Helper to parse Hybrid JSON value
  parseValue(rawValue: string): {
    content: string;
    confidence: number;
    version: number;
    isConflicted: boolean;
    tags: string[];
  } {
    try {
      const parsed = JSON.parse(rawValue);
      if (parsed && typeof parsed === 'object' && 'content' in parsed) {
        return {
          content: parsed.content || '',
          confidence:
            typeof parsed.confidence === 'number' ? parsed.confidence : 100,
          version: typeof parsed.version === 'number' ? parsed.version : 1,
          isConflicted: !!parsed.isConflicted,
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        };
      }
    } catch {
      /* ignore and treat as raw string */
    }

    return {
      content: rawValue,
      confidence: 100,
      version: 1,
      isConflicted: false,
      tags: [],
    };
  }

  // Helper to compile Hybrid JSON value
  compileValue(
    content: string,
    meta: {
      confidence?: number;
      version?: number;
      isConflicted?: boolean;
      tags?: string[];
    },
  ): string {
    return JSON.stringify({
      content,
      confidence: meta.confidence ?? 100,
      version: meta.version ?? 1,
      isConflicted: meta.isConflicted ?? false,
      tags: meta.tags ?? [],
    });
  }

  async saveMemory(data: {
    companyId: string;
    layer: MemoryLayer;
    key: string;
    value: string;
    executiveId?: string;
    missionId?: string;
  }) {
    this.logger.log(
      `[Memory Engine] Saving memory node in layer: ${data.layer} (Key: ${data.key})`,
    );

    const compiled = this.compileValue(data.value, {
      confidence: 100,
      version: 1,
    });

    return this.prisma.executiveMemory.create({
      data: {
        companyId: data.companyId,
        layer: data.layer,
        key: data.key,
        value: compiled,
        executiveId: data.executiveId,
        missionId: data.missionId,
      },
    });
  }

  async retrieveContext(
    companyId: string,
    queryText: string,
    options?: {
      executiveId?: string;
      missionId?: string;
      limit?: number;
    },
  ): Promise<RetrievedContext[]> {
    this.logger.log(
      `[Memory Engine] Querying prioritized RAG context for organization: ${companyId}`,
    );

    const maxLimit = options?.limit || 5;

    const memories = await this.prisma.executiveMemory.findMany({
      where: {
        companyId,
        OR: [
          options?.executiveId ? { executiveId: options.executiveId } : {},
          options?.missionId ? { missionId: options.missionId } : {},
          { layer: MemoryLayer.ORGANIZATION },
          { layer: MemoryLayer.KNOWLEDGE_LIBRARY },
          { layer: MemoryLayer.USER },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const scored = memories.map((m) => {
      const parsed = this.parseValue(m.value);
      let score = 0.5;
      const lowerQuery = queryText.toLowerCase();
      const lowerKey = m.key.toLowerCase();
      const lowerVal = parsed.content.toLowerCase();

      if (lowerKey.includes(lowerQuery) || lowerVal.includes(lowerQuery)) {
        score = 0.9;
      } else {
        const words = lowerQuery.split(/\s+/).filter((w) => w.length > 3);
        let matches = 0;
        words.forEach((w) => {
          if (lowerKey.includes(w) || lowerVal.includes(w)) {
            matches++;
          }
        });
        if (words.length > 0) {
          score = 0.5 + (matches / words.length) * 0.4;
        }
      }

      // Prioritize high-confidence memories by multiplying the score factor
      const confidenceFactor = parsed.confidence / 100;
      const finalScore = score * (0.8 + confidenceFactor * 0.2);

      return {
        key: m.key,
        value: parsed.content,
        layer: m.layer,
        score: finalScore,
        confidence: parsed.confidence,
        version: parsed.version,
        isConflicted: parsed.isConflicted,
        tags: parsed.tags,
      };
    });

    const layerPriority: Record<MemoryLayer, number> = {
      WORKING: 6,
      MISSION: 5,
      EXECUTIVE: 4,
      ORGANIZATION: 3,
      KNOWLEDGE_LIBRARY: 2,
      USER: 1,
    };

    return scored
      .sort((a, b) => {
        if (Math.abs(a.score - b.score) > 0.1) {
          return b.score - a.score;
        }
        return (layerPriority[b.layer] || 0) - (layerPriority[a.layer] || 0);
      })
      .slice(0, maxLimit);
  }

  async listMemories(companyId: string): Promise<MemoryItem[]> {
    const list = await this.prisma.executiveMemory.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((m) => {
      const parsed = this.parseValue(m.value);
      return {
        id: m.id,
        key: m.key,
        value: m.value,
        content: parsed.content,
        layer: m.layer,
        confidence: parsed.confidence,
        version: parsed.version,
        isConflicted: parsed.isConflicted,
        tags: parsed.tags,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        executiveId: m.executiveId,
        missionId: m.missionId,
      };
    });
  }

  async updateMemory(
    id: string,
    companyId: string,
    data: {
      key: string;
      content: string;
      confidence?: number;
      version?: number;
      isConflicted?: boolean;
      tags?: string[];
    },
  ): Promise<void> {
    const existing = await this.prisma.executiveMemory.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException('Memory not found in your organization');

    const parsed = this.parseValue(existing.value);
    const newVersion = (data.version ?? parsed.version) + 1;

    const compiled = this.compileValue(data.content, {
      confidence: data.confidence ?? parsed.confidence,
      version: newVersion,
      isConflicted: data.isConflicted ?? parsed.isConflicted,
      tags: data.tags ?? parsed.tags,
    });

    await this.prisma.executiveMemory.update({
      where: { id },
      data: {
        key: data.key,
        value: compiled,
      },
    });
  }

  async deleteMemory(id: string, companyId: string): Promise<void> {
    const existing = await this.prisma.executiveMemory.findFirst({
      where: { id, companyId },
    });
    if (!existing) throw new NotFoundException('Memory not found in your organization');

    await this.prisma.executiveMemory.delete({
      where: { id },
    });
  }

  async promoteMemory(
    workingMemoryId: string,
    companyId: string,
    targetLayer: MemoryLayer,
  ): Promise<void> {
    this.logger.log(
      `[Memory Engine] Promoting working memory ${workingMemoryId} to long-term: ${targetLayer}`,
    );

    const memory = await this.prisma.executiveMemory.findFirst({
      where: { id: workingMemoryId, companyId },
    });

    if (!memory) {
      throw new NotFoundException('Working memory context not found in your organization');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.executiveMemory.update({
        where: { id: workingMemoryId },
        data: { layer: targetLayer },
      });

      await tx.auditLog.create({
        data: {
          companyId: memory.companyId,
          eventType: 'memory.promoted',
          metadata: {
            memoryId: workingMemoryId,
            previousLayer: MemoryLayer.WORKING,
            newLayer: targetLayer,
          },
        },
      });
    });
  }

  async runReviewCycle(companyId: string) {
    this.logger.log(
      `[Memory Engine] Running scheduled Memory Review Cycle for: ${companyId}`,
    );

    const memories = await this.prisma.executiveMemory.findMany({
      where: { companyId },
    });

    const parsedItems = memories.map((m) => ({
      dbItem: m,
      parsed: this.parseValue(m.value),
    }));

    let duplicatesRemoved = 0;
    let conflictsFlagged = 0;
    let decayedItems = 0;

    const seen = new Map<string, (typeof parsedItems)[0]>();
    const toDeleteIds: string[] = [];
    const toUpdate: { id: string; key: string; value: string }[] = [];

    // Heuristics: 30 days is our stale memory window threshold
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const item of parsedItems) {
      const uniqueKey = `${item.dbItem.layer}_${item.dbItem.key.toLowerCase()}`;

      // 1. Deduplication Check
      if (seen.has(uniqueKey)) {
        const prev = seen.get(uniqueKey)!;
        if (
          prev.parsed.content.toLowerCase() ===
          item.parsed.content.toLowerCase()
        ) {
          // Exact duplicate key & value in the same layer -> keep the newest, delete this older one
          toDeleteIds.push(item.dbItem.id);
          duplicatesRemoved++;
          continue;
        } else {
          // Conflict: same key & layer but different content value -> flag BOTH as conflicted
          item.parsed.isConflicted = true;
          prev.parsed.isConflicted = true;
          conflictsFlagged++;
        }
      } else {
        seen.set(uniqueKey, item);
      }

      // 2. Memory Decay (Aged memories drop confidence score)
      if (
        item.dbItem.createdAt < thirtyDaysAgo &&
        item.parsed.confidence > 40
      ) {
        item.parsed.confidence = Math.max(30, item.parsed.confidence - 10);
        decayedItems++;
      }

      // Compile and prepare for updates
      const recompiled = this.compileValue(item.parsed.content, {
        confidence: item.parsed.confidence,
        version: item.parsed.version,
        isConflicted: item.parsed.isConflicted,
        tags: item.parsed.tags,
      });

      if (recompiled !== item.dbItem.value) {
        toUpdate.push({
          id: item.dbItem.id,
          key: item.dbItem.key,
          value: recompiled,
        });
      }
    }

    // Execute bulk DB updates
    await this.prisma.$transaction([
      ...toDeleteIds.map((id) =>
        this.prisma.executiveMemory.delete({ where: { id } }),
      ),
      ...toUpdate.map((up) =>
        this.prisma.executiveMemory.update({
          where: { id: up.id },
          data: { value: up.value },
        }),
      ),
    ]);

    this.logger.log(
      `[Memory Review Cycle Finished] Duplicates Merged: ${duplicatesRemoved}, Conflicts Flagged: ${conflictsFlagged}, Decayed: ${decayedItems}`,
    );

    return {
      duplicatesRemoved,
      conflictsFlagged,
      decayedItems,
      currentMemorySize: memories.length - duplicatesRemoved,
    };
  }
}
