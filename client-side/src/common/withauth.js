import React from 'react';
import { Ui_url } from './env_variable';

export const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = sessionStorage.getItem('token');

    if (!isAuthenticated) {
      window.open(Ui_url+ "login", "_self");
      return null;
    }
    return WrappedComponent() 
  };
};

export default withAuth;