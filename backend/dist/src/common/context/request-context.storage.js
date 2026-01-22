"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextStorage = void 0;
exports.getRequestContext = getRequestContext;
const async_hooks_1 = require("async_hooks");
exports.contextStorage = new async_hooks_1.AsyncLocalStorage();
function getRequestContext() {
    return exports.contextStorage.getStore();
}
//# sourceMappingURL=request-context.storage.js.map