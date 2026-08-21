import { parse } from 'node-html-parser';

const ATTRIBUTES_TO_REMOVE = ['style', 'width', 'height', 'cellspacing', 'cellpadding', 'border'];

const stripHtml = (input: string) => {
  const root = parse(`<body>${input}</body>`, { lowerCaseTagName: false, comment: false });

  const body = root.querySelector('body');
  if (!body) {
    return input;
  }

  // abLegend duplicates the separate `legend` column; drop it so fluff isn't rendered twice.
  body
    .querySelectorAll('div.abName,p.abLegend,script,style')
    .forEach((element) => element.remove());
  // Reverse so nested elements unwrap before their parents capture innerHTML.
  body
    .querySelectorAll('a,i')
    .reverse()
    .forEach((element) => element.replaceWith(element.innerHTML));
  body.querySelectorAll('*').forEach((element) => {
    ATTRIBUTES_TO_REMOVE.forEach((attribute) => element.removeAttribute(attribute));
  });

  return (
    body.innerHTML
      // Remove empty paragraphs to avoid stray spacing
      .replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
      // Unwrap block-level content inside paragraphs (e.g., Wahapedia stat frames within <p>)
      .replace(/<p[^>]*>(\s*<div[^>]*class="dsCharWrap"[^>]*>[\s\S]*?<\/div>[\s\S]*?)<\/p>/gi, '$1')
      .trim()
  );
};

const assembleRecords = (rows: string[]): string[] => {
  const expected = rows[0].split('|').length;
  const assembled: string[] = [];
  let buffer = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!buffer && !row.replace(/\|/g, '').trim()) {
      continue;
    }

    buffer = buffer ? `${buffer}\n${row}` : row;
    if (buffer.split('|').length >= expected) {
      assembled.push(buffer);
      buffer = '';
    }
  }

  return assembled;
};

const convertToJSON = (input: string) => {
  const rows = input.replace(/^\uFEFF/, '').split('\r\n');
  const headers = rows[0]
    .split('|')
    .map((header) =>
      header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    );
  const result: Record<string, string>[] = [];

  for (const record of assembleRecords(rows)) {
    const data: Record<string, string> = {};
    const columns = record.split('|');

    // always ignore the last column
    for (let col = 0; col < columns.length - 1; col++) {
      data[headers[col]] = stripHtml(columns[col]);
    }

    result.push(data);
  }

  return result;
};

export default convertToJSON;
