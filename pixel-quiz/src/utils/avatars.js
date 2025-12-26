
export const getAvatarUrl = (seed) => {
  // Using 'pixel-art' style from DiceBear
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
};

// Pre-define some seeds if we want consistent "Bosses" or just random ones
export const BOSS_SEEDS = Array.from({ length: 100 }, (_, i) => `boss_${i}`);

export const getBossImage = (levelIndex) => {
  // Use modulo to cycle through if levels > 100, though mostly covers it.
  const seed = BOSS_SEEDS[levelIndex % BOSS_SEEDS.length];
  return getAvatarUrl(seed);
};
