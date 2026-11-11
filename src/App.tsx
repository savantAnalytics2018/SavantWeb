import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Approach from '@/pages/Approach';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import TestYourIdea from '@/pages/TestYourIdea';
import StartStudy from '@/pages/StartStudy';
import DecisionStudy from '@/pages/DecisionStudy';
import TwinDetail from '@/pages/TwinDetail';
import TwinDetailStart from '@/pages/TwinDetailStart';
import NotFound from '@/pages/NotFound';
import { isDetailHost, isResearchHost } from '@/lib/host';

/**
 * On twinresearch.<domain> the Worker serves the research landing at "/" and the wizard at
 * "/start"; the client router must agree so hydration and in-app navigation match the HTML.
 * During prerender (no window) this is false and the main-site routes are used.
 */
export default function App() {
  const research = isResearchHost();
  const detail = isDetailHost();
  return (
    <Routes>
      {/* Standalone: outside the site Layout on purpose (no site header, nav, or footer). */}
      <Route path="decision-study" element={<DecisionStudy />} />
      {/* Private tier menu (twindetail.<domain>): hidden main-site paths plus short paths on that host. */}
      <Route path="twin-detail" element={<TwinDetail />} />
      <Route path="twin-detail/start/:tier" element={<TwinDetailStart />} />
      {detail && <Route path="/" element={<TwinDetail />} />}
      {detail && <Route path="start/:tier" element={<TwinDetailStart />} />}
      <Route element={<Layout />}>
        {!detail && <Route index element={research ? <TestYourIdea /> : <Home />} />}
        {research && <Route path="start" element={<StartStudy />} />}
        <Route path="services" element={<Services />} />
        <Route path="services/:serviceId" element={<ServiceDetail />} />
        <Route path="approach" element={<Approach />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="market-research" element={<TestYourIdea />} />
        <Route path="market-research/start" element={<StartStudy />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
