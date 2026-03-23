import React from 'react';
import { getStatus } from '../Utils';
import { Navigate } from 'react-router';

const OTPGuard = ({children,to}) => {
    const status =getStatus()
    if(status === "verified-password")
    {
        return <Navigate to={to}/>
    }
    else if(status === undefined){
        return <Navigate to={'/verify-email'}/>
    }
    else {
        return children
    }
};

export default OTPGuard;