import { LegacyInlineFragment } from '../compiler/legacyIR';

import { propertyDeclarations } from './codeGeneration';
import { typeNameFromGraphQLType } from './types';

import CodeGenerator from "../utilities/CodeGenerator";
import { GraphQLType } from "graphql";

export interface Property {
  fieldName?: string,
  fieldType?: GraphQLType,
  propertyName?: string,
  type?: GraphQLType,
  description?: string,
  typeName?: string,
  isComposite?: boolean,
  isNullable?: boolean,
  fields?: any[],
  inlineFragments?: LegacyInlineFragment[],
  fragmentSpreads?: any,
  isInput?: boolean,
  isArray?: boolean,
  isArrayElementNullable?: boolean | null,
}

export function interfaceDeclaration(generator: CodeGenerator, {
  interfaceName,
  noBrackets
}: { interfaceName: string, noBrackets?: boolean },
  closure: () => void) {
  generator.printNewlineIfNeeded();
  generator.printNewline();
  generator.print(`export type ${interfaceName} = `);
  generator.pushScope({ typeName: interfaceName });
  if (noBrackets) {
    generator.withinBlock(closure, '', '');
  } else {
    generator.withinBlock(closure, '{', '}');
  }
  generator.popScope();
  generator.print(';');
}

export function propertyDeclaration(generator: CodeGenerator, {
  fieldName,
  type,
  propertyName,
  typeName,
  description,
  isInput,
  isArray,
  isNullable,
  isArrayElementNullable
}: Property, closure?: () => void) {
  const name = fieldName || propertyName;

  if (description) {
    description.split('\n')
      .forEach(line => {
        generator.printOnNewline(`// ${line.trim()}`);
      })
  }

  if (closure) {
    generator.printOnNewline(name);

    if (isNullable && isInput) {
      generator.print('?');
    }
    generator.print(': ');

    if (isArray) {
      generator.print(' Array<');
    }
    generator.pushScope({ typeName: name });

    generator.withinBlock(closure);

    generator.popScope();

    if (isArray) {
      if (isArrayElementNullable) {
        generator.print(' | null');
      }
      generator.print(' >');
    }

    if (isNullable) {
      generator.print(' | null');
    }

  } else {
    generator.printOnNewline(name);
    if (isInput && isNullable) {
      generator.print('?')
    }
    const typeString = `: ${typeName || type && typeNameFromGraphQLType(generator.context, type)}`;
    generator.print(typeString);
    // For query input variables, we do not care to add the `| null` type because
    // the optional operator `?` is a strong enough type.
    //
    // The generated typeNameFromGraphQLType will include `| null` if the GraphQL type
    // for the field is nullable. If the field is not nullable, then the generated
    // typeNameFromGraphQLType will not include `| null`.
    //
    // This becomes problematic for fields that are decoratied with a
    // directive that makes it nullabe (e.g. skip/include).
    // We should treat fields that are not in closures the same as
    // fields that are in closures (above) and add `| null` if the field
    // is flagged as nullable by our client.
    //
    // To avoid duplicate `| null` definitions, we will not add another `| null` if
    // the generated typeNameFromGraphQLType already includes `| null`.
    if (!isInput && isNullable && !typeString.endsWith("| null")) {
      generator.print(' | null');
    }
  }
  generator.print(',');
}

export function propertySetsDeclaration(generator: CodeGenerator, property: Property, propertySets: Property[][], standalone = false) {
  const {
    description, fieldName, propertyName,
    isNullable, isArray, isArrayElementNullable,
  } = property;
  const name = fieldName || propertyName;

  if (description) {
    description.split('\n')
      .forEach(line => {
        generator.printOnNewline(`// ${line.trim()}`);
      })
  }

  if (!standalone) {
    generator.printOnNewline(`${name}: `);
  }

  if (isArray) {
    generator.print(' Array<');
  }

  generator.pushScope({ typeName: name });

  generator.withinBlock(() => {
    propertySets.forEach((propertySet, index, propertySets) => {
      generator.withinBlock(() => {
        propertyDeclarations(generator, propertySet);
      });
      if (index !== propertySets.length - 1) {
        generator.print(' |');
      }
    })
  }, '(', ')');

  generator.popScope();

  if (isArray) {
    if (isArrayElementNullable) {
      generator.print(' | null');
    }
    generator.print(' >');
  }

  if (isNullable) {
    generator.print(' | null');
  }

  if (!standalone) {
    generator.print(',');
  }
}
