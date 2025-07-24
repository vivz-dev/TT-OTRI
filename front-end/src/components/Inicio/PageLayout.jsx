/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react';
import Navbar from 'react-bootstrap/Navbar';

import { useIsAuthenticated } from '@azure/msal-react';
import * as Buttons from '../layouts/buttons/buttons_index';

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">
                <a className="navbar-brand" href="/">
                    Microsoft Identity Platform a
                </a>
                <div className="collapse navbar-collapse justify-content-end">
                    {isAuthenticated ? <Buttons.SignOutButton /> : <Buttons.SignInButton />}
                </div>
            </Navbar>
            <h5>
                <center>Welcome to the Microsoft Authentication Library For Javascript - React Quickstart</center>
            </h5>
            <br />
            <br />
            {props.children}
        </>
    );
};
