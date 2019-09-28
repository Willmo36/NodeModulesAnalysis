import { fold } from "fp-ts/lib/Either";
import { identity } from "fp-ts/lib/function";
import { URIS2 } from "fp-ts/lib/HKT";
import { pipe } from "fp-ts/lib/pipeable";
import { bimap, chain, concurrently, mkTimestampedFilePath, Program } from "./effects";
import { nodeModuleAnalysis } from "./nodeModuleAnalysis";
import { programTE } from "./programTE";


export function main(dir: string, out: string) {
  const program = mkProgram(programTE);

  program(dir, out)()
    .then(fold(identity, identity))
    .then(res => {
      console.log(res);
    });
}

const mkProgram = <M extends URIS2>(M: Program<M>) => (
  dir: string,
  out: string
) => {
  const tasks = concurrently(M)(
    nodeModuleAnalysis(M)(dir),
    mkTimestampedFilePath(M)(out)
  );

  return pipe(
    tasks,
    chain(M)(([analysis, filepath]) => M.writeJSON(filepath, analysis)),
    bimap(M)(
      err => `Something went wrong: ${JSON.stringify(err)}`,
      filepath => "Reports written to " + filepath
    )
  );
};
