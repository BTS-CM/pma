import { persistentAtom } from "@nanostores/persistent";

export const $disclaimerAccepted = persistentAtom<boolean>(
  "pma-disclaimer-accepted",
  false,
  {
    encode: JSON.stringify,
    decode: (str) => {
      try {
        return JSON.parse(str) as boolean;
      } catch {
        return false;
      }
    },
  }
);

export function acceptDisclaimer() {
  $disclaimerAccepted.set(true);
}

export function resetDisclaimer() {
  $disclaimerAccepted.set(false);
}
