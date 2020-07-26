import { BuilderCore as Builder } from './core/wa-builder-core';
import { IJsonDump, IRuntimeOperatorCallback } from './core/wa-contracts';

const and = (): Builder => Builder.and();
const or = (): Builder => Builder.or();
const not = (): Builder => Builder.not();
const fromJson = (json: IJsonDump | string): Builder => Builder.fromJson(json);
const define = (alias: string, func: IRuntimeOperatorCallback): void => Builder.define(alias, func);

export { and, or, not, fromJson, define };
