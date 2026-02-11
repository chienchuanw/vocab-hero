declare const navigator: { userAgent: string } | undefined;

export function isElectron(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('electron');
}

export function isWeb(): boolean {
  return !isElectron();
}
