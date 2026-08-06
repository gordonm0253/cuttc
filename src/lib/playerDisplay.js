// Shared formatting helpers for showing a player identity compactly (avatar
// initials) across match cards, podiums, etc.
export function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
