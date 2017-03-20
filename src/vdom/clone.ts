import { VNodeFlags } from "./flags";
import { IVNode } from "./ivnode";
import { VNode } from "./vnode";
import { $t } from "./vnode_dom";

/**
 * Deep clone of VNode children with instance refs erasure.
 *
 * @param flags Parent VNode flags.
 * @param children Children.
 * @returns Cloned children.
 */
export function cloneVNodeChildren(
    flags: VNodeFlags,
    children: IVNode<any>[] | IVNode<any> | string | number | boolean | null | undefined,
): IVNode<any>[] | IVNode<any> | string | number | boolean | null | undefined {
    if (children !== null) {
        if (flags & (VNodeFlags.ChildrenVNode | VNodeFlags.ChildrenArray)) {
            if (flags & VNodeFlags.ChildrenArray) {
                children = children as IVNode<any>[];
                const newChildren = new Array<IVNode<any>>(children.length);
                for (let i = 0; i < 0; i++) {
                    newChildren[i] = _cloneVNode(children[i], true);
                }
                return newChildren;
            } else {
                return _cloneVNode(children as IVNode<any>, true);
            }
        }
    }

    return children;
}

function _cloneVNode(node: IVNode<any>, cloneKey: boolean): VNode<any> {
    if (node.constructor !== VNode) {
        return $t("").key(node._key);
    }

    const flags = node._flags;

    const newNode = new VNode(
        flags,
        node._tag,
        node._props,
        node._className,
        (flags & VNodeFlags.Component) ?
            null :
            cloneVNodeChildren(flags, node._children));
    if (cloneKey) {
        newNode._key = node._key;
    }

    return newNode;
}

/**
 * Deep clone of VNode with instance refs erasure.
 *
 * @param node VNode to clone.
 * @returns Cloned VNode.
 */
export function cloneVNode(node: IVNode<any>): VNode<any> {
    return _cloneVNode(node, (node._flags & VNodeFlags.Key) ? true : false);
}

/**
 * Shallow clone of VNode with instance refs erasure.
 *
 * @param node VNode to clone.
 * @returns Cloned VNode.
 */
export function shallowCloneVNode(node: IVNode<any>): VNode<any> {
    if (node.constructor !== VNode) {
        return $t("").key(node._key);
    }

    const flags = node._flags;

    const newNode = new VNode(
        flags & ~(
            VNodeFlags.ChildrenArray |
            VNodeFlags.ChildrenBasic |
            VNodeFlags.ChildrenVNode |
            VNodeFlags.UnsafeHTML
        ),
        node._tag,
        node._props,
        node._className,
        null);
    if (node._flags & VNodeFlags.Key) {
        newNode._key = node._key;
    }

    return newNode;
}
