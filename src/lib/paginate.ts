const MAX_CHARS_PER_PAGE = 900;

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function paginateContent(content: string): string[] {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const pages: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > MAX_CHARS_PER_PAGE) {
      pages.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) pages.push(current.trim());

  return pages.length > 0 ? pages : ["Ce livre n'a pas encore de contenu."];
}
