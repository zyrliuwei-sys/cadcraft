/** Only simple same-site Markdown links are supported in editorial FAQ copy. */
export function faqAnswerParts(
  answer: string
): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  const pattern = /\[([^\]\n]+)\]\((\/(?!\/)[a-zA-Z0-9/-]*)\)/g;
  let offset = 0;
  for (const match of answer.matchAll(pattern)) {
    parts.push({ text: answer.slice(offset, match.index) });
    parts.push({ text: match[1], href: match[2] });
    offset = match.index! + match[0].length;
  }
  parts.push({ text: answer.slice(offset) });
  return parts;
}

export function faqAnswerText(answer: string): string {
  return faqAnswerParts(answer)
    .map((part) => part.text)
    .join('');
}
