/** Read browser storage after hydration; cancel the read if the view unmounts. */
export function browserHydration(read: () => void) {
  let active = true;
  queueMicrotask(() => { if (active) read(); });
  return () => { active = false; };
}
