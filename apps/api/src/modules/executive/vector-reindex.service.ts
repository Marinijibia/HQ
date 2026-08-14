import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface VectorIndexingStats {
  executiveDocsCount: number;
  departmentDocsCount: number;
  knowledgeBaseDocsCount: number;
  totalChunksProcessed: number;
  embeddingsWritten: number;
  embeddingsSkipped: number;
  lastIndexedAt: string;
}

@Injectable()
export class VectorReindexService implements OnModuleInit {
  private readonly logger = new Logger(VectorReindexService.name);
  private isIndexing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  onModuleInit() {
    this.logger.log('🤖 Vector Reindex Service initialized. Scheduling background vector sync.');
    // Run background reindex 10s after boot — non-blocking
    setTimeout(() => {
      this.reindexAllTrainingData().catch((err) => {
        this.logger.error(`Initial vector background reindex error: ${err}`);
      });
    }, 10000);
  }

  /**
   * Split Markdown content semantically by headings (#, ##, ###)
   */
  public chunkMarkdownContent(markdown: string): string[] {
    if (!markdown || !markdown.trim()) return [];

    const sections = markdown.split(/(?=\n#{1,3}\s)/);
    const chunks: string[] = [];

    for (const rawSection of sections) {
      const trimmed = rawSection.trim();
      if (!trimmed) continue;

      if (trimmed.length > 1200) {
        const paragraphs = trimmed.split(/\n\n+/);
        let currentChunk = '';
        for (const p of paragraphs) {
          if ((currentChunk + '\n\n' + p).length > 1000) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = p;
          } else {
            currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
      } else {
        chunks.push(trimmed);
      }
    }

    return chunks.length > 0 ? chunks : [markdown];
  }

  /**
   * Generate an embedding for a single text chunk and write it to pgvector.
   * Uses a raw SQL upsert since Prisma doesn't support vector type natively.
   * Returns true if the embedding was written, false if it was skipped.
   */
  private async embedAndStore(
    tableName: string,
    columnName: string,
    recordId: string,
    chunkText: string,
  ): Promise<boolean> {
    const embedding = await this.aiService.embedText(chunkText);

    if (!embedding) {
      return false; // API unavailable or quota — skip silently
    }

    // Build the vector literal for pgvector: '[0.1,0.2,...]'
    const vectorLiteral = `[${embedding.join(',')}]`;

    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE "${tableName}" SET "${columnName}" = $1::vector WHERE id = $2::uuid`,
        vectorLiteral,
        recordId,
      );
      return true;
    } catch (err) {
      this.logger.warn(`[VectorReindex] Failed to write embedding for ${tableName}:${recordId}: ${err}`);
      return false;
    }
  }

  /**
   * Re-index training data across Executive, Department, and Knowledge Base docs.
   * Generates real embeddings via Gemini text-embedding-004 and writes them to pgvector.
   *
   * Pass companyId to scope to a single org (called from CMS endpoints).
   * Omit for a full global reindex (called only on module init).
   */
  async reindexAllTrainingData(companyId?: string): Promise<VectorIndexingStats> {
    if (this.isIndexing) {
      this.logger.warn('Vector reindexing already in progress. Skipping duplicate run.');
      return {
        executiveDocsCount: 0,
        departmentDocsCount: 0,
        knowledgeBaseDocsCount: 0,
        totalChunksProcessed: 0,
        embeddingsWritten: 0,
        embeddingsSkipped: 0,
        lastIndexedAt: new Date().toISOString(),
      };
    }

    this.isIndexing = true;
    this.logger.log('🔄 Starting vector reindexing — generating and writing real embeddings to pgvector...');

    let totalChunks = 0;
    let embeddingsWritten = 0;
    let embeddingsSkipped = 0;
    let execDocsCount = 0;
    let deptDocsCount = 0;
    let kbDocsCount = 0;

    try {
      // 1. Executive Training Data — org-scoped
      const execDocs = await (companyId
        ? this.prisma.executiveTrainingData.findMany({
            where: { executive: { department: { companyId } } },
          })
        : this.prisma.executiveTrainingData.findMany());

      execDocsCount = execDocs.length;
      this.logger.log(`[VectorReindex] Processing ${execDocsCount} executive training docs...`);

      for (const doc of execDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;

        // Embed the full doc content (first 8192 chars) and write to the record
        const written = await this.embedAndStore(
          'executive_training_data',
          'embedding',
          doc.id,
          chunks[0] || doc.content, // Use first semantic chunk for the record embedding
        );
        if (written) embeddingsWritten++;
        else embeddingsSkipped++;
      }

      // 2. Department Training Data — org-scoped
      const deptDocs = await (companyId
        ? this.prisma.departmentTrainingData.findMany({
            where: { department: { companyId } },
          })
        : this.prisma.departmentTrainingData.findMany());

      deptDocsCount = deptDocs.length;
      this.logger.log(`[VectorReindex] Processing ${deptDocsCount} department training docs...`);

      for (const doc of deptDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;

        const written = await this.embedAndStore(
          'department_training_data',
          'embedding',
          doc.id,
          chunks[0] || doc.content,
        );
        if (written) embeddingsWritten++;
        else embeddingsSkipped++;
      }

      // 3. Shared Knowledge Base — org-scoped where possible
      const kbDocs = await (companyId
        ? this.prisma.knowledgeBase.findMany({ where: { companyId } })
        : this.prisma.knowledgeBase.findMany());

      kbDocsCount = kbDocs.length;
      this.logger.log(`[VectorReindex] Processing ${kbDocsCount} knowledge base docs...`);

      for (const doc of kbDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;

        const written = await this.embedAndStore(
          'knowledge_base',
          'embedding',
          doc.id,
          chunks[0] || doc.content,
        );
        if (written) embeddingsWritten++;
        else embeddingsSkipped++;
      }

      this.logger.log(
        `✅ Vector reindexing complete. ${totalChunks} chunks across ${execDocsCount + deptDocsCount + kbDocsCount} docs. Written: ${embeddingsWritten}, Skipped: ${embeddingsSkipped}.`,
      );
    } catch (e) {
      this.logger.error(`[VectorReindex] Pipeline error: ${e}`);
    } finally {
      this.isIndexing = false;
    }

    return {
      executiveDocsCount: execDocsCount,
      departmentDocsCount: deptDocsCount,
      knowledgeBaseDocsCount: kbDocsCount,
      totalChunksProcessed: totalChunks,
      embeddingsWritten,
      embeddingsSkipped,
      lastIndexedAt: new Date().toISOString(),
    };
  }
}
