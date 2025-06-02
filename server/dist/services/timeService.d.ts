/**
 * Standardizes dates to a single output date format
 * @param pubDate Date and time
 * @param pubDateTZ Timezone of the pubDate
 * @param outputFormat
 * @returns String of the standardized output date
 */
export declare function standardizeDate(pubDate: string, pubDateTZ: string, outputFormat?: 'iso' | 'utc' | 'locale' | 'sql' | 'http'): string;
