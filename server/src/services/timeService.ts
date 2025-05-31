import { DateTime } from 'luxon';

export function standardizeDate(
    pubDate: string,
    pubDateTZ: string,
    outputFormat: 'iso' | 'utc' | 'locale' | 'sql' | 'http' = 'iso'
): string {
    try {
        // Create a Luxon DateTime object with the original timezone
        let dt: DateTime;
        const dateFormat = 'yyyy-MM-dd HH:mm:ss';
        
        if (pubDateTZ.toUpperCase() === 'UTC' || pubDateTZ === 'Z') {
            dt = DateTime.fromFormat(pubDate, dateFormat, { zone: 'utc' });
        } else if (pubDateTZ.startsWith('GMT') || pubDateTZ.startsWith('Etc/GMT')) {
            dt = DateTime.fromFormat(pubDate, dateFormat, { zone: pubDateTZ });
        } else {
            dt = DateTime.fromFormat(pubDate, dateFormat, { zone: pubDateTZ });
        }

        if (!dt.isValid) {
            throw new Error(`Invalid date/time: ${dt.invalidExplanation}`);
        }

        // Convert to UTC
        const utcDt = dt.toUTC();
        
        switch (outputFormat) {
            case 'iso':
                return utcDt.toISO() ?? '';
            case 'utc':
                return utcDt.toString();
            case 'locale':
                return utcDt.toLocaleString(DateTime.DATETIME_FULL);
            case 'sql':
                return utcDt.toSQL() ?? '';
            case 'http':
                const httpRet = utcDt.toHTTP();
                if (httpRet) {
                    return httpRet;
                }
                
                throw new Error("HTTP Time Format null");                
            default:
                return utcDt.toISO() ?? '';
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error standardizing date: ${errorMessage}`);
        
        // Fallback to simple JS Date conversion
        const date = new Date(pubDate);
        if (isNaN(date.getTime())) {
            throw new Error(`Unable to parse date: ${pubDate}`);
        }
        return date.toISOString();
    }
}

// // Example usages:
// async function runExamples() {
//     console.log(await standardizeDate("2025-05-27 07:17:00", "UTC"));
//     // "2025-05-27T07:17:00.000Z"
    
//     console.log(await standardizeDate("2025-05-27 07:17:00", "America/New_York"));
//     // Converts from ET to UTC
    
//     console.log(await standardizeDate("2025-05-27 07:17:00", "GMT+5"));
//     // Converts from GMT+5 to UTC
    
//     console.log(await standardizeDate("2025-05-27 07:17:00", "Asia/Tokyo", 'timestamp'));
//     // Returns UTC timestamp
// }

// runExamples();