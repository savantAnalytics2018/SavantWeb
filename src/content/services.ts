import type { Service, ServiceId } from './types';

/**
 * Five connected service areas. `role` drives the homepage layout
 * (one lead panel, two pathways, a compact support row).
 */
export const services: Service[] = [
  {
    id: 'ai-strategy',
    role: 'lead',
    shortTitle: 'AI strategy',
    title: 'AI strategy and opportunity prioritization',
    problem: 'Decide where AI deserves investment, and what must be true first.',
    work: 'Link business objectives to candidate use cases, assess readiness, compare opportunities, and sequence the work.',
    detail: [
      'Most organizations have AI ideas. Few have a defensible way to choose among them. We start from objectives leadership already cares about and work back to the use cases, the data and systems each depends on, and the changes each would require.',
      'The result is a ranked portfolio with explicit assumptions, so the next investment decision can be made and revisited on the same terms. Sometimes the right call is to fix a process or data instead of adding AI. We say so.',
    ],
    audience: 'Technology and transformation leaders, sponsors, and platform teams who must justify or sequence AI investment.',
    deliverables: [
      'Opportunity map',
      'Readiness assessment',
      'Prioritized use-case portfolio',
      'Investment assumptions',
      'Evaluation criteria',
      'Actionable roadmap',
    ],
    considerations: [
      'Scope follows the number of business units and systems in play.',
      'Access to decision-makers and process owners sets how specific the roadmap can be.',
      'Can stand alone or lead into modernization, evaluation, or deployment work.',
    ],
    guardrails: ['No predetermined return on investment.', 'No assumption that every problem needs AI.'],
    example: {
      title: 'Illustrative example — choosing among competing AI proposals',
      situation: 'A hypothetical enterprise has a dozen AI proposals, limited platform capacity, and no shared way to compare them.',
      possibleWork: 'Interview sponsors, map proposals to objectives and dependencies, assess readiness, score against agreed criteria.',
      outcome: 'A ranked portfolio, two candidates for scoped pilots, and the readiness gaps to close first.',
    },
    cardAction: 'Explore AI strategy',
    metaDescription: 'AI strategy and opportunity prioritization: opportunity maps, readiness assessments, prioritized portfolios, and actionable roadmaps.',
  },
  {
    id: 'legacy-modernization',
    role: 'pathway',
    shortTitle: 'Legacy modernization',
    title: 'AI-assisted legacy code modernization',
    problem: 'Critical systems have become hard to understand, change, and staff.',
    work: 'Map code and dependencies, identify options, and apply AI-assisted analysis and engineering under human review and tests.',
    detail: [
      'Modernization starts by making the system legible: what it does, what depends on it, where risk concentrates. AI-assisted tooling speeds up comprehension, dependency mapping, test generation, and translation. Engineers review every change against a test strategy agreed up front.',
      'The goal is a sequence of changes the organization can absorb, not one risky cutover.',
    ],
    audience: 'Engineering leaders, application owners, and platform teams responsible for systems that are expensive to change.',
    deliverables: ['System and dependency map', 'Prioritized modernization backlog', 'Test strategy', 'Scoped migration plan', 'Implementation pilot with findings'],
    considerations: [
      'Feasibility depends on code access, existing tests, and people who know the system.',
      'Regulated systems get review checkpoints before any change is proposed.',
      'Pilots are sized to produce evidence fast; wider migration is planned from that evidence.',
    ],
    guardrails: ['No automated migration, universal language support, or zero-defect promises.', 'No production changes without engineering review.'],
    example: {
      title: 'Illustrative example — a batch system nobody wants to touch',
      situation: 'A hypothetical organization runs a long-lived batch system few staff understand, blocking a platform change.',
      possibleWork: 'Map dependencies, generate characterization tests, find the safest high-value modules, pilot-migrate one under review.',
      outcome: 'A dependency map, a test harness, a prioritized backlog, and pilot findings that inform the go/no-go decision.',
    },
    cardAction: 'Explore legacy modernization',
    metaDescription: 'AI-assisted legacy code modernization: dependency mapping, test strategy, prioritized backlogs, and scoped migration pilots under engineering review.',
  },
  {
    id: 'digital-twins-evaluation',
    role: 'pathway',
    shortTitle: 'Digital twins and evaluation',
    title: 'Digital twins and AI evaluation',
    problem: 'Get evidence about operational choices and AI performance before committing.',
    work: 'Define the decision, assess data readiness, build a scoped simulation or model, and evaluate against task-specific criteria.',
    detail: [
      'A digital twin is useful when it is built around a decision someone has to make. We scope the model to that decision and the scenarios that matter, not to replicate everything.',
      'AI evaluation follows the same discipline. Curated test cases and an explicit scoring rubric turn impressions into comparable findings, including where the system fails. Evaluation is available on its own when a twin is not the right tool.',
    ],
    audience: 'Operations executives, transformation owners, and AI platform teams who need defensible evidence before scaling.',
    deliverables: ['Decision model and scenario explorer', 'Data requirements', 'Evaluation plan', 'Curated test cases and rubric', 'Comparative findings', 'Documented recommendations'],
    considerations: [
      'Model fidelity is matched to the decision; simple and validated beats ambitious.',
      'Evaluation quality depends on representative data and people who can judge correct behavior.',
      'Findings describe performance under tested conditions, with limitations stated.',
    ],
    guardrails: ['Twins are not assumed real-time, physics-based, autonomous, or verified replicas.', 'A good demo is not deployment readiness. No perfect-accuracy promises.'],
    example: {
      title: 'Illustrative example — evaluating an assistant before rollout',
      situation: 'A hypothetical service organization has an AI assistant that demos well and wants to know if it is safe for staff.',
      possibleWork: 'Define tasks, build a curated test set, agree a rubric with operations, run representative and adversarial cases, classify failures.',
      outcome: 'Scores by task, a failure-pattern catalogue, and a recommendation on what is ready, what needs guardrails, and what stays with people.',
    },
    cardAction: 'Explore digital twins and evaluation',
    metaDescription: 'Digital twins and AI evaluation: decision-scoped simulation, evaluation plans, curated test cases, and failure-pattern analysis before real-world changes.',
  },
  {
    id: 'ai-deployment',
    role: 'support',
    shortTitle: 'AI deployment',
    title: 'AI deployment and integration',
    problem: 'A working prototype still needs integrations, monitoring, and an owner.',
    work: 'Turn validated requirements into integration plans, release workflows, monitoring, fallback behavior, and operating responsibilities.',
    detail: [
      'The distance between a prototype and an operated system is where AI initiatives stall. Deployment work closes it: how the system connects to existing applications, how releases happen, what is monitored, and what happens when a model or dependency misbehaves.',
      'Ownership is designed in. Who approves a release, who answers an alert, and who can switch the system off are settled before go-live.',
    ],
    audience: 'Engineering and platform leaders, operations owners, and security stakeholders running AI in production.',
    deliverables: ['Deployment design', 'Integration implementation', 'Release checklist and rollback', 'Monitoring specification', 'Operational handoff'],
    considerations: [
      'Fits your existing hosting, security, and change-management practices.',
      'Integration scope is bounded by validated requirements.',
      'Timelines depend on environment access and approval processes.',
    ],
    guardrails: ['No cloud-partnership, uptime, or standard-timeline claims.'],
    example: {
      title: 'Illustrative example — moving a validated model into operation',
      situation: 'A hypothetical team has an evaluated document-routing model and no plan to integrate it with case management.',
      possibleWork: 'Design integration points and fallback, define drift and error monitoring, write the release checklist, run a staged rollout with named owners.',
      outcome: 'A monitored integration, an exercised rollback procedure, and a handoff the operations team can run from.',
    },
    cardAction: 'Explore AI deployment',
    metaDescription: 'AI deployment and integration: deployment design, integration implementation, release checklists, monitoring, and operational handoff.',
  },
  {
    id: 'ai-governance',
    role: 'support',
    shortTitle: 'AI governance',
    title: 'AI governance and operational controls',
    problem: 'AI adoption is outpacing decisions about responsibility and oversight.',
    work: 'Define practical decision rights, review checkpoints, documentation, and controls proportionate to each system.',
    detail: [
      'Governance that lives only in a policy document changes nothing. Effective controls attach to real systems and decisions: who approves what, which checkpoints a change passes, what gets documented, how problems escalate.',
      'Controls are proportionate. A low-risk internal tool and a system that affects customers get different treatment, and the difference is explicit.',
    ],
    audience: 'Risk, security, and compliance stakeholders, technology leaders, and sponsors accountable for AI in use.',
    deliverables: ['Responsibility matrix', 'Risk register', 'Review workflow', 'Documentation templates', 'Monitoring and escalation requirements'],
    considerations: [
      'Designed against your existing risk and audit practices.',
      'Pairs naturally with evaluation and deployment work.',
      'Legal and regulatory interpretation stays with your counsel.',
    ],
    guardrails: ['No legal advice, regulatory certification, or automatic compliance.'],
    example: {
      title: 'Illustrative example — controls for a growing set of AI tools',
      situation: 'A hypothetical enterprise has AI tools adopted by several teams and no shared view of ownership or review.',
      possibleWork: 'Inventory systems, classify by impact, define decision rights and checkpoints per class, provide templates and an escalation path.',
      outcome: 'A responsibility matrix, a tiered review workflow, and a risk register leadership can act on.',
    },
    cardAction: 'Explore AI governance',
    metaDescription: 'AI governance and operational controls: responsibility matrices, risk registers, review workflows, documentation templates, and escalation requirements.',
  },
];

export const serviceById = (id: ServiceId): Service => {
  const found = services.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown service id: ${id}`);
  return found;
};

export const servicePath = (id: ServiceId): string => `/services/${id}`;
