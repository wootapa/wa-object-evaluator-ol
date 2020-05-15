import { BuilderCore as Builder } from './core/wa-builder-core';
import { IJsonDump, IRuntimeOperatorCallback } from './core/wa-contracts';

const and = () => Builder.and();
const or = () => Builder.or();
const not = () => Builder.not();
const fromJson = (json: IJsonDump | string) => Builder.fromJson(json);
const define = (alias: string, func: IRuntimeOperatorCallback) => Builder.define(alias, func);

export { and, or, not, fromJson, define };