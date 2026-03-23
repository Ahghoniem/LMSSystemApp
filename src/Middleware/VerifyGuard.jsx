import React from 'react';
import { Navigate } from 'react-router';
import { getAuth } from '../Utils';

const VerifyGuard = ({children,to}) => {
   const email=getAuth()
   if(email === undefined)
   {
    return <Navigate to={to}/>
   }
   else {
    return children
   }
};

export default VerifyGuard;