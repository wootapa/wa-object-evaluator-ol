import { BuilderOl as Builder } from './ol/wa-builder-ol';
import { IJsonDump } from './core/wa-contracts';

const and = () => Builder.and();
const or = () => Builder.or();
const not = () => Builder.not();
const fromJson = (json: IJsonDump) => Builder.fromJson(json);

export { and, or, not, fromJson };
export default and;
