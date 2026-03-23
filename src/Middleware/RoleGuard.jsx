import React from 'react';
import { Decode_Token, getToken } from '../Utils';
import { Navigate } from 'react-router';

const RoleGuard = ({children,to}) => {
    const data = Decode_Token(getToken());
    if (data?.role === "ADMIN") {
        return <Navigate to={to}/>;
    }
    if (data?.role === "SUPERADMIN") {
        return <Navigate to={"/superadmin/dashboard"}/>;
    }
    if (data?.role === "TRAINER") {
        return <Navigate to={"/trainer/dashboard"}/>;
    }
    if (data?.role === "SUPERVISOR") {
        return <Navigate to={"/supervisor/dashboard"}/>;
    }
    return children;
};

export default RoleGuard;
