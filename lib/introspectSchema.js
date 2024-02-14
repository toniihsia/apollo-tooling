"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.introspect = void 0;
const fs = require("fs");
const graphql_1 = require("graphql");
const utilities_1 = require("graphql/utilities");
const errors_1 = require("./errors");
async function introspect(schemaContents) {
    const schema = (0, graphql_1.buildASTSchema)((0, graphql_1.parse)(schemaContents));
    return await (0, graphql_1.graphql)(schema, utilities_1.introspectionQuery);
}
exports.introspect = introspect;
async function introspectSchema(schemaPath, outputPath) {
    if (!fs.existsSync(schemaPath)) {
        throw new errors_1.ToolError(`Cannot find GraphQL schema file: ${schemaPath}`);
    }
    const schemaContents = fs.readFileSync(schemaPath).toString();
    const result = await introspect(schemaContents);
    if (result.errors) {
        throw new errors_1.ToolError(`Errors in introspection query result: ${result.errors}`);
    }
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
}
exports.default = introspectSchema;
//# sourceMappingURL=introspectSchema.js.map