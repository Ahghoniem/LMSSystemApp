import React from 'react';
import { getToken } from '../Utils';
import { Navigate } from 'react-router';

const LoginGuard = ({children,to}) => {
    const token =getToken()
    if(!token)
    {
        return children
    }
    else {
        return <Navigate to={to}/>
    }
};

export default LoginGuard;