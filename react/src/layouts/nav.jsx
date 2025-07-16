import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/layouts/nav.css";
import logoCircle_blue from "../assets/img/logo_secretaria.webp";
import sismed_logo from "../assets/img/sismed_logo.svg";
import logo_secretaria from "../assets/img/logo_secretaria-circle.webp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import WavingHandIcon from "@mui/icons-material/WavingHand";

import CheckIcon from "@mui/icons-material/Check";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import StorageIcon from "@mui/icons-material/Storage";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ConstructionIcon from '@mui/icons-material/Construction';


export default function nav(props) {
  
  const [divStyle, setDivStyle] = useState("sismed");
    useEffect(() => {
      const currentUrl = window.location.href;
      // Check if the URL contains "test-front." or "sismed."
      if (currentUrl.includes("test-front.")) {
        setDivStyle("test");
      }
    }, []);
  
    console.log(divStyle);
    
  return (
    <nav className={`left_nav ${props.status ? "open" : "closed"} ${divStyle == "test" ? "bg-dark" : ""}`}>
      <div className="w-100  nav_into_container" style={{borderColor: divStyle == "test" ? "bg-green" : ""}}>
        <DragHandleIcon
          className="arrowIcon"
          onClick={() => props.getNavStatus((prev) => !prev)}
        />
        <NavLink
          className="header flex gap-3"
          to="/dashboard"
          key={"dashboard"}
        >
          <div className="logo_nav_container">
            <img
              src={logo_secretaria}
              className="logo w-full"
              alt="logo del sistema"
            />
          </div>
          <p className="system_title relative -top-1">Home</p>
        </NavLink>
        <ul className="link_container">
          {/* {linkes} */}

          {props.userData?.permissions[1] && (
          
            <NavLink key={"/dashboard/Organizaciones"} to={"/dashboard/Organizaciones"} title={"Organizaciones"}>
              <AddBusinessIcon />
              <span className="text_link">Organizaciones</span>
            </NavLink>
          )}

          {props.userData?.permissions[2] && (
            <NavLink key={"/dashboard/usuarios"} to={"/dashboard/usuarios"} title={"usuarios"}>
              <PeopleIcon />
              <span className="text_link"> Usuarios</span>
            </NavLink>
          )}
          {props.userData?.permissions[3] && (
            <NavLink key={"/dashboard/productos"} to={"/dashboard/productos"} title={"Productos"}>
              <StorageIcon />
              <span className="text_link"> Productos</span>
            </NavLink>
          )}
          {props.userData?.permissions[4] && (
            <NavLink to={"/dashboard/Entradas"} key={"/dashboard/Entradas"} title={"Entradas"}>
              <ArrowDownwardIcon />
              <span className="text_link"> Entradas</span>
            </NavLink>
          )}
          {props.userData?.permissions[7] && (
            <NavLink
              to={"/dashboard/EntradasPorConfirmar"} key={"/dashboard/EntradasPorConfirmar"}
              title={"EntradasPorConfirmar"}
            >
              <AssignmentTurnedInIcon />
              <span className="text_link text-xs ">Entradas por confirmar</span>
            </NavLink>
          )}
          {props.userData?.permissions[5] && (
            <NavLink to={"/dashboard/Salidas"} key={"/dashboard/Salidas"} title={"Salidas"}>
              <ArrowOutwardIcon />
              <span className="text_link"> Salidas</span>
            </NavLink>
          )}
          {props.userData?.permissions[6] && (
            <NavLink to={"/dashboard/Inventario"} key={"/dashboard/Inventario"} title={"Inventario"}>
              <MedicalServicesIcon />
              <span className="text_link"> Inventario</span>
            </NavLink>
          )}
           {props.userData?.permissions[9] && (
            <NavLink to={"/dashboard/Mantenimiento"} key={"/dashboard/Mantenimiento"} title={"Mantenimiento"}>
              <ConstructionIcon />
              <span className="text_link"> Mantenimiento</span>
            </NavLink>
          )}

          {props.userData?.permissions[8] && (
            <NavLink
              to={"/dashboard/SolicitarProductos"} key={"/dashboard/SolicitarProductos"}
              title={"SolicitarProductos"}
            >
              <WavingHandIcon />

              <span className="text_link text-xs ml-1">
                Solicitar productos
              </span>
            </NavLink>
          )}

          {props.userData?.permissions[5] && (
            <NavLink
              to={"/dashboard/PedidosAMiAlmacen"} key={"/dashboard/PedidosAMiAlmacen"}
              title={"PedidosAMiAlmacen"}
            >
              <AssignmentIcon />
              <span className="text_link text-xs ">Pedidos a mi almacén</span>
            </NavLink>
          )}
          {/* <NavLink
            to={"/dashboard/SolicitarProductos"}
            title={"SolicitarProductos"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M7.906 1.531a.5.5 0 0 1 .5-.5h1.625a.5.5 0 0 1 .5.5v1.407h1.406a.5.5 0 0 1 .5.5v1.625a.5.5 0 0 1-.5.5h-1.406v1.406a.5.5 0 0 1-.5.5H8.406a.5.5 0 0 1-.5-.5V5.563H6.5a.5.5 0 0 1-.5-.5V3.438a.5.5 0 0 1 .5-.5h1.406zM1.843 7H0v4l1.828 1.828A4 4 0 0 0 4.657 14H10.5a1.5 1.5 0 0 0 0-3H7.723a2.11 2.11 0 0 1-3.515.892l-1.45-1.45a.625.625 0 1 1 .884-.884l1.45 1.45a.86.86 0 0 0 1.307-1.109L4.672 8.172A4 4 0 0 0 1.843 7" clip-rule="evenodd"/></svg>
            <span className="text_link text-xs ml-1">Pedidos a mi almacén</span>
          </NavLink> */}
        </ul>
      </div>
    </nav>
  );
}
