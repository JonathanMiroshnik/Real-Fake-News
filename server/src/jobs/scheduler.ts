import { blogWritingManager } from "./blogWriting.js";
import { ONE_HOUR_MILLISECS } from "../config/constants.js";

// Used to start the recurring back-end jobs
export function initializeScheduledJobs() {
//   if (process.env.NODE_ENV !== 'test') {
    blogWritingManager(ONE_HOUR_MILLISECS * 8); // DAY_MILLISECS ONE_HOUR_MILLISECS
//   }
}
