const PROFILE_KEY = 'basecamp_profile';

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
  } catch {
    return null;
  }
}

// Returns first dog's name, or fallback string
export function getDogName(fallback = 'your dog') {
  const profile = loadProfile();
  const name = profile?.dogs?.[0]?.name?.trim();
  return name || fallback;
}

// Returns all dog names joined nicely e.g. "Keybo & Luna"
export function getDogNames(fallback = 'your dogs') {
  const profile = loadProfile();
  const names = (profile?.dogs || []).map(d => d.name?.trim()).filter(Boolean);
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
}
