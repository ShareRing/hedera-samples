import React, { useEffect, useRef } from 'react';
import deepEqual from 'fast-deep-equal';

const isPrimitive = (value: number | string) =>
  ['number', 'string', 'boolean'].includes(typeof value);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const warnDeps = (dependencies: any[]) => {
  if (dependencies.length === 0) {
    console.warn('useDeepEffect should not be used with no dependencies. Use useEffect instead.');
  }

  if (dependencies.every(isPrimitive)) {
    console.warn('useDeepEffect should not be used with primitive values. Use useEffect instead.');
  }
};

type CompareFunction = (
  a: React.DependencyList | undefined,
  b: React.DependencyList | undefined
) => boolean;

const getTriggerDeps = (
  dependencies: React.DependencyList,
  comparisonFn: CompareFunction
): number[] => {
  const ref = useRef<React.DependencyList>(); // eslint-disable-line react-hooks/rules-of-hooks
  const triggerDeps = useRef<number>(0); // eslint-disable-line react-hooks/rules-of-hooks

  if (!comparisonFn(dependencies, ref.current)) {
    ref.current = dependencies;
    triggerDeps.current = Math.random();
  }

  return [triggerDeps.current];
};

const useDeepEffect = (
  fn: React.EffectCallback,
  dependencies: any[] = [], // eslint-disable-line @typescript-eslint/no-explicit-any
  comparisonFn: CompareFunction = deepEqual
): void => {
  if (process.env.NODE_ENV !== 'production') {
    warnDeps(dependencies);
  }

  return useEffect(fn, getTriggerDeps(dependencies, comparisonFn)); // eslint-disable-line react-hooks/exhaustive-deps
};

export { useDeepEffect };
