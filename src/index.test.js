/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { StaticRouter as Router } from 'react-router';
import { NavLink } from 'react-router-dom';
import { getBreadcrumbs, withBreadcrumbs } from './index';

const components = {
  Breadcrumbs: ({ breadcrumbs }) => (
    <div className="breadcrumbs-container">
      {breadcrumbs.map(({ breadcrumb, path }, index) => (
        <span key={`${path}${index}`}>{breadcrumb}</span>
      ))}
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

describe('react-router-breadcrumbs-hoc', () => {
  describe('Valid routes', () => {
    const routes = [
      // test home route
      { path: '/', breadcrumb: 'Home' },
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
    ];
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

  describe('No matching routes', () => {
    const routes = [
      { path: '/1', breadcrumb: '1' },
    ];
    const routerProps = {
      context: {},
      location: { pathname: 'nope' },
    };

    it('Should render empty container', () => {
      const ComposedComponent = withBreadcrumbs(routes)(components.Breadcrumbs);
      const wrapper = mount(<Router {...routerProps}><ComposedComponent /></Router>);

      expect(wrapper.find(ComposedComponent)).toMatchSnapshot();
    });
  });

  describe('Custom match options', () => {
    const routes = [
      {
        path: '/1',
        breadcrumb: '1',
        // not recommended, but supported
        matchOptions: { exact: false, strict: true },
      },
    ];
    const routerProps = {
      context: {},
      location: { pathname: '/1/2' },
    };

    it('Should render empty container', () => {
      const ComposedComponent = withBreadcrumbs(routes)(components.Breadcrumbs);
      const wrapper = mount(<Router {...routerProps}><ComposedComponent /></Router>);

      expect(wrapper.find(ComposedComponent)).toMatchSnapshot();
    });
  });

  describe('When extending react-router config', () => {
    const routes = [
      { path: '/1', breadcrumb: '1' },
      // no breadcrumb required for this route
      { path: '/2' },
    ];
    const routerProps = {
      context: {},
      location: { pathname: '/2' },
    };

    it('Should render expected breadcrumbs and omit routes that do not require them', () => {
      const ComposedComponent = withBreadcrumbs(routes)(components.Breadcrumbs);
      const wrapper = mount(<Router {...routerProps}><ComposedComponent /></Router>);

      expect(wrapper.find(ComposedComponent)).toMatchSnapshot();
    });
  });

  describe('Invalid route object', () => {
    it('Should error if `path` is not provided', () => {
      expect(() => getBreadcrumbs({ routes: [{ breadcrumb: 'Yo' }], pathname: '/1' }))
        .toThrow('withBreadcrumbs: `path` must be provided in every route object');
    });
  });
});
