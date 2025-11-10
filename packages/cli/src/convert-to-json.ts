import { parse, HTMLElement as HtmlNode } from 'node-html-parser';

const cleanCSV = (input: string) => input.replace(/^\uFEFF/, '').split('\r\n');

const ATTRIBUTES_TO_REMOVE = ['style', 'width', 'height', 'cellspacing', 'cellpadding', 'border'];
const BLOCKED_TAGS = new Set(['script', 'style']);
const TAGS_TO_UNWRAP = new Set(['a', 'i']);

const hasClassName = (element: HtmlNode, className: string) =>
  element
    .getAttribute('class')
    ?.split(/\s+/)
    .some((name) => name === className);

const sanitizeElement = (element: HtmlNode) => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'div' && hasClassName(element, 'abName')) {
    element.remove();
    return;
  }

  if (BLOCKED_TAGS.has(tagName)) {
    element.remove();
    return;
  }

  element.childNodes.forEach((child) => {
    if (child instanceof HtmlNode) {
      sanitizeElement(child);
    }
  });

  if (TAGS_TO_UNWRAP.has(tagName)) {
    element.replaceWith(element.innerHTML);
    return;
  }

  ATTRIBUTES_TO_REMOVE.forEach((attribute) => element.removeAttribute(attribute));
};

const stripHtml = (input: string) => {
  const wrapped = `<body>${input}</body>`;
  const root = parse(wrapped, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: false,
      style: false
    }
  });

  const body = root.querySelector('body');
  if (!body) {
    return input;
  }

  body.childNodes.forEach((node) => {
    if (node instanceof HtmlNode) {
      sanitizeElement(node);
    }
  });

  let processedInput = body.innerHTML;

  // Remove anchor tags but keep their inner text content
  processedInput = processedInput.replace(/<a[^>]*>(.*?)<\/a>/gis, '$1');

  // Remove empty paragraphs to avoid stray spacing
  processedInput = processedInput.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  // Unwrap block-level content inside paragraphs (e.g., Wahapedia stat frames within <p>)
  processedInput = processedInput.replace(
    /<p[^>]*>(\s*<div[^>]*class="dsCharWrap"[^>]*>[\s\S]*?<\/div>[\s\S]*?)<\/p>/gi,
    '$1'
  );

  return processedInput.trim();
};

const convertToCamelCase = (input: string) =>
  input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

const getHeaders = (rows: string[]) => rows[0].split('|').map(convertToCamelCase);

interface Data {
  [key: string]: string;
}

const convertToJSON = (input: string) => {
  const rows = cleanCSV(input);
  const headers = getHeaders(rows);
  const result: Data[] = [];

  // always skip the first row and ignore the last
  for (let i = 1; i < rows.length - 1; i++) {
    const data: Data = {};
    const columns = rows[i].split('|');

    // always ignore the last column
    for (let col = 0; col < columns.length - 1; col++) {
      data[headers[col]] = stripHtml(columns[col]);
    }

    result.push(data);
  }

  return result;
};

export default convertToJSON;
