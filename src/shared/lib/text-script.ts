/**
 * Which of the storefront's two written languages a string is in, or null when
 * there is nothing to go on (digits, punctuation, an empty string).
 *
 * Deliberately a script test, not a language test. Persian and English are the
 * two locales this storefront ships, and they are written in scripts that share
 * no letters, so counting letters settles it without a language model. A string
 * that mixes both — "ظرف گل 1004" is Persian plus Latin digits, "Box Gol" is
 * Latin — is decided by which script carries more of its letters.
 */
export function detectTextScript(text: string): "fa" | "en" | null {
  let arabic = 0;
  let latin = 0;

  for (const character of text) {
    const code = character.codePointAt(0);
    if (code === undefined) continue;

    // Arabic, Arabic Supplement, Arabic Extended-A, Arabic Presentation Forms.
    if (
      (code >= 0x0600 && code <= 0x06ff) ||
      (code >= 0x0750 && code <= 0x077f) ||
      (code >= 0x08a0 && code <= 0x08ff) ||
      (code >= 0xfb50 && code <= 0xfdff) ||
      (code >= 0xfe70 && code <= 0xfeff)
    ) {
      // Arabic-Indic digits are punctuation for this purpose, not evidence: a
      // price or a model number written in them says nothing about the words.
      if (
        (code >= 0x0660 && code <= 0x0669) ||
        (code >= 0x06f0 && code <= 0x06f9)
      ) {
        continue;
      }
      arabic += 1;
      continue;
    }

    if (
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (code >= 0xc0 && code <= 0x24f)
    ) {
      latin += 1;
    }
  }

  if (arabic === 0 && latin === 0) return null;
  return arabic >= latin ? "fa" : "en";
}
