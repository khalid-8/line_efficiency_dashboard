import React from "react";
import { DashBoard, DataInput, Landing, Login, ManageUsers, ProductionTv, SignUp, WaitingApproval } from "../views";
import { Routes, Route } from "react-router-dom";
import { useAuthContext } from "../context";
import ProtectedRoute from "./ProtectedRoute";
import { ForgotPassword, UpdateProfile } from "../views/Users";
import NotAuthorized from "../views/NotAuthorized";

export default function AppRoutes(){
    const {currentUser, canAccess} = useAuthContext()
    const isApproved = currentUser?.claim?.approved
    
    return(
        <Routes>
            <Route exact
                path="/"
                element={  
                    <Landing/>
                // <ProtectedRoute 
                //     redirectPath="not_authorized"
                //     isAllowed={canAccess}>
                //         <Landing/>
                // </ProtectedRoute>
                }
            />

            <Route exact
                path="/login"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!currentUser}>
                            <Login/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="/signup"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!currentUser}>
                            <SignUp/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="/forgotPassword"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!currentUser}>
                            <ForgotPassword/>
                    </ProtectedRoute>
                }
            />

            <Route exact
                path='/input'
                element={
                    <ProtectedRoute 
                        redirectPath="/login"
                        isAllowed={!!currentUser && isApproved}>
                            <DataInput/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="manage_users"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!!currentUser && isApproved && currentUser?.claim?.admin}>
                            <ManageUsers/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="/dashboard"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!!currentUser}>
                            <DashBoard/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="/update_profile"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!!currentUser}>
                            <UpdateProfile/>
                    </ProtectedRoute>
                    
                }
            />

            <Route exact
                path="not_approved"
                element={
                    <ProtectedRoute 
                        redirectPath="/"
                        isAllowed={!currentUser}>
                            <WaitingApproval/>
                    </ProtectedRoute>
                }
            />
            
            <Route exact
                path='/production/:line/'
                element={
                    <ProductionTv/>
                }
            />

            <Route path='not_authorized' 
                element={<NotAuthorized />}
            />  
        </Routes>
    )
}