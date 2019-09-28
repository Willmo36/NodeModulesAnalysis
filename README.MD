# NodeModuleAnalysis

Lists all the instances of a package by version under a given directory. Useful for investigating sources of multiple versions in an output bundle, or colliding TypeScript types.

This project is *not* yet on NPM, follow the build instructions below.

# Example output

```
> cd myproject && dependency-analysis
> cat .dependency-analysis-output

"react":  {
	"16.9.0":  [
		"\\node_modules\\react/"
	],
	"16.7.0":  [
		"\\node_modules\\react-localization\\node_modules\\react/"
	]
}
```
# Functional Programming
This project heavily uses `fp-ts` in an attempt to demonstrate and explore relatively-pure functional programming in TypeScript. The chosen design pattern is "Layer 2" of the [Three Layer Haskell Cake]( https://www.parsonsmatt.org/2018/03/22/three_layer_haskell_cake.html). Our "Application Monad" (called `Program` in our case) can be found [here](src/effects/index.ts).

# Building

 1. Git clone
 2. `yarn && yarn build`
 3. `yarn link` to have executable globally available
