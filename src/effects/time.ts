import { IO } from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/pipeable";
import { taskEither, mapLeft } from "fp-ts/lib/TaskEither";
import { URIS2, Kind2 } from "fp-ts/lib/HKT";

export interface Time<M extends URIS2>{
  getCurrentTime: Kind2<M, Error, number>;
}

const getCurrentTime: IO<number> = () => Date.now();
const getCurrentTimeTE = pipe(
  taskEither.fromIO(getCurrentTime),
  mapLeft<unknown, Error>(() => ({
    name: "getCurrentTime exception",
    message: "Something went wrong with getCurrentTime"
  }))
);

export const timeTE: Time<"TaskEither"> = {
  getCurrentTime: getCurrentTimeTE
}
