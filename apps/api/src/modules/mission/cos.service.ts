import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface DagTask {
  id: string;
  title: string;
  assignedDirector: string;
  dependencies: string[];
  status: 'Pending' | 'Running' | 'Completed' | 'Error';
  description: string;
}

export interface MissionWbsDag {
  tasks: DagTask[];
}

@Injectable()
export class CosService {
  private readonly logger = new Logger(CosService.name);

  private readonly cosSystemPrompt = `
    You are the Chief of Staff (COS) of HQ Corporation.
    Your objective is to decompose high-level corporate missions into a Work Breakdown Structure (WBS) represented as a Directed Acyclic Graph (DAG) of task nodes.
    Each task must have unique IDs, title, assigned specialized Director, dependencies, status, and description.
    Ensure that tasks without dependencies can execute in parallel, and that dependencies form a valid DAG (no circular loops).
  `;

  constructor(private readonly aiService: AiService) {}

  async generateTaskDAG(objective: string): Promise<MissionWbsDag> {
    this.logger.log(
      `[COS Agent] Generating Task WBS DAG for objective: "${objective}"`,
    );

    const prompt = `
      Create a WBS DAG for this corporate mission: "${objective}".
      Provide the result in JSON format matching this schema:
      {
        "tasks": [
          {
            "id": "task-1",
            "title": "Task title",
            "assignedDirector": "Strategy Director",
            "dependencies": [],
            "status": "Pending",
            "description": "Task details description"
          },
          {
            "id": "task-2",
            "title": "Subtask title",
            "assignedDirector": "Copywriting Director",
            "dependencies": ["task-1"],
            "status": "Pending",
            "description": "Subtask description details"
          }
        ]
      }
    `;

    try {
      const response = await this.aiService.executePrompt({
        prompt,
        systemPrompt: this.cosSystemPrompt,
        provider: 'gemini',
        temperature: 0.2,
      });

      let cleanedText = response.text.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
      }
      const parsed: MissionWbsDag = JSON.parse(cleanedText.trim());
      this.logger.log(
        `[COS Agent] Task DAG generated with ${parsed.tasks.length} tasks.`,
      );
      return parsed;
    } catch (error) {
      this.logger.warn(
        `[COS Agent] Failed to parse COS LLM JSON response. Falling back to default WBS heuristics...`,
      );
      return this.getFallbackDag(objective);
    }
  }

  private getFallbackDag(objective: string): MissionWbsDag {
    return {
      tasks: [
        {
          id: 'task-1',
          title: 'Objective Research & Benchmarking',
          assignedDirector: 'Alistair Thorne (Strategy Director)',
          dependencies: [],
          status: 'Completed',
          description: `Gather marketing research data related to: "${objective}".`,
        },
        {
          id: 'task-2',
          title: 'Deliverable Strategy Design',
          assignedDirector: 'Elena Rostova (CEO)',
          dependencies: ['task-1'],
          status: 'Completed',
          description: 'Establish alignment templates and parameters rules.',
        },
        {
          id: 'task-3',
          title: 'Copywriting Proposals drafting',
          assignedDirector: 'Linus Kovacs (Software Eng. Director)',
          dependencies: ['task-2'],
          status: 'Running',
          description: 'Compose campaign content and social posts drafts.',
        },
        {
          id: 'task-4',
          title: 'Compliance & Legal hold Auditing',
          assignedDirector: 'Fiona Gallagher (Legal Director)',
          dependencies: ['task-3'],
          status: 'Pending',
          description:
            'Verify copy does not violate local and regulatory bounds.',
        },
        {
          id: 'task-5',
          title: 'Final CEO Approvals Sign-off',
          assignedDirector: 'Elena Rostova (CEO)',
          dependencies: ['task-4'],
          status: 'Pending',
          description: 'CEO final review and deployment signature.',
        },
      ],
    };
  }
}
