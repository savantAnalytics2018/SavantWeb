import { useParams } from 'react-router-dom';
import DecisionStudyWizard from '@/components/DecisionStudyWizard';
import DetailShell from '@/components/DetailShell';
import StudyWizard from '@/components/StudyWizard';
import { intakeCopy } from '@/content/testYourIdea';
import { tierById } from '@/content/twinDetail';
import { pageMeta } from '@/content/meta';
import { useHead } from '@/lib/head';
import NotFound from '@/pages/NotFound';

/**
 * Page 2 of the private menu: the intake for the chosen tier.
 *
 * One form per kind of engagement, not per tier:
 *  - snapshot            → the free-study wizard (same endpoint, lead gate and confirm link
 *                          as twinresearch; the triage email shows source = twindetail)
 *  - decision-study /
 *    calibration         → the Decision Study scoping questionnaire with the package pre-selected
 */
export default function TwinDetailStart() {
  const { tier: tierId } = useParams();
  const tier = tierById(tierId);
  useHead(tier ? { ...pageMeta.twinDetailStart, title: `${tier.name} — intake — Savant Analytics` } : pageMeta.twinDetailStart);
  if (!tier) return <NotFound />;

  return (
    <DetailShell tag={tier.name} showBack>
      <div className="container ds__form">
        <p className="eyebrow">{tier.name}</p>
        <h1 className="h1--page" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          {tier.packageId ? 'Scoping questionnaire' : 'Request your snapshot'}
        </h1>
        <p className="lede" style={{ marginBottom: 'var(--s-6)' }}>
          {tier.packageId ? 'Seven short screens. Your answers are saved in this browser until you submit.' : intakeCopy.lede}
        </p>
        {tier.packageId ? <DecisionStudyWizard presetPackage={tier.packageId} /> : <StudyWizard />}
      </div>
    </DetailShell>
  );
}
