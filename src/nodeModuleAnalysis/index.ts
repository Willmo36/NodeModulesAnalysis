import { array, reduce } from "fp-ts/lib/Array";
import { Kind2, URIS2 } from "fp-ts/lib/HKT";
import { pipe } from "fp-ts/lib/pipeable";
import * as path from "path";
import { alt, catchError, chain, map, Program } from "../effects";
import { PackageJSON } from "../util";
import {
  failedNodeModuleAnalysis,
  NodeModuleAnalysis,
  nodeModuleAnalysisMonoid
} from "./model";

const NODE_MODULES_PATH = "node_modules/";
const PACKAGE_JSON_PATH = "package.json";

/**
 * Collect the names and versions of packages
 * By attempting to read package.json
 * Then recursively calling for sub packages
 */
export const nodeModuleAnalysis = <M extends URIS2>(M: Program<M>) => (
  dirPath: string
): Kind2<M, NodeJS.ErrnoException, NodeModuleAnalysis> =>
  pipe(
    M.readFile(path.join(dirPath, PACKAGE_JSON_PATH)),
    chain(M)(packagejsonBuffer => {
      return M.parse(packagejsonBuffer.toString());
    }),
    map(M)<PackageJSON, NodeModuleAnalysis>(packagejson => {
      const name = packagejson["name"] || "unknown_module";
      const version = packagejson["version"] || "unknown_version";
      return { [name]: { [version]: [dirPath] } };
    }),
    alt(M)(() => M.of(nodeModuleAnalysisMonoid.empty)),
    chain(M)(da =>
      //no package.json implies no node_modules, just look at child dirs
      da === nodeModuleAnalysisMonoid.empty
        ? analyseSubDirs(M)(dirPath)
        : pipe(
            analyseSubDirs(M)(path.join(dirPath, NODE_MODULES_PATH)),
            map(M)(dda => nodeModuleAnalysisMonoid.concat(da, dda))
          )
    ),
    catchError(M)(err => M.of(failedNodeModuleAnalysis(dirPath, err)))
  );

/**
 * Run the nodeModuleAnalysis for all sub dirs
 * Merging the results
 */
const analyseSubDirs = <M extends URIS2>(M: Program<M>) => (
  dirPath: string
): Kind2<M, NodeJS.ErrnoException, NodeModuleAnalysis> =>
  pipe(
    M.readDir(dirPath),
    chain(M)(dirs => {
      const dirAnalysisTasks = dirs
        .map(dir => `${dirPath}${dir}/`)
        .map(nodeModuleAnalysis(M));

      return pipe(
        array.sequence(M)(dirAnalysisTasks),
        map(M)(
          reduce(
            nodeModuleAnalysisMonoid.empty,
            nodeModuleAnalysisMonoid.concat
          )
        )
      );
    }),
    alt(M)(() => M.of(nodeModuleAnalysisMonoid.empty))
  );
