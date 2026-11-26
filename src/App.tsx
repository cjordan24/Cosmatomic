import { lazy, Suspense, useEffect } from 'react';
import { useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { TopBar } from '@/ui/TopBar';
import { Loading } from '@/ui/components';

const Landing = lazy(() => import('@/modes/landing/Landing'));
const PeriodicTable = lazy(() => import('@/modes/atomic/periodic-table/PeriodicTable'));
const ElementView = lazy(() => import('@/modes/atomic/atoms/ElementView'));
const MoleculeView = lazy(() => import('@/modes/atomic/molecules/MoleculeView'));
const CosmicView = lazy(() => import('@/modes/cosmic/solar-system/CosmicView'));
const LaboratoryView = lazy(() => import('@/modes/atomic/laboratory/LaboratoryView'));
const SandboxView = lazy(() => import('@/modes/cosmic/sandbox/SandboxView'));
const NotebookView = lazy(() => import('@/ui/NotebookView'));
const WaveLab = lazy(() => import('@/modes/spectral/laboratory/WaveLab'));
const SpectralAtlas = lazy(() => import('@/modes/spectral/atlas/SpectralAtlas'));
const SourcesView = lazy(() => import('@/ui/SourcesView'));
const MaterialsView = lazy(() => import('@/modes/atomic/materials/MaterialsView'));
const PhasesView = lazy(() => import('@/modes/atomic/phases/PhasesView'));
const ReactionsView = lazy(() => import('@/modes/atomic/reactions/ReactionsView'));

export default function App() {
  const { path } = useRoute();
  const { reducedMotion, highContrast } = useVoyager((s) => s.settings);
  const mode = path[0] ?? 'landing';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.search input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.title = mode === 'atomic' ? 'Atomic · Voyager Ventures' : mode === 'cosmic' ? 'Cosmic · Voyager Ventures' : mode === 'spectral' ? 'Spectral · Voyager Ventures' : 'Voyager Ventures';
  }, [mode]);

  let view;
  if (mode === 'atomic') {
    if (path[1] === 'element' && path[2]) view = <ElementView Z={Number(path[2])} />;
    else if (path[1] === 'molecules') view = <MoleculeView id={path[2] ?? null} />;
    else if (path[1] === 'lab') view = <LaboratoryView />;
    else if (path[1] === 'reactions') view = <ReactionsView id={path[2] ?? null} />;
    else if (path[1] === 'materials') view = <MaterialsView id={path[2] ?? null} />;
    else if (path[1] === 'phases') view = <PhasesView tab={path[2] ?? null} />;
    else view = <PeriodicTable />;
  } else if (mode === 'cosmic') view = path[1] === 'sandbox' ? <SandboxView /> : <CosmicView focusId={path[1] ?? 'sun'} />;
  else if (mode === 'spectral') view = path[1] === 'lab' ? <WaveLab /> : <SpectralAtlas />;
  else if (mode === 'notebook') view = <NotebookView />;
  else if (mode === 'sources') view = <SourcesView id={path[1] ?? null} />;
  else view = <Landing />;

  return (
    <div className={`app mode-${mode} ${reducedMotion ? 'reduced-motion' : ''} ${highContrast ? 'high-contrast' : ''}`}>
      {mode !== 'landing' && <TopBar />}
      <main className="stage">
        <Suspense fallback={<Loading />}>{view}</Suspense>
      </main>
    </div>
  );
}
