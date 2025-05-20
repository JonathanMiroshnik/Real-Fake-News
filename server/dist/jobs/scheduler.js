"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeScheduledJobs = initializeScheduledJobs;
const blogWriting_js_1 = require("./blogWriting.js");
const constants_js_1 = require("../config/constants.js");
// Used to start the recurring back-end jobs
function initializeScheduledJobs() {
    //   if (process.env.NODE_ENV !== 'test') {
    (0, blogWriting_js_1.blogWritingManager)(constants_js_1.ONE_HOUR_MILLISECS * 8); // DAY_MILLISECS ONE_HOUR_MILLISECS
    //   }
}
//# sourceMappingURL=scheduler.js.map