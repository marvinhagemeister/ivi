/* tslint:disable:no-unused-expression */
(global as any).__IVI_BROWSER__ = false;
(global as any).__IVI_DEV__ = true;

import { BlueprintNode, createBlueprint } from "../src/blueprint";
import { VNodeFlags } from "../src/vnode";
import { context } from "../src/vnode_factories";
import { ComponentClass, StatelessComponent } from "../src/component";
import * as h from "./utils/html";
import * as c from "./utils/components";
import { expect } from "chai";

class BlueprintObserver {
  node: BlueprintNode;
  parent: BlueprintNode | undefined;
  childrenIndex: number;

  constructor(node: BlueprintNode, parent?: BlueprintNode, childrenIndex = -1) {
    this.node = node;
    this.parent = parent;
    this.childrenIndex = childrenIndex;
  }

  firstChild() {
    if (this.node.children !== null) {
      if (Array.isArray(this.node.children)) {
        return new BlueprintObserver(this.node.children[0], this.node, 0);
      } else if (typeof this.node.children !== "string") {
        return new BlueprintObserver(this.node.children as BlueprintNode, this.node);
      }
    }

    throw Error("Blueprint doesn't have any children.");
  }

  nextSibling() {
    if (this.childrenIndex > -1) {
      const nextIndex = this.childrenIndex + 1;
      return new BlueprintObserver(
        (this.parent!.children as BlueprintNode[])[nextIndex],
        this.parent,
        nextIndex,
      );
    }

    throw new Error("Blueprint node doesn't have next sibling.");
  }

  expectNoDeepConnect() {
    expect((this.node.flags & VNodeFlags.DeepConnect) !== 0).to.be.false;
    return this;
  }

  expectDeepConnect() {
    expect((this.node.flags & VNodeFlags.DeepConnect) !== 0).to.be.true;
    return this;
  }

  expectNoChildren() {
    expect(this.node.children).to.be.null;
    return this;
  }

  expectString(s: string) {
    expect(this.node.string).to.be.equal(s);
    return this;
  }

  expectText(content: string) {
    expect((this.node.flags & VNodeFlags.Text) !== 0).to.be.true;
    expect(this.node.vnode._children).to.be.equal(content);
    return this;
  }

  expectElement(tag: string) {
    expect((this.node.flags & VNodeFlags.Element) !== 0).to.be.true;
    expect((this.node.vnode._tag as string).slice(1)).to.be.equal(tag);
    return this;
  }

  expectComponent(cls: ComponentClass<any>) {
    expect((this.node.flags & VNodeFlags.ComponentClass) !== 0).to.be.true;
    expect(this.node.vnode._tag).to.be.equal(cls);
    return this;
  }

  expectStatelessComponent(fn: StatelessComponent<any>) {
    expect((this.node.flags & VNodeFlags.ComponentFunction) !== 0).to.be.true;
    expect(this.node.vnode._tag).to.be.equal(fn);
    return this;
  }

  expectConnect() {
    expect((this.node.flags & VNodeFlags.Connect) !== 0).to.be.true;
    return this;
  }

  expectUpdateContext() {
    expect((this.node.flags & VNodeFlags.UpdateContext) !== 0).to.be.true;
    return this;
  }
}

function observeBlueprint(node: BlueprintNode) {
  return new BlueprintObserver(node);
}

function _createBlueprintIndex(index: Set<BlueprintNode>, node: BlueprintNode) {
  index.add(node);
  if (node.children !== null) {
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        _createBlueprintIndex(index, child);
      }
    } else if (typeof node.children !== "string") {
      _createBlueprintIndex(index, node.children as BlueprintNode);
    }
  }
}

function createBlueprintIndex(node: BlueprintNode) {
  const index = new Set<BlueprintNode>();
  _createBlueprintIndex(index, node);
  return index;
}

