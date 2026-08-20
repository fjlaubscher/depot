import { parse } from 'node-html-parser';

const cleanCSV = (input: string) => input.replace(/^\uFEFF/, '').split('\r\n');

const ATTRIBUTES_TO_REMOVE = ['style', 'width', 'height', 'cellspacing', 'cellpadding', 'border'];

const stripHtml = (input: string) => {
  const root = parse(`<body>${input}</body>`, { lowerCaseTagName: false, comment: false });

  const body = root.querySelector('body');
  if (!body) {
    return input;
  }

  body.querySelectorAll('div.abName,script,style').forEach((element) => element.remove());
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

const convertToCamelCase = (input: string) =>
  input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

const getHeaders = (rows: string[]) => rows[0].split('|').map(convertToCamelCase);

const isBlankRow = (row: string) => !row.replace(/\|/g, '').trim();

const assembleRecords = (rows: string[]): string[] => {
  const expected = rows[0].split('|').length;
  const assembled: string[] = [];
  let buffer = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!buffer && isBlankRow(row)) {
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
  const rows = cleanCSV(input);
  const headers = getHeaders(rows);
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
