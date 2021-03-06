# Development Mode

The biggest chunk of the code base is an implementation of different features and runtime checks for Development Mode.
All Development Mode features are carefully implemented to make sure that everything will be removed from
production build.

## Configuration

### Flags

There is a set of different flags that are used to configure Development Mode. `setDevModeFlags` function is used to
assign this flags.

```ts
const enum DevModeFlags {
  DisableNestingValidation = 1,
  DisableStackTraceAugmentation = 1 << 1,
  DisableCheckingForTypos = 1 << 2,
  DisableWarningsForUnsupportedFeatures = 1 << 3,
  EnableComponentPerformanceProfiling = 1 << 4,
}

function setDevModeFlags(flags: DevModeFlags): void;
```

### Query Parameters

Development Mode is also configurable via query parameters. For example, `http://example.com?_perf=true` will
enable component performance profiling.

Full list of query parameters:

```
_nv=false   Disable Nesting Validation.
_st=false   Disable Stack Trace Augmentation.
_typo=false Disable Checking for Typos.
_perf=true  Enable Component Performance Profiling.
```

## Nesting Validation

Some HTML Elements have restrictions on which nodes can be nested, for example `<table>` element can only have
`<tbody>`, `<thead>`, etc as its children. Browsers are handling such cases in a way that they automatically inject
missing elements or close existing elements, to prevent such behaviour we will throw errors in Dev Mode when
HTML nesting rules are violated.

## Stack Trace Augmentation

When syncing algorithm is updating components tree, call stack doesn't have any information about components and
sometimes it is hard to debug when there is no information about components stack. Stack Trace Augmentation adds
additional information about current stack of components.

Here is how it will look like when exception is thrown.

```
Error message
    default stack trace...

Components stack trace:
  [C]BrokenComponent #2
  [F]FunctionalComponentB
  [F]FunctionalComponentA
  [C]Application #1
```

Symbol definitions:

- `[C]` - Stateful Component
- `[F]` - Stateless Component
- `[+]` - Connect
- `[^]` - Update Context
- `[K]` - Keep Alive

`#1` shows a unique id for component instance. When Development Mode is enabled, it is easy to find component
instances by their unique ids with a simple function from the console `ivi.$(id)`.

## Typo Checking

When typo checking is enabled, DOM attribute and styles will be checked for typos. So when you make a typo in attribute
name, like `autoFocus`, it will suggest you to replace it with `autofocus`.

All typos that can be covered with a static analysis in TypeScript won't be checked in runtime. If you don't want to
spend countless hours because of some small typos, consider switching to TypeScript.

## Unsupported Features Warnings

When unsupported features warnings is enabled, warnings will be printed to the console when you try to use some feature
that isn't properly supported by all major browsers.

Obviously we can't cover all features, but in some cases it will save you a huge amount of time when you are aware
about potential problems in other browsers.

## Component Performance Profiling

Component performance profiling will add marks on the dev tools so that you can easily see entire stack of components,
instead of just names of internal functions.

When component performance profiling is enabled, syncing algorithm will work significantly slower, but it is still
very useful because you can look at a relative performance of your components.

## Global API

In Development Mode, parts of the ivi API will be available globally. By default, Dev Mode API is available in global
variable `ivi`.

### Exploring Virtual DOM Trees

Dev Mode API has several functions to explore virtual dom trees:

```ts
function findVNodeByDebugId(debugId: number): VNode<any> | null;
function findVNodeByNode(node: Node): VNode<any> | null;
function $(v?: number | Node): void;
```

`findVNodeByDebugId` finds VNode instance by vnode debug id or component debug id. Component debug ids are displayed in
components stack trace for all stateful instances.

`findVNodeByNode` finds VNode instance that owns DOM node.

`$` is a shortcut that depending on the value type will either find vnode by debug id, find vnode by DOM node.
And when it finds vnode, it will display component tree starting from this vnode to the console.

### Changing global variable

Global variable can be dynamically changed via query parameter `_export=<name>`.

```
http://127.0.0.1/?_export=devMode
```