describe("blueprint", () => {
  describe("create", () => {
    it(`abc`, () => {
      observeBlueprint(createBlueprint(h.t("abc")))
        .expectText("abc")
        .expectString(`abc`);
    });

    it(`<div>`, () => {
      observeBlueprint(createBlueprint(h.div()))
        .expectElement("div")
        .expectString(`<div>`);
    });

    it(`<div class="abc">`, () => {
      observeBlueprint(createBlueprint(h.div("abc")))
        .expectElement("div")
        .expectString(`<div class="abc">`);
    });

    it(`<div id="123">`, () => {
      observeBlueprint(createBlueprint(h.div().props({
        id: "123",
      })))
        .expectElement("div")
        .expectString(`<div id="123">`);
    });

    it(`<div id="123" title="qwe">`, () => {
      observeBlueprint(createBlueprint(h.div().props({
        id: "123",
        title: "qwe",
      })))
        .expectElement("div")
        .expectString(`<div id="123" title="qwe">`);
    });

    it(`<div class="abc" id="123">`, () => {
      observeBlueprint(createBlueprint(h.div("abc").props({
        id: "123",
      })))
        .expectElement("div")
        .expectString(`<div class="abc" id="123">`);
    });

    it(`<div style="color:green">`, () => {
      observeBlueprint(createBlueprint(h.div().style({
        color: "green",
      })))
        .expectElement("div")
        .expectString(`<div style="color:green">`);
    });

    it(`<div style="color:green;font-size:1">`, () => {
      observeBlueprint(createBlueprint(h.div().style({
        color: "green",
        "font-size": 1,
      })))
        .expectElement("div")
        .expectString(`<div style="color:green;font-size:1">`);
    });

    it(`<div class="abc" style="color:green">`, () => {
      observeBlueprint(createBlueprint(h.div("abc").style({
        color: "green",
      })))
        .expectElement("div")
        .expectString(`<div class="abc" style="color:green">`);
    });

    it(`<div id="123" style="color:green">`, () => {
      observeBlueprint(createBlueprint(h.div().props({
        id: "123",
      }).style({
        color: "green",
      })))
        .expectElement("div")
        .expectString(`<div id="123" style="color:green">`);
    });

    it(`<div class="abc" id="123" style="color:green">`, () => {
      observeBlueprint(createBlueprint(h.div("abc").props({
        id: "123",
      }).style({
        color: "green",
      })))
        .expectElement("div")
        .expectString(`<div class="abc" id="123" style="color:green">`);
    });

    it(`<C><div><C>`, () => {
      observeBlueprint(createBlueprint(c.rc(h.div())))
        .expectComponent(c.RenderChild)
        .expectString(`<div></div>`);
    });

    it(`<C><C><div></C><C>`, () => {
      const a = observeBlueprint(createBlueprint(c.rc(c.rc(h.div()))))
        .expectComponent(c.RenderChild)
        .expectString(`<div></div>`);

      a.firstChild()
        .expectString(`<div></div>`);
    });

    it(`<C><div><C><span></C></div><C>`, () => {
      const a = observeBlueprint(createBlueprint(c.rc(h.div().children(c.rc(h.span())))))
        .expectComponent(c.RenderChild)
        .expectString(`<div><span></span></div>`);

      a.firstChild()
        .firstChild()
        .expectString(`<span></span>`);
    });

    it(`<SC><div><SC>`, () => {
      observeBlueprint(createBlueprint(c.src(h.div())))
        .expectStatelessComponent(c.StatelessRenderChild)
        .expectString(`<div></div>`);
    });

    it(`<SC><SC><div></SC><SC>`, () => {
      const a = observeBlueprint(createBlueprint(c.src(c.src(h.div()))))
        .expectStatelessComponent(c.StatelessRenderChild)
        .expectString(`<div></div>`);

      a.firstChild()
        .expectString(`<div></div>`);
    });

    it(`<SC><div><SC><span></SC></div><SC>`, () => {
      const a = observeBlueprint(createBlueprint(c.src(h.div().children(c.src(h.span())))))
        .expectStatelessComponent(c.StatelessRenderChild)
        .expectString(`<div><span></span></div>`);

      a.firstChild()
        .firstChild()
        .expectString(`<span></span>`);
    });

    it(`<ctx><div></ctx>`, () => {
      observeBlueprint(createBlueprint(context({}, h.div())))
        .firstChild()
        .expectString(`<div>`);
    });

    it(`<span><cc></span>`, () => {
      const ctx = { child: h.strong() };
      const a = observeBlueprint(createBlueprint(h.div().children(
        context(ctx, h.span().children(c.cc())),
      )))
        .expectString(`<div>`);

      a
        .firstChild() // context
        .firstChild() // span
        .expectString(`<span>`)
        .firstChild() // connect
        .firstChild() // strong
        .expectString(`<strong>`);
    });

    it(`<span><ccp></span>`, () => {
      const a = observeBlueprint(createBlueprint(h.div().children(
        h.span().children(c.ccp(h.strong())),
      )))
        .expectString(`<div>`);

      a
        .firstChild() // span
        .expectString(`<span>`)
        .firstChild() // connect
        .firstChild() // strong
        .expectString(`<strong>`);
    });
  });

  describe("reuse nodes", () => {
    describe("basics", () => {
      it(`identical`, () => {
        const n = h.div();
        const a = createBlueprint(n);
        const b = createBlueprint(n, undefined, a);
        expect(a).to.be.equal(b);
        observeBlueprint(b)
          .expectNoDeepConnect();
      });

      it(`div`, () => {
        const a = createBlueprint(h.div());
        const b = createBlueprint(h.div(), undefined, a);
        observeBlueprint(b)
          .expectNoDeepConnect();
        expect(a).to.be.equal(b);
      });

      it(`div with same class`, () => {
        const a = createBlueprint(h.div("abc"));
        const b = createBlueprint(h.div("abc"), undefined, a);
        expect(a).to.be.equal(b);
      });

      it(`div with diff class`, () => {
        const a = createBlueprint(h.div("abc"));
        const b = createBlueprint(h.div("def"), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`div with same props`, () => {
        const a = createBlueprint(h.div().props({ a: "123" }));
        const b = createBlueprint(h.div().props({ a: "123" }), undefined, a);
        expect(a).to.be.equal(b);
      });

      it(`div with diff props`, () => {
        const a = createBlueprint(h.div().props({ a: "123" }));
        const b = createBlueprint(h.div().props({ a: "456" }), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`div with same style`, () => {
        const a = createBlueprint(h.div().style({ color: "green" }));
        const b = createBlueprint(h.div().style({ color: "green" }), undefined, a);
        expect(a).to.be.equal(b);
      });

      it(`div with diff style`, () => {
        const a = createBlueprint(h.div().style({ color: "green" }));
        const b = createBlueprint(h.div().style({ color: "red" }), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`div with same class/props diff style`, () => {
        const a = createBlueprint(h.div("abc").props({ a: "123" }).style({ color: "green" }));
        const b = createBlueprint(h.div("abc").props({ a: "123" }).style({ color: "red" }), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`div with same class/style diff props`, () => {
        const a = createBlueprint(h.div("abc").props({ a: "123" }).style({ color: "green" }));
        const b = createBlueprint(h.div("abc").props({ a: "456" }).style({ color: "green" }), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`div with same props/style diff class`, () => {
        const a = createBlueprint(h.div("abc").props({ a: "123" }).style({ color: "green" }));
        const b = createBlueprint(h.div("def").props({ a: "123" }).style({ color: "green" }), undefined, a);
        expect(a).not.to.be.equal(b);
      });

      it(`same children`, () => {
        const a = createBlueprint(h.div().children(h.span()));
        const b = createBlueprint(h.div().children(h.span()), undefined, a);
        expect(a).to.be.equal(b);
        observeBlueprint(b)
          .expectNoDeepConnect();
      });

      it(`same multiple children`, () => {
        const a = createBlueprint(h.div().children(h.span(), h.div(), h.span()));
        const b = createBlueprint(h.div().children(h.span(), h.div(), h.span()), undefined, a);
        expect(a).to.be.equal(b);
        observeBlueprint(b)
          .expectNoDeepConnect();
      });

      it(`diff children`, () => {
        const a = createBlueprint(h.div().children(h.span()));
        const b = createBlueprint(h.div().children(h.div()), undefined, a);
        expect(a).not.to.be.equal(b);
        observeBlueprint(b)
          .expectNoDeepConnect();
      });

      it(`diff multiple children`, () => {
        const a = createBlueprint(h.div().children(h.span(), h.div(), h.span()));
        const b = createBlueprint(h.div().children(h.span(), h.span(), h.span()), undefined, a);
        expect(a).not.to.be.equal(b);
        observeBlueprint(b)
          .expectNoDeepConnect();
      });
    });

    describe("deep reuse", () => {
      it(`1`, () => {
        const a = createBlueprint(h.div().children(h.span(), h.div(), h.span()));
        const b = createBlueprint(h.div().children(h.span(), h.span(), h.span()), undefined, a);
        const index = createBlueprintIndex(a);
        const o = observeBlueprint(b);
        const c1 = o.firstChild();
        const c2 = c1.nextSibling();
        const c3 = c2.nextSibling();

        expect(index.has(c1.node)).to.be.true;
        expect(index.has(c2.node)).to.be.false;
        expect(index.has(c3.node)).to.be.true;
      });

      it(`children keys`, () => {
        const a = createBlueprint(h.div().children(h.span().key("a"), h.div().key("b"), h.span().key("c")));
        const b = createBlueprint(
          h.div().children(h.span().key("c"), h.span().key("a"), h.div().key("b")),
          undefined,
          a,
        );
        const index = createBlueprintIndex(a);
        const o = observeBlueprint(b);
        const c1 = o.firstChild();
        const c2 = c1.nextSibling();
        const c3 = c2.nextSibling();

        expect(index.has(c1.node)).to.be.true;
        expect(index.has(c2.node)).to.be.true;
        expect(index.has(c3.node)).to.be.true;
      });
    });
  });

  describe("deep connect", () => {
    it(`abc`, () => {
      observeBlueprint(createBlueprint(h.t("abc")))
        .expectNoDeepConnect();
    });

    it(`<div>`, () => {
      observeBlueprint(createBlueprint(h.div()))
        .expectNoDeepConnect();
    });

    it(`<C><div></C>`, () => {
      observeBlueprint(createBlueprint(c.rc(h.div())))
        .expectNoDeepConnect();
    });

    it(`<SC><div></SC>`, () => {
      observeBlueprint(createBlueprint(c.src(h.div())))
        .expectNoDeepConnect();
    });

    it(`<ctx><div></ctx>`, () => {
      const a = observeBlueprint(createBlueprint(context({}, h.div())))
        .expectNoDeepConnect();

      a.firstChild()
        .expectNoDeepConnect();
    });

    it(`<div><cc></div>`, () => {
      const ctx = { child: h.div() };
      const a = observeBlueprint(createBlueprint(h.div().children(
        context(ctx, h.div().children(c.cc())),
      )))
        .expectDeepConnect();

      a
        .firstChild() // context
        .expectDeepConnect()
        .firstChild() // div
        .expectDeepConnect()
        .firstChild() // connect
        .expectDeepConnect()
        .firstChild() // div
        .expectNoDeepConnect();
    });

    it(`<div><div></div><cc></div>`, () => {
      const ctx = { child: h.div() };
      observeBlueprint(createBlueprint(h.div().children(
        context(ctx, h.div().children(h.div(), c.cc())),
      )))
        .expectDeepConnect();
    });
  });
});
