import * as path from "path";
import { FileSystem } from "./fs";
import { JSON } from "./json";
import { Time } from "./time";
import { URIS2, Kind2 } from "fp-ts/lib/HKT";
import { Monad2 } from "fp-ts/lib/Monad";
import { Alt2C, Alt2 } from "fp-ts/lib/Alt";
import { MonadError2 } from "../MonadError";
import { array } from "fp-ts/lib/Array";
import { sequenceT } from "fp-ts/lib/Apply";
import { Bifunctor2 } from "fp-ts/lib/Bifunctor";
import { pipe } from "fp-ts/lib/pipeable";

export type Program<M extends URIS2> = Monad2<M> &
  MonadError2<M, Error> &
  Alt2<M> &
  Bifunctor2<M> &
  FileSystem<M> &
  JSON<M> &
  Time<M>;

export const map = <M extends URIS2>(M: Program<M>) => <A, B>(
  f: (a: A) => B
) => (ma: Kind2<M, Error, A>) => M.map(ma, f);

export const chain = <M extends URIS2>(M: Program<M>) => <A, B>(
  f: (a: A) => Kind2<M, Error, B>
) => (ma: Kind2<M, Error, A>) => M.chain(ma, f);

export const alt = <M extends URIS2>(M: Program<M>) => <A>(
  f: () => Kind2<M, Error, A> 
) => (ma: Kind2<M, Error, A>) => M.alt(ma, f);

export const bimap = <M extends URIS2>(M: Program<M>) => <A,B>(
  f: (e: Error) => B, g: (a:A) => B
) => (ma: Kind2<M, Error, A>) => M.bimap(ma, f, g);

export const catchError = <M extends URIS2>(M: Program<M>) => <A>(
  f: (err: Error) => Kind2<M, Error, A> 
) => (ma: Kind2<M, Error, A>) => M.catchError(ma, f);

export const sequence = <M extends URIS2>(M: Program<M>) => 
  <A>(ms: Kind2<M, Error, A>[]): Kind2<M, Error, A[]> =>
  array.sequence(M)(ms)

export const concurrently = <M extends URIS2>(M: Program<M>) => sequenceT(M);


//todo move to defaulted cli option
const OUTPUT_FILE_NAME = "node-modules-analysis";
export const mkTimestampedFilePath = <M extends URIS2>(M: Program<M>) => (
  outPath: string
) =>
  pipe(
    M.getCurrentTime,
    map(M)(ts => path.join(outPath, `${OUTPUT_FILE_NAME}-${ts}`))
  );