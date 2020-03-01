import { ILogical, LogicalAnd, LogicalOr, LogicalNot, Logical } from "./wa-logical";
import { IEvaluatable, IValueGetter, ObjectOrDict, IParent, ExportedBuilder } from "./wa-contracts";

interface IBuilder { }
export abstract class BuilderBase implements IBuilder, IParent, IEvaluatable, ILogical {
    protected _logical = new LogicalAnd(this);

    static create<U = IBuilder>(this: { new(): U }) {
        return new this();
    }

    protected _add(evaluatable: IEvaluatable) {
        return this._logical.add(evaluatable);
    }

    evaluate(object: ObjectOrDict, getter?: IValueGetter): boolean {
        return this._logical.evaluate(object, getter);
    };
    clear(): IBuilder {
        this._logical = new LogicalAnd(this);
        return this;
    };
    done(): ExportedBuilder {
        while (!(this._logical.getParent() instanceof BuilderBase)) {
            this.up();
        }
        return this as unknown as ExportedBuilder;;
    };

    // Logical
    and(): ExportedBuilder {
        this._logical = this._logical.add(new LogicalAnd(this._logical)) as Logical;
        return this as unknown as ExportedBuilder;
    };
    or(): ExportedBuilder {
        this._logical = this._logical.add(new LogicalOr(this._logical)) as Logical;
        return this as unknown as ExportedBuilder;
    };
    not(): ExportedBuilder {
        this._logical = this._logical.add(new LogicalNot(this._logical)) as Logical;
        return this as unknown as ExportedBuilder;
    };
    up(): ExportedBuilder {
        if (this._logical.getParent() instanceof BuilderBase) {
            return this as unknown as ExportedBuilder;
        }
        this._logical = this._logical.getParent() as LogicalAnd;
        return this as unknown as ExportedBuilder;
    };
}