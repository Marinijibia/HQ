export interface ExecutiveScope {
  id: string;
  name: string;
  title: string;
  department: string;
  authorizedTools: string[];
  promptId: string;
  promptVersion: string;
}

export const ExecutivesRegistry: Record<string, ExecutiveScope> = {
  CEO: {
    id: 'ceo-rostova',
    name: 'Elena Rostova',
    title: 'Chief Executive Officer (CEO)',
    department: 'Executive Management',
    authorizedTools: ['strategy-analysis', 'audit-logs', 'approve-deliverables'],
    promptId: 'prompt-ceo-01',
    promptVersion: '1.2.0',
  },
  COS: {
    id: 'cos-steward',
    name: 'Arthur Steward',
    title: 'Chief of Staff (COS)',
    department: 'Operations',
    authorizedTools: ['generate-dag', 'assign-tasks', 'monitor-queues'],
    promptId: 'prompt-cos-01',
    promptVersion: '1.1.0',
  },
  QA: {
    id: 'qa-turing',
    name: 'Alan Turing',
    title: 'Quality Assurance Director (QA)',
    department: 'Quality Assurance',
    authorizedTools: ['run-validation', 'evaluate-deliverable'],
    promptId: 'prompt-qa-01',
    promptVersion: '1.0.0',
  },
  COPYWRITER: {
    id: 'copy-thorne',
    name: 'Alistair Thorne',
    title: 'Chief Copywriting Director',
    department: 'Marketing & Content',
    authorizedTools: ['generate-copy', 'optimize-seo'],
    promptId: 'prompt-copy-01',
    promptVersion: '1.3.0',
  },
  DESIGNER: {
    id: 'design-kovacs',
    name: 'Linus Kovacs',
    title: 'Creative & Design Director',
    department: 'Product & Design',
    authorizedTools: ['generate-image', 'apply-theme'],
    promptId: 'prompt-design-01',
    promptVersion: '1.0.0',
  },
};

export function hasToolPermission(executiveTitle: string, toolName: string): boolean {
  // Least privilege tool boundaries check
  const entries = Object.values(ExecutivesRegistry);
  const found = entries.find(
    (e) =>
      e.title.toLowerCase().includes(executiveTitle.toLowerCase()) ||
      e.id.toLowerCase().includes(executiveTitle.toLowerCase()),
  );
  if (!found) {
    return false;
  }
  return found.authorizedTools.includes(toolName);
}
