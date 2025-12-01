export const readJsonFile = async <T>(file: File): Promise<T> => {
  const contents = await file.text();
  try {
    return JSON.parse(contents) as T;
  } catch (error) {
    throw new Error('Invalid JSON file');
  }
};
