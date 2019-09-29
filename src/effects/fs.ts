import { URIS2, Kind2 } from "fp-ts/lib/HKT";
import { taskify, taskEither, chain, fromEither, map } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as fs from "fs";
import { tryJSONStringify } from "../util";

export type PackageJSON = Record<string, string>;

export interface FileSystem<F extends URIS2> {
  mkDir: (path: string) => Kind2<F, Error, unknown>;
  readDir: (ptah: string) => Kind2<F, Error, string[]>
  readFile: (path: string) => Kind2<F, Error, Buffer>;
  writeFile: (...args: Parameters<typeof writeFile>) => Kind2<F, Error, unknown>;
  writeJSON: (filepath: string, o: unknown) => Kind2<F, Error, string>;
}

const readDir = taskify<fs.PathLike, NodeJS.ErrnoException, string[]>(
  fs.readdir
);
const readFile = taskify(fs.readFile);
const writeFile = taskify(fs.writeFile);
const mkDir = taskify(fs.mkdir);
const mkDirSafe = (path: string) =>
  pipe(
    taskEither.fromIO<NodeJS.ErrnoException, boolean>(() =>
      fs.existsSync(path)
    ),
    chain(exists =>
      exists ? taskEither.of(path) : taskEither.map(mkDir(path), () => path)
    )
  );

  
export const writeJSON = (filepath: string, o: unknown) =>
pipe(
  fromEither(tryJSONStringify(o)),
  chain(json => writeFile(filepath + ".json", unescape(json))),
  map(() => filepath)
);

export const fileSystemTE: FileSystem<"TaskEither"> = {
  mkDir: mkDirSafe, readFile, writeFile, readDir, writeJSON
}
  