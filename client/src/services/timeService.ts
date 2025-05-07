export const MINUTE_MILLISECS: number = 60 * 1000;
export const HOUR_MILLISECS: number = 60 * MINUTE_MILLISECS;
export const DAY_MILLISECS: number = 24 * HOUR_MILLISECS;    

export function getLatestTime(milliseconds: number): string {
    if (milliseconds > 2 * DAY_MILLISECS) {
        return Math.ceil(milliseconds/DAY_MILLISECS) + " days ago";
    }
    else if (milliseconds > DAY_MILLISECS) {
        return "1 day ago";
    }
    else if (milliseconds > 2 * HOUR_MILLISECS) {
        return Math.ceil(milliseconds/HOUR_MILLISECS) + " hours ago";
    }
    else if (milliseconds > HOUR_MILLISECS) {
        return "1 hour ago";
    }
    else if (milliseconds > MINUTE_MILLISECS) {
        return Math.ceil(milliseconds/MINUTE_MILLISECS) + " minutes ago";
    }
    else {
        return "Less than a minute ago";
    }
}