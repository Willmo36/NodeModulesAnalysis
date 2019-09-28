import { PackageJSON } from "../util";
import { tryCatch } from "fp-ts/lib/Either";
import { fromEither } from "fp-ts/lib/TaskEither";
import { URIS2, Kind2 } from "fp-ts/lib/HKT";

export interface JSON<F extends URIS2> {
  parse: (s: string) => Kind2<F, Error, PackageJSON>;
  stringify: (o: unknown) => Kind2<F, Error, string>;
}

const tryParseJSON = (s: string) =>
  fromEither(tryCatch<Error, PackageJSON>(() => JSON.parse(s), err => err as Error));

const tryJSONStringify = (o: unknown) =>
  fromEither(tryCatch(() => JSON.stringify(o), err => err as Error));

export const jsonTE: JSON<"TaskEither"> = {
  parse: tryParseJSON,
  stringify: tryJSONStringify
}