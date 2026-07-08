import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MemoryLayer } from '@prisma/client';

export interface RetrievedContext {
  key: string;
  value: string;
  layer: MemoryLayer;
  score: number;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.executiveMemory.create({
      data: {
        companyId: data.companyId,
        layer: data.layer,
        key: data.key,
        value: data.value,
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

    // Fetch local memories from database for dynamic semantic checks
    const memories = await this.prisma.executiveMemory.findMany({
      where: {
        companyId,
        OR: [
          // Filter by executive scope if provided
          options?.executiveId ? { executiveId: options.executiveId } : {},
          // Filter by mission scope if provided
          options?.missionId ? { missionId: options.missionId } : {},
          // Layer boundaries: non-scoped layers like ORG and KNOWLEDGE are always queryable
          { layer: MemoryLayer.ORGANIZATION },
          { layer: MemoryLayer.KNOWLEDGE_LIBRARY },
          { layer: MemoryLayer.USER },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Score heuristics matching queries keywords content
    const scored: RetrievedContext[] = memories.map((m) => {
      let score = 0.5;
      const lowerQuery = queryText.toLowerCase();
      const lowerKey = m.key.toLowerCase();
      const lowerVal = m.value.toLowerCase();

      // Check text overlaps
      if (lowerKey.includes(lowerQuery) || lowerVal.includes(lowerQuery)) {
        score = 0.9;
      } else {
        // Count keyword matches
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

      return {
        key: m.key,
        value: m.value,
        layer: m.layer,
        score,
      };
    });

    // Priority order layout mapping: WORKING -> MISSION -> EXECUTIVE -> ORGANIZATION -> KNOWLEDGE_LIBRARY -> USER
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
        // Prioritize by semantic score first
        if (Math.abs(a.score - b.score) > 0.1) {
          return b.score - a.score;
        }
        // Then prioritize by hierarchical layers order
        return (layerPriority[b.layer] || 0) - (layerPriority[a.layer] || 0);
      })
      .slice(0, maxLimit);
  }

  async promoteMemory(
    workingMemoryId: string,
    targetLayer: MemoryLayer,
  ): Promise<void> {
    this.logger.log(
      `[Memory Engine] Promoting working memory ${workingMemoryId} to long-term: ${targetLayer}`,
    );

    const memory = await this.prisma.executiveMemory.findUnique({
      where: { id: workingMemoryId },
    });

    if (!memory) {
      throw new Error('Working memory context not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update memory layer
      await tx.executiveMemory.update({
        where: { id: workingMemoryId },
        data: { layer: targetLayer },
      });

      // Write audit log trail
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
}
