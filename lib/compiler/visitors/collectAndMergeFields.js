"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collectAndMergeFields(selectionSet, mergeInFragmentSpreads = true) {
    const fieldMap = new Map();
    function visitSelectionSet(selections, possibleTypes, conditions = []) {
        if (possibleTypes.length < 1)
            return;
        for (const selection of selections) {
            switch (selection.kind) {
                case 'Field':
                    const field = selection;
                    const existingField = fieldMap.get(field.responseKey);
                    if (existingField) {
                        existingField.isConditional = existingField.isConditional && conditions.length > 0;
                        if (existingField.conditions && conditions.length > 0) {
                            existingField.conditions = [...existingField.conditions, ...conditions];
                        }
                        if (field.selectionSet && existingField.selectionSet) {
                            existingField.selectionSet.selections.push(...wrapInBooleanConditionsIfNeeded(field.selectionSet.selections, conditions));
                        }
                    }
                    else {
                        const clonedField = Object.assign({}, field, { selectionSet: field.selectionSet
                                ? {
                                    possibleTypes: field.selectionSet.possibleTypes,
                                    selections: [
                                        ...wrapInBooleanConditionsIfNeeded(field.selectionSet.selections, conditions)
                                    ]
                                }
                                : undefined });
                        clonedField.isConditional = conditions.length > 0;
                        fieldMap.set(field.responseKey, Object.assign({}, clonedField, { conditions }));
                    }
                    break;
                case 'FragmentSpread':
                case 'TypeCondition':
                    if (selection.kind === 'FragmentSpread' && !mergeInFragmentSpreads)
                        continue;
                    if (!possibleTypes.every(type => selection.selectionSet.possibleTypes.includes(type)))
                        continue;
                    visitSelectionSet(selection.selectionSet.selections, possibleTypes, conditions);
                    break;
                case 'BooleanCondition':
                    visitSelectionSet(selection.selectionSet.selections, possibleTypes, [...conditions, selection]);
                    break;
            }
        }
    }
    visitSelectionSet(selectionSet.selections, selectionSet.possibleTypes);
    if (selectionSet.possibleTypes.length == 1) {
        const type = selectionSet.possibleTypes[0];
        const fieldDefMap = type.getFields();
        for (const [responseKey, field] of fieldMap) {
            const fieldDef = fieldDefMap[field.name];
            if (fieldDef && fieldDef.description) {
                fieldMap.set(responseKey, Object.assign({}, field, { description: fieldDef.description }));
            }
        }
    }
    return Array.from(fieldMap.values());
}
exports.collectAndMergeFields = collectAndMergeFields;
function wrapInBooleanConditionsIfNeeded(selections, conditions) {
    if (!conditions || conditions.length == 0)
        return selections;
    const [condition, ...rest] = conditions;
    return [
        Object.assign({}, condition, { selectionSet: {
                possibleTypes: condition.selectionSet.possibleTypes,
                selections: wrapInBooleanConditionsIfNeeded(selections, rest)
            } })
    ];
}
exports.wrapInBooleanConditionsIfNeeded = wrapInBooleanConditionsIfNeeded;
//# sourceMappingURL=collectAndMergeFields.js.map