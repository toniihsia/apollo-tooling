"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const loading_1 = require("./loading");
const validation_1 = require("./validation");
const compiler_1 = require("./compiler");
const legacyIR_1 = require("./compiler/legacyIR");
const serializeToJSON_1 = require("./serializeToJSON");
const swift_1 = require("./swift");
const typescript_1 = require("./typescript");
const flow_1 = require("./flow");
const scala_1 = require("./scala");
function generate(inputPaths, schemaPath, outputPath, target, tagName, options) {
    const schema = (0, loading_1.loadSchema)(schemaPath);
    const document = (0, loading_1.loadAndMergeQueryDocuments)(inputPaths, tagName);
    (0, validation_1.validateQueryDocument)(schema, document);
    let output;
    if (target === 'swift') {
        options.addTypename = true;
        const context = (0, compiler_1.compileToIR)(schema, document, options);
        output = (0, swift_1.generateSource)(context);
        if (options.generateOperationIds) {
            writeOperationIdsMap(context);
        }
    }
    else {
        const context = (0, legacyIR_1.compileToLegacyIR)(schema, document, options);
        switch (target) {
            case 'json':
                output = (0, serializeToJSON_1.default)(context);
                break;
            case 'ts':
            case 'typescript':
                output = (0, typescript_1.generateSource)(context);
                break;
            case 'flow':
                output = (0, flow_1.generateSource)(context);
                break;
            case 'scala':
                output = (0, scala_1.generateSource)(context, options);
        }
    }
    if (outputPath) {
        fs.writeFileSync(outputPath, output);
    }
    else {
        console.log(output);
    }
}
exports.default = generate;
function writeOperationIdsMap(context) {
    let operationIdsMap = {};
    Object.values(context.operations).forEach(operation => {
        operationIdsMap[operation.operationId] = {
            name: operation.operationName,
            source: operation.sourceWithFragments
        };
    });
    fs.writeFileSync(context.operationIdsPath, JSON.stringify(operationIdsMap, null, 2));
}
//# sourceMappingURL=generate.js.map