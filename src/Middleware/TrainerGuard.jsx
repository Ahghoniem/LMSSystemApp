import React from 'react';
import { Decode_Token, getToken } from '../Utils';
import { Navigate, Outlet } from 'react-router';

const TrainerGuard = ({to}) => {
    const token =getToken()
    const data =Decode_Token(token)
    if(token && data.role === "TRAINER")
    {
        return <Outlet/>
    }
    else if(token && data.role === "ADMIN") {
        return <Navigate to={to}/>
    }
    else {
        return <Navigate to={'/login'}/>
    }
};

export default TrainerGuard;