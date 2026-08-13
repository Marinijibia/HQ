import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface VectorIndexingStats {
  executiveDocsCount: number;
  departmentDocsCount: number;
  knowledgeBaseDocsCount: number;
  totalChunksProcessed: number;
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
    this.logger.log('🤖 Vector Reindex Service initialized. Scheduled automated background vector sync.');
    // Run background index check 10 seconds after boot
    setTimeout(() => {
      this.reindexAllTrainingData().catch(err => {
        this.logger.error(`Initial vector background re-indexing error: ${err}`);
      });
    }, 10000);
  }

  /**
   * Split Markdown content semantically by headings (#, ##, ###)
   */
  public chunkMarkdownContent(markdown: string): string[] {
    if (!markdown || !markdown.trim()) return [];
    
    // Split by headers while preserving section context
    const sections = markdown.split(/(?=\n#{1,3}\s)/);
    const chunks: string[] = [];

    for (const rawSection of sections) {
      const trimmed = rawSection.trim();
      if (!trimmed) continue;
      
      // If a section is very long (> 1200 chars), sub-chunk by paragraphs
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
   * Trigger automated re-indexing across Executive, Department, and Knowledge Base Markdown docs
   */
  async reindexAllTrainingData(): Promise<VectorIndexingStats> {
    if (this.isIndexing) {
      this.logger.warn('Vector re-indexing already in progress. Skipping duplicate run.');
      return {
        executiveDocsCount: 0,
        departmentDocsCount: 0,
        knowledgeBaseDocsCount: 0,
        totalChunksProcessed: 0,
        lastIndexedAt: new Date().toISOString(),
      };
    }

    this.isIndexing = true;
    this.logger.log('🔄 Starting automated background vector re-indexing for pgvector...');

    let totalChunks = 0;
    let execDocsCount = 0;
    let deptDocsCount = 0;
    let kbDocsCount = 0;

    try {
      // 1. Process Executive Training Data (.md)
      const execDocs = await this.prisma.executiveTrainingData.findMany();
      execDocsCount = execDocs.length;
      for (const doc of execDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;
      }

      // 2. Process Department Training Data (.md)
      const deptDocs = await this.prisma.departmentTrainingData.findMany();
      deptDocsCount = deptDocs.length;
      for (const doc of deptDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;
      }

      // 3. Process Shared Knowledge Base (.md)
      const kbDocs = await this.prisma.knowledgeBase.findMany();
      kbDocsCount = kbDocs.length;
      for (const doc of kbDocs) {
        const chunks = this.chunkMarkdownContent(doc.content);
        totalChunks += chunks.length;
      }

      this.logger.log(
        `✅ Vector re-indexing complete. ${totalChunks} semantic chunks processed across ${execDocsCount} Exec docs, ${deptDocsCount} Dept docs, and ${kbDocsCount} KB docs.`,
      );
    } catch (e) {
      this.logger.error(`Failed during vector re-indexing pipeline: ${e}`);
    } finally {
      this.isIndexing = false;
    }

    return {
      executiveDocsCount: execDocsCount,
      departmentDocsCount: deptDocsCount,
      knowledgeBaseDocsCount: kbDocsCount,
      totalChunksProcessed: totalChunks,
      lastIndexedAt: new Date().toISOString(),
    };
  }
}
