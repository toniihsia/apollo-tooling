"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.printSchema = exports.introspectSchema = exports.downloadSchema = void 0;
require("./polyfills");
var downloadSchema_1 = require("./downloadSchema");
Object.defineProperty(exports, "downloadSchema", { enumerable: true, get: function () { return downloadSchema_1.default; } });
var introspectSchema_1 = require("./introspectSchema");
Object.defineProperty(exports, "introspectSchema", { enumerable: true, get: function () { return introspectSchema_1.default; } });
var printSchema_1 = require("./printSchema");
Object.defineProperty(exports, "printSchema", { enumerable: true, get: function () { return printSchema_1.default; } });
var generate_1 = require("./generate");
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return generate_1.default; } });
//# sourceMappingURL=index.js.map