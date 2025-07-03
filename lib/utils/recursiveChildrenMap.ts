import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export default function recursiveChildrenMap<P>(
  children: ReactNode,
  fn: (child: ReactElement<P>) => ReactElement<P>,
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const childProps = child.props as { children?: ReactNode } | undefined;

    if (childProps?.children) {
      child = cloneElement(child, {
        children: recursiveChildrenMap(childProps.children, fn),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }

    return fn(child as ReactElement<P>);
  });
}
