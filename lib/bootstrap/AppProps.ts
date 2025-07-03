import type { AppProps as NAppProps } from "next/app";
import type {
  NextComponentType,
  NextPageContext,
} from "next/dist/shared/lib/utils";
import type { ReactNode } from "react";

export type AppProps<LayoutProps = void> = Omit<NAppProps, "Component"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: NextComponentType<NextPageContext, any, any> & {
    getLayout: (children: ReactNode, props: LayoutProps) => ReactNode;
    layoutProps: LayoutProps;
  };
};
