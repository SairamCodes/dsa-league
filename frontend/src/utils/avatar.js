export function getAvatarUrl(seed){
  // Use DiceBear Avatars (adventurer neutral) for high-quality illustrated avatars
  const s = encodeURIComponent(seed || Math.random().toString(36).slice(2,10))
  return `https://api.dicebear.com/6.x/adventurer/svg?seed=${s}&backgroundType=gradientLinear&radius=50`;
}
