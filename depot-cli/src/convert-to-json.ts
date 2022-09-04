const cleanCSV = (input: string) => input.replace(/^\uFEFF/, '').split('\r\n');

const stripHtml = (input: string) => input.replace(/(<([^>]+)>)/gi, '');

const convertToCamelCase = (input: string) =>
  input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

const getHeaders = (rows: string[]) => rows[0].split('|').map(convertToCamelCase);

interface Data {
  [key: string]: string;
}

const convertToJSON = (input: string, shouldStripHtml: boolean) => {
  const rows = cleanCSV(input);
  const headers = getHeaders(rows);
  const result: Data[] = [];

  // always skip the first row and ignore the last
  for (let i = 1; i < rows.length - 1; i++) {
    const data: Data = {};
    const columns = rows[i].split('|');

    // always ignore the last column
    for (let col = 0; col < columns.length - 1; col++) {
      data[headers[col]] = shouldStripHtml ? stripHtml(columns[col]) : columns[col];
    }

    result.push(data);
  }

  return result;
};

export default convertToJSON;
