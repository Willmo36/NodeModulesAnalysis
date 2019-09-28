import { Program } from "./effects";
import { taskEither, orElse, fromEither } from "fp-ts/lib/TaskEither";
import { fileSystemTE } from "./effects/fs";
import { jsonTE } from "./effects/json";
import { timeTE } from "./effects/time";
import { left } from "fp-ts/lib/Either";

export const programTE: Program<"TaskEither"> = {
  ...taskEither,
  ...fileSystemTE,
  ...jsonTE,
  ...timeTE,

  throwError: e => fromEither(left(e)),
  catchError: (ma, f) => orElse(f)(ma),
}   