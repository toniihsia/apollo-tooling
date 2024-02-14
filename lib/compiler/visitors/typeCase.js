"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCase = exports.Variant = void 0;
const util_1 = require("util");
const collectAndMergeFields_1 = require("./collectAndMergeFields");
class Variant {
    possibleTypes;
    selections;
    fragmentSpreads;
    constructor(possibleTypes, selections = [], fragmentSpreads = []) {
        this.possibleTypes = possibleTypes;
        this.selections = selections;
        this.fragmentSpreads = fragmentSpreads;
    }
    inspect() {
        return `${(0, util_1.inspect)(this.possibleTypes)} -> ${(0, util_1.inspect)((0, collectAndMergeFields_1.collectAndMergeFields)(this, false).map(field => field.responseKey))}\n`;
    }
}
exports.Variant = Variant;
class TypeCase {
    mergeInFragmentSpreads;
    default;
    variantsByType;
    get variants() {
        return Array.from(new Set(this.variantsByType.values()));
    }
    get remainder() {
        if (this.default.possibleTypes.some(type => !this.variantsByType.has(type))) {
            return new Variant(this.default.possibleTypes.filter(type => !this.variantsByType.has(type)), this.default.selections, this.default.fragmentSpreads);
        }
        else {
            return undefined;
        }
    }
    get exhaustiveVariants() {
        const remainder = this.remainder;
        if (remainder) {
            return [...this.variants, remainder];
        }
        else {
            return this.variants;
        }
    }
    constructor(selectionSet, mergeInFragmentSpreads = true) {
        this.mergeInFragmentSpreads = mergeInFragmentSpreads;
        this.default = new Variant(selectionSet.possibleTypes);
        this.variantsByType = new Map();
        this.visitSelectionSet(selectionSet.selections, selectionSet.possibleTypes);
    }
    visitSelectionSet(selections, possibleTypes, conditions = []) {
        if (possibleTypes.length < 1)
            return;
        for (const selection of selections) {
            switch (selection.kind) {
                case 'Field':
                    for (const variant of this.variantsFor(possibleTypes)) {
                        variant.selections.push(...(0, collectAndMergeFields_1.wrapInBooleanConditionsIfNeeded)([selection], conditions));
                    }
                    break;
                case 'FragmentSpread':
                    for (const variant of this.variantsFor(possibleTypes)) {
                        variant.fragmentSpreads.push(selection);
                        if (!this.mergeInFragmentSpreads) {
                            variant.selections.push(...(0, collectAndMergeFields_1.wrapInBooleanConditionsIfNeeded)([selection], conditions));
                        }
                    }
                    if (this.mergeInFragmentSpreads) {
                        this.visitSelectionSet(selection.selectionSet.selections, possibleTypes.filter(type => selection.selectionSet.possibleTypes.includes(type)), conditions);
                    }
                    break;
                case 'TypeCondition':
                    this.visitSelectionSet(selection.selectionSet.selections, possibleTypes.filter(type => selection.selectionSet.possibleTypes.includes(type)), conditions);
                    break;
                case 'BooleanCondition':
                    this.visitSelectionSet(selection.selectionSet.selections, possibleTypes, [...conditions, selection]);
                    break;
            }
        }
    }
    variantsFor(possibleTypes) {
        const variants = [];
        const matchesDefault = this.default.possibleTypes.every(type => possibleTypes.includes(type));
        if (matchesDefault) {
            variants.push(this.default);
        }
        const splits = new Map();
        for (const type of possibleTypes) {
            let original = this.variantsByType.get(type);
            if (!original) {
                if (matchesDefault)
                    continue;
                original = this.default;
            }
            let split = splits.get(original);
            if (!split) {
                split = new Variant([], [...original.selections], [...original.fragmentSpreads]);
                splits.set(original, split);
                variants.push(split);
            }
            if (original !== this.default) {
                original.possibleTypes.splice(original.possibleTypes.indexOf(type), 1);
            }
            this.variantsByType.set(type, split);
            split.possibleTypes.push(type);
        }
        return variants;
    }
    inspect() {
        return (`TypeCase\n` +
            `  default -> ${(0, util_1.inspect)(this.default)}\n` +
            this.variants.map(variant => `  ${(0, util_1.inspect)(variant)}\n`).join(''));
    }
}
exports.TypeCase = TypeCase;
//# sourceMappingURL=typeCase.js.map