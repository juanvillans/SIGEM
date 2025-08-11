import axios from "./api/axios";

import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState, cloneElement, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

import TopNavbar from "./layouts/TopNavbar";
import Nav from "./layouts/nav";
// import Footer from "./layouts/Footer";
import ConfirmModal from "./components/ConfimModal";
// import Alert from "../components/Alert";

const Usuarios = lazy(() => import("./pages/Usuarios"));

const Productos = lazy(() => import("./pages/Productos"));
const Inventario = lazy(() => import("./pages/Inventario"));
// const AjusteDeInventario = lazy(() => import("./pages/AjusteDeInventario"));
const Entradas = lazy(() => import("./pages/Entradas"));
const EntradasPorConfirmar = lazy(() => import("./pages/EntradasPorConfirmar"));
const Salidas = lazy(() => import("./pages/Salidas"));
const Organizaciones = lazy(() => import("./pages/Organizaciones"));
const Cambiar_contraseña = lazy(() => import("./pages/Cambiar_contraseña"));
const SolicitarProductos = lazy(() => import("./pages/SolicitarProductos"));
const PedidosAMiAlmacen = lazy(() => import("./pages/PedidosAMiAlmacen"));
const Mantenimiento = lazy(() => import("./pages/Mantenimiento"));
// const Pagos = lazy(() => import("./pages/Pagos"))
// function showBrowserNotification(title, options) {
//   if (Notification.permission === "granted") {
//     new Notification(title, options);
//   } else {
//     console.log("Notification permission not granted.");
//   }
// }

// // Example usage
// showBrowserNotification("New Notification", {
//   body: "You have a new notification!",
//   icon: "/path/to/icon.png",
// });

export default function app() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [notificationsCount, setNotificationsCount] = useState({});
  const [navStatus, setNavStatus] = useState(window.innerWidth >= 400);
  const location = useLocation();

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const response = await axios.get(`check-session`);
        setNotificationsCount({
          count: response.data.notifications,
          n: Math.random(),
        });
      } catch (error) {
        if (error.response.status === 401) {
          localStorage.removeItem("userData");
          localStorage.removeItem("apiToken");
          navigate("/");
        }
      }
    };

    verifyLogin();
  }, [navigate]); // Ensure navigate is included in the dependency array

  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  return (
    <div className="dashboard_container">
      <Nav
        getNavStatus={() => setNavStatus((prev) => !prev)}
        status={navStatus}
        userData={userData}
      />
      <div className={`top_nav_and_main`}>
        <div
          className={`mainDashboard_container ${navStatus ? "small" : "large"}`}
        >
          <TopNavbar
            userData={userData}
            notificationsCount={notificationsCount}
          />
          <main>
            <Suspense>
              <Routes forceRefresh={true}>
                <Route
                  key={"Cambiar_contraseña"}
                  path="/Cambiar_contraseña"
                  element={<Cambiar_contraseña userData={userData} />}
                ></Route>
                {/* {session.permission.map(mod =>{
                      const module_import = cloneElement(pages[mod.module_name.replaceAll(' ', '_')], {permissions: mod.permissions})

                        return (
                          <Route exact path={mod.module_url} element={module_import} key={mod.module_url}></Route>
                          
                        )
                    })} */}
                {/* <Route key={'cambiarContaseña'} path="/cambiar_contraseña" element={<Cambiar_contraseña  userData={userData}/>}></Route> */}
                {userData?.permissions[1] && (
                  <Route
                    key={"Organizaciones"}
                    path="/Organizaciones"
                    element={<Organizaciones userData={userData} />}
                  ></Route>
                )}

                {userData?.permissions[2] && (
                  <Route
                    key={"usuarios"}
                    path="/usuarios"
                    element={<Usuarios userData={userData} />}
                  ></Route>
                )}

                {userData?.permissions[3] && (
                  <Route
                    key={"productos"}
                    path="/Productos/*"
                    element={<Productos userData={userData} />}
                  ></Route>
                )}

                {userData?.permissions[4] && (
                  <Route
                    key={"Entradas"}
                    path="/Entradas/"
                    element={<Entradas userData={userData} />}
                  ></Route>
                )}
                {userData?.permissions[7] && (
                  <Route
                    key={"EntradasPorConfirmar"}
                    path="/EntradasPorConfirmar/"
                    element={<EntradasPorConfirmar userData={userData} />}
                  ></Route>
                )}
                {userData?.permissions[5] && (
                  <Route
                    key={"Salidas"}
                    path="/Salidas/"
                    element={<Salidas userData={userData} />}
                  ></Route>
                )}

                {userData?.permissions[6] && (
                  <Route
                    key={"Inventario"}
                    path="/Inventario/"
                    element={<Inventario userData={userData} />}
                  ></Route>
                )}
                {userData?.permissions[8] && (
                  <Route
                    key={"Mantenimiento"}
                    path="/Mantenimiento/"
                    element={<Mantenimiento userData={userData} />}
                  ></Route>
                )}
              </Routes>
            </Suspense>
          </main>

          {/* <Footer></Footer> */}
        </div>
      </div>
      <ConfirmModal
        closeModal={() => {
          setModalConfirm({ isOpen: false });
          // setRowSelected([])
        }}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={() => modalConfirm.aceptFunction()}
      />
    </div>
  );
}
