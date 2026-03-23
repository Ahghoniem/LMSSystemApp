import React from 'react';
import { Decode_Token, getToken } from '../Utils';
import { Navigate, Outlet } from 'react-router';

const SuperAdminGuard = ({to}) => {
    const token =getToken()
    const data =Decode_Token(token)
    if(token && data.role === "SUPERADMIN")
    {
        return <Outlet/>
    }
    else if(token && data.role !== "SUPERADMIN") {
        return <Navigate to={to}/>
    }
    else {
        return <Navigate to={'/login'}/>
    }
};

export default SuperAdminGuard;