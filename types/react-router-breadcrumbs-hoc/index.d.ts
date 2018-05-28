// Type definitions for react-router-breadcrumbs-hoc 2.1
// Project: https://github.com/icd2k3/react-router-breadcrumbs-hoc
// Definitions by: 9renpoto <https://github.com/9renpoto>
// Definitions: https://github.com/icd2k3/react-router-breadcrumbs-hoc

import * as React from "react";
import { Omit, RouteComponentProps, Route } from "react-router";

export interface Options {
  currentSection?: string;
  disableDefaults?: boolean;
  excludePaths?: string[];
  pathSection?: string;
}

export interface BreadcrumbsRoute {
  path: string;
  breadcrumb: React.ReactNode | string;
}

export interface BreadcrumbsProps {
  key: string;
  props: RouteComponentProps<{}>;
}

export interface InjectedProps extends RouteComponentProps<{}> {
  breadcrumbs: BreadcrumbsProps[];
}

export type withRouter<P extends RouteComponentProps<any>> = (component: React.ComponentType<P>) => React.ComponentClass<{}>;

export default function withBreadcrumbs(
  routes: BreadcrumbsRoute[],
  options?: Options
): withRouter<InjectedProps>;
