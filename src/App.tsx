import { useCallback, useEffect, useRef, useState } from 'react';
import { PLANS } from './data/plans.generated';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { MasterPlanView } from './components/MasterPlanView';
import { Site3DView } from './components/Site3DView';
import { Unit3DView } from './components/Unit3DView';

const MASTER_ID = 'master';
const SITE3D = 'site3d';
const U3D = 'u3d:';

/** Groups for the plan picker, in the order the brochure presents them. */
const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Tower 1', ids: ['t1-1245', 't1-1505'] },
  { label: 'Tower 2 & 3', ids: ['t23-1245', 't23-1505'] },
  { label: 'Tower 6 & 7', ids: ['t67-997-1', 't67-997-2', 't67-997-3'] },
];

export default function App() {
  const [active, setActive] = useState<string>(() => {
    const h = location.hash.slice(1);
    const valid = (id: string) => PLANS.some((p) => p.id === id);
    return h === MASTER_ID || h === SITE3D || valid(h) || (h.startsWith(U3D) && valid(h.slice(4))) ? h : PLANS[0].id;
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    history.replaceState(null, '', `#${active}`);
  }, [active]);

  useEffect(() => {
    const on = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.().catch(() => setIsFs((v) => !v));
  }, []);

  const plan = PLANS.find((p) => p.id === active);
  const unit3d = active.startsWith(U3D) ? PLANS.find((p) => p.id === active.slice(4)) : undefined;

  return (
    <div ref={rootRef} className={'app' + (isFs ? ' fs' : '')}>
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 21V9l9-6 9 6v12H3z" />
              <path d="M9 21v-6h6v6" />
            </svg>
          </span>
          <div>
            <div className="brand-title">Wind Park</div>
            <div className="brand-sub">Interactive floor plans</div>
          </div>
        </div>
        <nav className="picker" aria-label="Choose plan">
          <button className={'pill' + (active === MASTER_ID ? ' on' : '')} onClick={() => setActive(MASTER_ID)}>
            Site plan
          </button>
          <button className={'pill pill3d' + (active === SITE3D ? ' on' : '')} onClick={() => setActive(SITE3D)}>
            🧊 3D site
          </button>
          {GROUPS.map((g) => (
            <div className="group" key={g.label}>
              <span className="group-label">{g.label}</span>
              {g.ids.map((id) => {
                const p = PLANS.find((q) => q.id === id)!;
                return (
                  <button key={id} className={'pill' + (active === id || active === U3D + id ? ' on' : '')} onClick={() => setActive(id)} title={p.title}>
                    {p.title.split('·')[1].replace('Type', '').trim()}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </header>
      <main>
        {plan ? (
          <FloorPlanViewer key={plan.id} plan={plan} onFullscreen={toggleFs} isFullscreen={isFs} onOpen3D={() => setActive(U3D + plan.id)} />
        ) : unit3d ? (
          <Unit3DView key={unit3d.id} plan={unit3d} onBack2D={() => setActive(unit3d.id)} onSite={() => setActive(SITE3D)} />
        ) : active === SITE3D ? (
          <Site3DView onOpenPlan={setActive} onOpenUnit3D={(id) => setActive(U3D + id)} />
        ) : (
          <MasterPlanView onOpenPlan={setActive} onFullscreen={toggleFs} isFullscreen={isFs} onOpen3D={() => setActive(SITE3D)} />
        )}
      </main>
    </div>
  );
}
