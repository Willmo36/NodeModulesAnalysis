import { MonadThrow2 } from "fp-ts/lib/MonadThrow";
import { URIS2, Kind2 } from "fp-ts/lib/HKT";

export interface MonadError2<M extends URIS2, E> extends MonadThrow2<M> {
  catchError: <A>(ma: Kind2<M, E, A>, f: (e: E) => Kind2<M, E, A>) => Kind2<M, E, A>
}