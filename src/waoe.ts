import { EvaluatorCore as Evaluator } from './core/wa-evaluator';
import { IJsonDump, IRuntimeOperatorCallback } from './core/wa-contracts';

const and = (): Evaluator => Evaluator.and();
const or = (): Evaluator => Evaluator.or();
const not = (): Evaluator => Evaluator.not();
const fromJson = (json: IJsonDump | string): Evaluator => Evaluator.fromJson(json);
const define = (alias: string, func: IRuntimeOperatorCallback): void => Evaluator.define(alias, func);
const getOperatorAlias = (): string[] => Evaluator.getOperatorAlias();

export { Evaluator, and, or, not, fromJson, define, getOperatorAlias };
