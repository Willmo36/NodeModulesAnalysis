import { sequenceT } from "fp-ts/lib/Apply";
import { array } from "fp-ts/lib/Array";
import { tryCatch } from "fp-ts/lib/Either";
import { IO } from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/pipeable";
import {
  chain,
  fromEither,
  map,
  mapLeft,
  taskEither,
  taskify
} from "fp-ts/lib/TaskEither";
import * as fs from "fs";

export type PackageJSON = Record<string, string>;

export const readDir = taskify<fs.PathLike, NodeJS.ErrnoException, string[]>(
  fs.readdir
);
export const readFile = taskify(fs.readFile);
export const writeFile = taskify(fs.writeFile);
export const mkDir = taskify(fs.mkdir);
export const mkDirSafe = (path: string) =>
  pipe(
    taskEither.fromIO<NodeJS.ErrnoException, boolean>(() =>
      fs.existsSync(path)
    ),
    chain(exists =>
      exists ? taskEither.of(path) : taskEither.map(mkDir(path), () => path)
    )
  );

export const tryParseJSON = (s: string) =>
  tryCatch<Error, PackageJSON>(() => JSON.parse(s), err => err as Error);
export const tryJSONStringify = (o: unknown) =>
  tryCatch(() => JSON.stringify(o, null, 4), err => err as Error);

export const combineTasks = array.sequence(taskEither);
export const concurrently = sequenceT(taskEither);

export const isUndefined = <T>(t: T | undefined): t is undefined =>
  typeof t === "undefined";
export const isNotUndefined = <T>(t: T | undefined): t is T => !isUndefined(t);

export const getCurrentTime: IO<number> = () => Date.now();
export const getCurrentTimeSafe = pipe(
  taskEither.fromIO(getCurrentTime),
  mapLeft<unknown, Error>(() => ({
    name: "getCurrentTime exception",
    message: "Something went wrong with getCurrentTime"
  }))
);
