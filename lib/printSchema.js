"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const graphql_1 = require("graphql");
const errors_1 = require("./errors");
async function printSchemaFromIntrospectionResult(schemaPath, outputPath) {
    if (!fs.existsSync(schemaPath)) {
        throw new errors_1.ToolError(`Cannot find GraphQL schema file: ${schemaPath}`);
    }
    const schemaJSON = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    if (!schemaJSON.data) {
        throw new errors_1.ToolError(`No introspection query result data found in: ${schemaPath}`);
    }
    const schema = (0, graphql_1.buildClientSchema)(schemaJSON.data);
    const schemaIDL = (0, graphql_1.printSchema)(schema);
    if (outputPath) {
        fs.writeFileSync(outputPath, schemaIDL);
    }
    else {
        console.log(schemaIDL);
    }
}
exports.default = printSchemaFromIntrospectionResult;
//# sourceMappingURL=printSchema.js.map