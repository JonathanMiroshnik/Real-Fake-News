export const sanitizeWriterName = (name: string) => name.replace(/ /g, '_');
export const desanitizeWriterName = (name: string) => name.replace(/_/g, ' ');

// TODO: get all writer articles from history + pagination? need fetch beyond daily