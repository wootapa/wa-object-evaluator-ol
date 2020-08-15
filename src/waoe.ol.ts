import { EvaluatorOl as Evaluator } from './ol/wa-evaluator';
import { IJsonDump, IRuntimeOperatorCallback } from './core/wa-contracts';
import { ProjectionLike } from 'ol/proj';

const and = (): Evaluator => Evaluator.and();
const or = (): Evaluator => Evaluator.or();
const not = (): Evaluator => Evaluator.not();
const fromJson = (json: IJsonDump | string): Evaluator => Evaluator.fromJson(json);
const define = (alias: string, func: IRuntimeOperatorCallback): void => Evaluator.define(alias, func);
const getOperatorAlias = (): string[] => Evaluator.getOperatorAlias();
const defaultProjection = (projection: ProjectionLike): void => Evaluator.defaultProjection(projection);

export { Evaluator, and, or, not, fromJson, define, getOperatorAlias, defaultProjection };
