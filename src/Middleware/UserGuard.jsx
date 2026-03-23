import React from 'react';
import { Decode_Token, getToken } from '../Utils';
import { Navigate, Outlet, useLocation } from 'react-router';

const UserGuard = ({to}) => {
    const token =getToken()
    const data =Decode_Token(token)
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const attendanceToken = searchParams.get("token");
    if(token && data.role === "STUDENT")
    {
        return <Outlet/>
    }
    else if(token && data.role === "ADMIN") {
        return <Navigate to={to}/>
    }
    else {
        if (attendanceToken) {
                    return (
                      <Navigate
                        to="/login"
                        replace
                        state={{
                            from: location.pathname + location.search,
                            isFromQR: true,
                        }}
                        />
                    );
                    }
        return <Navigate to={'/login'}/>
    }
};

export default UserGuard;