import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { StaticRouter as Router } from 'react-router';
import { NavLink } from 'react-router-dom';
import { withBreadcrumbs } from './index';

const components = {
  Breadcrumbs: ({ breadcrumbs }) => (
    <div className="breadcrumbs-container">
      {breadcrumbs.map(({ breadcrumb, path }) => <span key={path}>{breadcrumb}</span>)}
    </div>
  ),
  BreadcrumbMatchTest: ({ match }) => <span>{match.params.number}</span>,
  BreadcrumbNavLinkTest: ({ match }) => <NavLink to={match.url}>Link</NavLink>,
};

const matchShape = {
  isExact: PropTypes.bool.isRequired,
  params: PropTypes.shape().isRequired,
  path: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

components.Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.shape({
    match: PropTypes.shape(matchShape).isRequired,
    path: PropTypes.string.isRequired,
  })).isRequired,
};

components.BreadcrumbMatchTest.propTypes = {
  match: PropTypes.shape(matchShape).isRequired,
};

components.BreadcrumbNavLinkTest.propTypes = {
  match: PropTypes.shape(matchShape).isRequired,
};

// randomize routes in array to make sure order doesn't matter
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

describe('react-router-breadcrumbs-hoc', () => {
  describe('withBreadcrumbs', () => {
    const routes = shuffle([
      // test breadcrumb passed as string
      { path: '/1', breadcrumb: '1' },
      // test simple breadcrumb component
      { path: '/1/2', breadcrumb: () => <span>TWO</span> },
      // test advanced breadcrumb component (user can use `match` however they wish)
      { path: '/1/2/:number', breadcrumb: components.BreadcrumbMatchTest },
      // test NavLink wrapped breadcrumb
      { path: '/1/2/:number/4', breadcrumb: components.BreadcrumbNavLinkTest },
      // test a no-match route
      { path: '/no-match', breadcrumb: 'no match' },
    ]);
    const routerProps = {
      context: {},
      location: { pathname: '/1/2/3/4' },
    };

    it('Should render breadcrumb components as expected', () => {
      const ComposedComponent = withBreadcrumbs(routes)(components.Breadcrumbs);
      const wrapper = mount(<Router {...routerProps}><ComposedComponent /></Router>);

      expect(wrapper.find(ComposedComponent)).toMatchSnapshot();
      expect(wrapper.find(NavLink).props().to).toBe('/1/2/3/4');
    });
  });
});
