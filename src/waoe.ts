import { BuilderCore as Builder } from './core/wa-builder-core';
import { IJsonDump } from './core/wa-contracts';

const and = () => Builder.and();
const or = () => Builder.or();
const not = () => Builder.not();
const fromJson = (json: IJsonDump) => Builder.fromJson(json);

export { and, or, not, fromJson };