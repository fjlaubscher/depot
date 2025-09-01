const cleanCSV = (input: string) => input.replace(/^\uFEFF/, '').split('\r\n');

const stripHtml = (input: string) => {
  // First, completely remove div elements with class="abName" and their contents
  let processedInput = input.replace(/<div\s+class="abName"[^>]*>.*?<\/div>/gis, '');

  // Preserve span tags with class="kwb" and their variations, list elements, and br tags
  const preserveRegex =
    /(<span\s+class="kwb[^"]*"[^>]*>.*?<\/span>|<ul[^>]*>.*?<\/ul>|<ol[^>]*>.*?<\/ol>|<li[^>]*>.*?<\/li>|<br[^>]*\/?>)/gis;
  const preservedElements: string[] = [];

  // Extract and temporarily replace preserved elements with placeholders
  processedInput = processedInput.replace(preserveRegex, (match) => {
    const placeholder = `__PRESERVED_${preservedElements.length}__`;
    preservedElements.push(match);
    return placeholder;
  });

  // Remove all other HTML tags
  processedInput = processedInput.replace(/(<([^>]+)>)/gi, '');

  // Restore preserved elements
  preservedElements.forEach((element, index) => {
    const placeholder = `__PRESERVED_${index}__`;
    processedInput = processedInput.replace(placeholder, element);
  });

  return processedInput;
};

const convertToCamelCase = (input: string) =>
  input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

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
