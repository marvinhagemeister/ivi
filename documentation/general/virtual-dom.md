# Virtual DOM

Virtual DOM API is using method chaining to set properties.

For example, to assign an event and id attribute on a div element:

```ts
const node = h.div()
  .events(Events.onClick((ev) => { console.log("click"); }))
  .props({ id: "unique-id" });
```

## Chained Methods

### All Nodes

```ts
interface VNode<P> {
  key(key: any): VNode<P>;
}
```

`key` property is used to uniquely identify Virtual Node among its siblings. It is used by children syncing algorithm to
find how to rearrange nodes when they are moved, removed or inserted.

### HTML, SVG, Input and Media elements

```ts
interface VNode<P> {
  props(props: P): VNode<P>;
  style(style: CSSStyleProps | null): VNode<P>;
  events(events: Array<EventHandler | null> | EventHandler | null): VNode<P>;
  mergeProps<U extends P>(props: P): VNode<P>;
  mergeStyle<U extends CSSStyleProps>(style: U | null): VNode<P>;
}
```

### HTML and SVG elements (nodes that can contain children nodes)

```ts
interface VNode<P> {
  children(...children: Array<IVNode<any>[] | IVNode<any> | string | number | null>): VNode<P>;
  unsafeHTML(html: string): VNode<P>
}
```

#### Children

Children method is a variadic method and accepts variable number of children. Children can be any basic object like
string or number, VNode or an array of VNodes.

Each non-nested child that doesn't have assigned explicit key will be assigned with positional key. Positional keys are
used to support code patterns like this:

```ts
h.div().children(
  isVisible ? componentA() : null,
  componentB(),
);
```

When `ComponentA` goes from visible to invisible state and removed from the list, `ComponentB` won't be destroyed and
reinstantiated because it has the same implicit positional key.

#### unsafeHTML

`unsafeHTML` is used to specify `innerHTML`, it is named unsafe because it doesn't provide any XSS protection, HTML
string specified in `html` parameter will be directly injected into the element.

### Input Elements

Input Value and Checked properties.

```ts
interface VNode<P> {
  value(value: string | null): VNode<P>;
  checked(checked: boolean | null): VNode<P>;
}
```

### Focusable Elements

```ts
interface VNode<P> {
  autofocus(focus: boolean): VNode<P>;
}
```

Autofocused elements will receive a focus when element is instantiated.

## Rendering and Augmentation

Render Virtual DOM into container.

```ts
function render<T extends Node>(
  node: VNode<any> | null,
  container: Element,
  syncFlags?: SyncFlags,
): void;
```

Render Virtual DOM into container asynchronously. This function will update DOM tree once per animation frame, even
when it is invoked multiple times per frame.

```ts
function renderNextFrame(
  node: VNode<any> | null,
  container: Element,
  syncFlags?: SyncFlags,
): void;
```

Update dirty components.

```ts
function update(syncFlags?: SyncFlags);
function updateNextFrame(syncFlags?: SyncFlags);
```

Augment existing DOM tree with a Virtual DOM.

```ts
function augment(
  node: VNode<any> | null,
  container: Element,
): void;
```