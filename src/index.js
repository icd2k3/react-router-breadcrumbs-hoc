import React from 'react';
import { matchPath, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

export const DEFAULT_MATCH_OPTIONS = { exact: true };
export const DEFAULT_NAV_LINK_OPTIONS = { exact: true, strict: true };

const renderer = ({ breadcrumb, match, navLink }) => {
  // if breadcumb is a function, render it with `match` object passed
  // else just return the string
  const renderedComponent = typeof breadcrumb === 'function'
    ? breadcrumb({ match })
    : breadcrumb;

  // wrap the breadcrumb in a NavLink component by default
  // this can be bypassed via withBreadcumbs(routes, false)(Component)
  if (navLink) {
    return (
      <NavLink {...navLink} to={match.url}>
        {renderedComponent}
      </NavLink>
    );
  }

  // return static breadcrumb component NOT wrapped in <NavLink>
  return renderedComponent;
};

export const getBreadcrumbs = ({ routes, location, globalNavLinkProps }) => {
  const matches = [];
  const { pathname } = location;

  pathname
    // remove trailing slash "/" from pathname (avoids multiple of the same match)
    .replace(/\/$/, '')
    // split pathname into sections
    .split('/')
    // reduce over the sections and find matches from `routes` prop
    .reduce((previous, current) => {
      // combine the last route section with the current
      // ex `pathname = /1/2/3 results in match checks for
      // `/1`, `/1/2`, `/1/2/3`
      const pathSection = `${previous}/${current}`;

      let breadcrumbMatch;

      routes.some(({
        breadcrumb,
        matchOptions,
        path,
        navLinkProps,
      }) => {
        const match = matchPath(pathSection, { ...(matchOptions || DEFAULT_MATCH_OPTIONS), path });

        // if a route match is found ^ break out of the loop with a rendered breadcumb
        // and match object to add to the `matches` array
        if (match) {
          const navLink = typeof navLinkProps !== 'undefined'
            ? navLinkProps
            : globalNavLinkProps;

          breadcrumbMatch = {
            breadcrumb: renderer({ breadcrumb, match, navLink }),
            path,
            match,
          };
          return true;
        }

        return false;
      });

      if (breadcrumbMatch) { matches.push(breadcrumbMatch); }

      return pathSection;
    });

  return matches;
};

export const withBreadcrumbs = (routes, globalNavLinkProps = {}) => Component =>
  withRouter(props => (
    <Component
      {...props}
      breadcrumbs={
        getBreadcrumbs({
          location: props.location,
          routes,
          // allow user to NOT wrap breadcrumbs in a <NavLink> (default)
          // by passing `false` or `null` for `globalNavLinkProps`
          globalNavLinkProps: globalNavLinkProps
            ? {
              ...DEFAULT_NAV_LINK_OPTIONS,
              ...globalNavLinkProps,
            }
            : null,
        })
      }
    />));
