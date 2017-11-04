import React from 'react';
import { matchPath, withRouter } from 'react-router';

const DEFAULT_MATCH_OPTIONS = { exact: true };

// if user is passing a function (component) as a breadcrumb, make sure we
// pass the match object into it. Else just return the string.
const renderer = ({ breadcrumb, match }) => {
  if (typeof breadcrumb === 'function') { return breadcrumb({ match }); }
  return breadcrumb;
};

export const getBreadcrumbs = ({ routes, pathname }) => {
  const matches = [];

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

      routes.some(({ breadcrumb, matchOptions, path }) => {
        if (!breadcrumb || !path) {
          throw new Error('withBreadcrumbs: `breadcrumb` and `path` must be provided in every route object');
        }
        const match = matchPath(pathSection, { ...(matchOptions || DEFAULT_MATCH_OPTIONS), path });

        // if a route match is found ^ break out of the loop with a rendered breadcumb
        // and match object to add to the `matches` array
        if (match) {
          breadcrumbMatch = {
            breadcrumb: renderer({ breadcrumb, match }),
            path,
            match,
          };
          return true;
        }

        return false;
      });

      /* istanbul ignore else */
      if (breadcrumbMatch) {
        matches.push(breadcrumbMatch);
      }

      return pathSection;
    });

  return matches;
};

export const withBreadcrumbs = routes => Component => withRouter(props => (
  <Component
    {...props}
    breadcrumbs={
      getBreadcrumbs({
        pathname: props.location.pathname,
        routes,
      })
    }
  />
));
