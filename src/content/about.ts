/**
 * About content — the team, not an individual. Describes experience by
 * category (owner-supplied). Named employers, agencies, clients, and
 * credentials are added only when approved (see docs/PROVENANCE.md).
 */
export const about = {
  heading: 'About Savant Analytics',
  intro:
    'A consulting team with enterprise and federal delivery experience, focused on making AI decisions defensible and AI systems operable.',
  paragraphs: [
    'Our consultants come from large consulting firms and have delivered data and AI modernization programs for federal civilian agencies and Fortune 500 organizations.',
    'The team has deep experience migrating legacy analytics platforms, including SAS-to-Python, building governed data platforms, and putting AI systems into managed operation with clear ownership and controls.',
    'We work hands-on and leave behind artifacts your teams can run from: dependency maps, ranked portfolios, evaluation reports, responsibility matrices.',
  ],
  experience: [
    { id: 'federal', title: 'Federal programs', body: 'Data and AI modernization for civilian agencies under governance and security constraints.' },
    { id: 'enterprise', title: 'Fortune 500 transformation', body: 'Analytics platform migration and AI delivery inside large, regulated organizations.' },
    { id: 'modernization', title: 'Legacy analytics modernization', body: 'SAS-to-Python and ETL/ELT migration with testing and parallel-run discipline.' },
    { id: 'governance', title: 'AI governance', body: 'Zero-trust-informed controls, decision rights, and oversight for AI in operation.' },
  ],
  principles: [
    { id: 'decisions-first', title: 'Start from the decision', body: 'Every engagement is organized around a decision someone has to make.' },
    { id: 'evidence', title: 'Evidence over demos', body: 'Tested scenarios and documented limitations carry the argument.' },
    { id: 'operability', title: 'Built for the people who run it', body: 'Ownership, monitoring, and controls are part of the build.' },
    { id: 'candor', title: 'Say when AI is not the answer', body: 'Sometimes the better investment is data, process, or existing software.' },
  ],
  homepageBlurb:
    'A team with large-consultancy, federal, and Fortune 500 delivery experience in data and AI modernization.',
};
