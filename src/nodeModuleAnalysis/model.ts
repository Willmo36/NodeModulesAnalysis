import { getMonoid as getMonoidArray } from "fp-ts/lib/Array";
import { Monoid } from "fp-ts/lib/Monoid";
import { getMonoid as getMonoidRecord } from "fp-ts/lib/Record";

export type NodeModuleAnalysis = Record<string, Record<string, string[]>>;

const FAILURE_KEY = "!.FAILURES";

export const nodeModuleAnalysisMonoid: Monoid<
  NodeModuleAnalysis
> = getMonoidRecord(getMonoidRecord(getMonoidArray()));

export const failedNodeModuleAnalysis = (
  path: string,
  err: NodeJS.ErrnoException
): NodeModuleAnalysis => ({ [FAILURE_KEY]: { [path]: [err.message] } });
