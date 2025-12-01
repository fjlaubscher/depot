export const readJsonFile = async <T>(file: File): Promise<T> => {
  try {
    const contents = await file.text();
    return JSON.parse(contents) as T;
  } catch {
    throw new Error('Invalid JSON file');
  }
};
