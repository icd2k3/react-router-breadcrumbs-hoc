import { createElement } from 'react';
import { matchPath, withRouter } from 'react-router';

const DEFAULT_MATCH_OPTIONS = { exact: true };

// if user is passing a function (component) as a breadcrumb, make sure we
// pass the match object into it. Else just return the string.
const renderer = ({ breadcrumb, match, location }) => {
  if (typeof breadcrumb === 'function') {
    return createElement(breadcrumb, { match, location });
  }
  return breadcrumb;
};

export const getBreadcrumbs = ({ routes, location }) => {
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
      const pathSection = !current ? '/' : `${previous}/${current}`;

      let breadcrumbMatch;

      routes.some(({ breadcrumb, matchOptions, path }) => {
        if (!path) {
          throw new Error('withBreadcrumbs: `path` must be provided in every route object');
        }
        if (!breadcrumb) {
          return false;
        }
        const match = matchPath(pathSection, { ...(matchOptions || DEFAULT_MATCH_OPTIONS), path });

        // if a route match is found ^ break out of the loop with a rendered breadcumb
        // and match object to add to the `matches` array
        if (match) {
          breadcrumbMatch = {
            breadcrumb: renderer({ breadcrumb, match, location }),
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

      return pathSection === '/' ? '' : pathSection;
    }, null);

  return matches;
};

export const withBreadcrumbs = routes => Component => withRouter(props =>
  createElement(Component, {
    ...props,
    breadcrumbs: getBreadcrumbs({
      routes,
      location: props.location,
    }),
  }));
