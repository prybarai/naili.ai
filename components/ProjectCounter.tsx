'use client';

import { useEffect, useState, useRef } from 'react';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;

    const startTime = performance.now();
    const startVal = 0;
    const delta = target - startVal;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + delta * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

export default function ProjectCounter() {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/projects/count')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProjectCount(data.count ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, []);

  const animatedCount = useCountUp(projectCount ?? 0, 2000);

  if (error) {
    return (
      <div className="nl-stat">
        <div className="nl-gradient-text nl-stat__value">Smart</div>
        <p className="nl-stat__label">AI Engine</p>
      </div>
    );
  }

  return (
    <div className="nl-stat">
      <div className="nl-gradient-text nl-stat__value">
        {projectCount !== null ? `${animatedCount.toLocaleString()}+` : '...'}
      </div>
      <p className="nl-stat__label">Projects Estimated</p>
    </div>
  );
}
