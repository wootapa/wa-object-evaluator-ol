import { ProjectionLike } from 'ol/proj';
import { IJsonDump, IRuntimeOperatorCallback } from './core/wa-contracts';
import { BuilderOl as Builder } from './ol/wa-builder-ol';

const and = (): Builder => Builder.and();
const or = (): Builder => Builder.or();
const not = (): Builder => Builder.not();
const fromJson = (json: IJsonDump | string): Builder => Builder.fromJson(json);
const define = (alias: string, func: IRuntimeOperatorCallback): void => Builder.define(alias, func);
const defaultProjection = (projection: ProjectionLike): void => Builder.defaultProjection(projection);

export { and, or, not, fromJson, define, defaultProjection };
