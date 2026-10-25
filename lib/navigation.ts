export function discoveryPath(rewardId?: string): string {
  return rewardId ? `/discover?reward=${encodeURIComponent(rewardId)}` : '/discover';
}

export function legacyDiscoveryPath(query: Record<string, string | string[] | undefined>): string | undefined {
  const reward = Array.isArray(query.reward) ? query.reward[0] : query.reward;
  if (reward) return discoveryPath(reward);
  const companion = Array.isArray(query.companion) ? query.companion[0] : query.companion;
  if (companion === 'save') return '/discover?companion=save';
  return undefined;
}
