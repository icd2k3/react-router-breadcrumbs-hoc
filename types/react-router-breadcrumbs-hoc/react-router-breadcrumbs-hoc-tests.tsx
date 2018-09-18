import * as React from "react";
import { RouteComponentProps } from "react-router";
import { NavLink } from "react-router-dom";
import withBreadcrumbs, {
  BreadcrumbsRoute,
  BreadcrumbsProps,
  InjectedProps
} from "react-router-breadcrumbs-hoc";

interface UserBreadcrumbProps
  extends RouteComponentProps<{
      userId: string;
    }> {}

const UserBreadcrumb = ({ match }: UserBreadcrumbProps) => (
  <span>{match.params.userId}</span>
);

const routes: BreadcrumbsRoute[] = [
  { path: "/users/:userId", breadcrumb: UserBreadcrumb },
  { path: "/example", breadcrumb: "Custom Example" },
  {
    path: "/test-match-options",
    breadcrumb: "Match Options",
    matchOptions: { exact: true, strict: true },
  },
];

const Breadcrumbs = ({ breadcrumbs }: InjectedProps) => (
  <div>
    {breadcrumbs.map((breadcrumb: BreadcrumbsProps, index: number) => (
      <span key={breadcrumb.key}>
        <NavLink to={breadcrumb.props.match.url}>{breadcrumb}</NavLink>
        {index < breadcrumbs.length - 1 && <i> / </i>}
      </span>
    ))}
  </div>
);

export default withBreadcrumbs(routes)(Breadcrumbs);
