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
const StarsView = lazy(() => import('@/modes/cosmic/star-systems/StarsView'));
const HrView = lazy(() => import('@/modes/cosmic/star-systems/HrView'));
const PlanetsView = lazy(() => import('@/modes/cosmic/star-systems/PlanetsView'));
const RelativityView = lazy(() => import('@/modes/cosmic/relativity/RelativityView'));
const CompactView = lazy(() => import('@/modes/cosmic/compact/CompactView'));
const LensingView = lazy(() => import('@/modes/cosmic/lensing/LensingView'));
const GalaxiesView = lazy(() => import('@/modes/cosmic/galaxies/GalaxiesView'));
const NebulaeView = lazy(() => import('@/modes/cosmic/nebulae/NebulaeView'));
const UniverseView = lazy(() => import('@/modes/cosmic/universe/UniverseView'));
const LadderView = lazy(() => import('@/modes/cosmic/universe/LadderView'));
const CmbView = lazy(() => import('@/modes/cosmic/universe/CmbView'));
const DarkMatterView = lazy(() => import('@/modes/cosmic/universe/DarkMatterView'));
const GwView = lazy(() => import('@/modes/cosmic/universe/GwView'));
const NotebookView = lazy(() => import('@/ui/NotebookView'));
const ScaleView = lazy(() => import('@/modes/scale/ScaleView'));
const RelationsView = lazy(() => import('@/modes/relations/RelationsView'));
const WaveLab = lazy(() => import('@/modes/spectral/laboratory/WaveLab'));
const SpectralAtlas = lazy(() => import('@/modes/spectral/atlas/SpectralAtlas'));
const FieldsView = lazy(() => import('@/modes/spectral/fields/FieldsView'));
const CompareView = lazy(() => import('@/modes/spectral/compare/CompareView'));
const AntennaView = lazy(() => import('@/modes/spectral/antennas/AntennaView'));
const RfView = lazy(() => import('@/modes/spectral/rf/RfView'));
const RoomView = lazy(() => import('@/modes/spectral/room/RoomView'));
const ModulationView = lazy(() => import('@/modes/spectral/modulation/ModulationView'));
const AcousticsView = lazy(() => import('@/modes/spectral/acoustics/AcousticsView'));
const AudioView = lazy(() => import('@/modes/spectral/audio/AudioView'));
const RoomAcousticsView = lazy(() => import('@/modes/spectral/roomacoustics/RoomAcousticsView'));
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
    document.title = mode === 'atomic' ? 'Atomic · Voyager Ventures' : mode === 'cosmic' ? 'Cosmic · Voyager Ventures' : mode === 'spectral' ? 'Spectral · Voyager Ventures' : mode === 'scale' ? 'Scale · Voyager Ventures' : mode === 'relations' ? 'Relationships · Voyager Ventures' : 'Voyager Ventures';
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
  } else if (mode === 'cosmic') view = path[1] === 'sandbox' ? <SandboxView /> : path[1] === 'relativity' ? <RelativityView /> : path[1] === 'compact' ? <CompactView /> : path[1] === 'lensing' ? <LensingView /> : path[1] === 'galaxies' ? <GalaxiesView /> : path[1] === 'nebulae' ? <NebulaeView /> : path[1] === 'universe' ? <UniverseView /> : path[1] === 'ladder' ? <LadderView /> : path[1] === 'cmb' ? <CmbView /> : path[1] === 'darkmatter' ? <DarkMatterView /> : path[1] === 'gw' ? <GwView /> : path[1] === 'stars' ? (path[2] === 'hr' ? <HrView /> : path[2] === 'planets' ? <PlanetsView /> : <StarsView />) : <CosmicView focusId={path[1] ?? 'sun'} />;
  else if (mode === 'spectral') view = path[1] === 'lab' ? <WaveLab /> : path[1] === 'fields' ? <FieldsView /> : path[1] === 'compare' ? <CompareView /> : path[1] === 'antennas' ? <AntennaView /> : path[1] === 'rf' ? <RfView /> : path[1] === 'room' ? <RoomView /> : path[1] === 'modulation' ? <ModulationView /> : path[1] === 'acoustics' ? <AcousticsView /> : path[1] === 'audio' ? <AudioView /> : path[1] === 'roomacoustics' ? <RoomAcousticsView /> : <SpectralAtlas />;
  else if (mode === 'notebook') view = <NotebookView />;
  else if (mode === 'scale') view = <ScaleView />;
  else if (mode === 'relations') view = <RelationsView />;
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
