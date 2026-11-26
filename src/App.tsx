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
    document.title = mode === 'atomic' ? 'Atomic · Voyager Ventures' : mode === 'cosmic' ? 'Cosmic · Voyager Ventures' : 'Voyager Ventures';
  }, [mode]);

  let view;
  if (mode === 'atomic') {
    if (path[1] === 'element' && path[2]) view = <ElementView Z={Number(path[2])} />;
    else if (path[1] === 'molecules') view = <MoleculeView id={path[2] ?? null} />;
    else view = <PeriodicTable />;
  } else if (mode === 'cosmic') view = <CosmicView focusId={path[1] ?? 'sun'} />;
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
