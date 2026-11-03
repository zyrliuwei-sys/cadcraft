/** Geometry only: saving metadata or selecting an object is not drawing. */
export function dxfGeometry(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n');
  const section = /(?:^|\n)[ \t]*2\nENTITIES\n/.exec(normalized);
  if (!section) return '';
  const start = section.index + section[0].length;
  const content = normalized.slice(start);
  const end = /(?:^|\n)[ \t]*0\nENDSEC(?:\n|$)/.exec(content);
  return end ? content.slice(0, end.index).trim() : '';
}
