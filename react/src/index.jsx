import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import Home from "./pages/Home";
import { StyledEngineProvider } from "@mui/material";
import Olvide_contraseña from "./pages/Olvide_contraseña";
import { Route, Routes, HashRouter, Outlet } from "react-router-dom";
import React, {lazy, Suspense} from "react";
const App = lazy(() => import("./app"))
import "./css/basics.css" ;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    
    <React.StrictMode>
        
        <StyledEngineProvider>
 
                <HashRouter forceRefresh={true}>
                    <Routes>

                        <Route exact path="/" element={<Home />}></Route>
                        <Route exact path="/olvide_contraseña/:token" element={<Olvide_contraseña />}></Route>

                        <Route exact path="/dashboard/*" element={ <App /> }></Route>
                    </Routes>
                </HashRouter>  
            <Suspense>
                <Outlet />
            </Suspense>
        </StyledEngineProvider>
    </React.StrictMode>
);
