import "../css/pages/home.css";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainSVG from "../components/MainSVG";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import api from "../api/axios";
import vector_blue from "../assets/img/vector_blue.svg";
import logo_secretaria from "../assets/img/logo_secretaria.webp";

import Input from "../components/Input";
import Button3D from "../components/Button3D";

export default function Home() {
  const navigate = useNavigate();

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const [divStyle, setDivStyle] = useState("sismed");
  console.log(divStyle);
  
  useEffect(() => {
    const currentUrl = window.location.href;
    // Check if the URL contains "test-front." or "sismed."
    if (currentUrl.includes("test-front.")) {
      setDivStyle("test");
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      navigate("/dashboard/usuarios");
    }
    const startAnimation = () => {
      const textosSVG = document.querySelectorAll(".textoSVG");
      const textoSVG_amount = textosSVG?.length - 1;
      let indexTextoSVG = 1;

      intervalRef.current = setInterval(() => {
        let previus = document.querySelector(".textoSVG.opacity-1");
        previus.classList.remove("opacity-1");
        previus.classList.add("opacity-0");
        let actual = textosSVG[indexTextoSVG];
        actual.classList.add("opacity-1");
        actual.classList.remove("opacity-0");
        if (indexTextoSVG === textoSVG_amount) {
          indexTextoSVG = 0;
        } else {
          indexTextoSVG++;
        }
      }, 3000);
    };

    timeoutRef.current = setTimeout(startAnimation, 300);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  const [loginTypeUser, setloginTypeUser] = useState("");
  const [submitStatus, setSubmitStatus] = useState("Entrar");
  const [open, setOpen] = useState(false);

  window.history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
    window.history.go(1);
  };
  const [session, setSession] = useState({ status: false });

  const checkSession = async () => {
    const response = await api.get("/auth");
    if (response.data.status === "success") {
      navigate("/dashboard/usuarios");
    }
  };
  // history.replaceState(null, null, location.href);
  const [user, setUser] = useState({ username: "", password: "" });
  const [statusLoginRequest, setStatusLoginRequest] = useState(0); // 1 = loading
  const [statusForgetPws, setStatusForgetPsw] = useState(
    "Olvidé mi contraseña"
  );

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  useEffect(() => {
    if (alert.open === true) {
      setTimeout(() => {
        setAlert({ open: false, message: "", status: "" });
      }, 5000);
    }
  }, [alert.open === true]);

  const handleSubmitLogin = async (e) => {
    setStatusLoginRequest(1);
    e.preventDefault();
    setSubmitStatus("Cargando...");
    try {
      await api.post("/login", user).then((response) => {
        if (response.data.status) {
          setSubmitStatus("Iniciando...");
        
          const data = response.data;
          const token = response.data.token;
          localStorage.setItem("apiToken", token);
          localStorage.setItem("userData", JSON.stringify(data.userData));
          //  localStorage.setItem('response', response.data));
        } else {
          setAlert({
            open: true,
            status: "Error",
            message: error.response.data.errors
              ? Object.values(error.response.data.errors)[0][0]
              : error.response?.data?.message || "Algo salió mal",
          });
        }
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
        navigate("/dashboard/usuarios");
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
    setStatusLoginRequest(0);
    setSubmitStatus("Entrar");
  };

  const handleForgetPswClick = async (e) => {
    const ci = user.username;
    console.log(ci);
    e.preventDefault();
    // console.log(ci.trim().length)
    if (statusForgetPws == "Olvidé mi contraseña") {
      if (ci.trim().length >= 6) {
        setStatusForgetPsw("Buscando usuario...");
        try {
          await api.post("/forgot-password", { ci }).then((response) => {
            const correo = response.data.personal_email;
            let punto = ".";
            setAlert({
              open: true,
              status: "Exito",
              message: `Se le envió un enlace a su correo: ${correo.slice(
                0,
                2
              )}${punto.repeat(correo.slice(2, -12).length)}${correo.slice(
                -12
              )}`,
            });

            let countDown = 30;
            const interval = setInterval(() => {
              if (countDown === 0) {
                clearInterval(interval);
                setStatusForgetPsw("Olvidé mi contraseña");
              } else {
                setStatusForgetPsw(`Olvidé mi contraseña (${countDown})`);
                countDown--;
              }
            }, 1000);
          });
        } catch (error) {
          setAlert({
            open: true,
            status: "Error",
            message: error.response?.data?.message || "Algo salió mal",
          });
          setStatusForgetPsw("Olvidé mi contraseña");
        }
      } else {
        setAlert({
          open: true,
          status: "Error",
          message: "Debe escribir su cédula",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`bg_home relative h-screen md:overflow-hidden ${divStyle == "test" ? "bg-grey" : ""}`}>
      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form
            onSubmit={handleSubmitLogin}
            className="w-full flex max-w-[300px] flex-col gap-3"
          >
            <div>
              <p className="text-center  font-yesevaOne text-lg uppercase ">
                Inicia sesión 
              </p>
              <span className="mx-auto w-4 block mt-2 bg-dark h-0.5 mb-2"></span>
            </div>

            <Input
              label={"Cédula"}
              required
              key={0}
              onChange={handleChange}
              value={user.username}
              width={"100%"}
              name={"username"}
            />

            <Input
              label={"Contraseña"}
              required
              key={1}
              width={"100%"}
              type={"password"}
              onChange={handleChange}
              value={user.password}
              name={"password"}
            />

            <Button3D
              className="mt-3"
              color={loginTypeUser == "Secretaria" ? "red" : "blue1"}
              text={submitStatus}
              fClick={(e) => {}}
            />
            <a
              className="text-right underline"
              onClick={handleForgetPswClick}
              href="#"
            >
              {statusForgetPws}
            </a>
          </form>
        }
      ></Modal>
      <div className="container_home bg-blue block md:grid">
        <nav className="flex  md:flex-row gap-6 justify-between pt-4 md:items-center">
          <div className="flex flex-col md:flex-row gap-3 items-center logoAndText">
            <img src={logo_secretaria} className="w-10 md:w-24" alt="" />
            <p className="font-yesevaOne font-bold">SIGEM</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 ">
            <Button3D
              color="red"
              text="INICIAR"
              onClick={(e) => {
                setOpen(true);
                setloginTypeUser("Secretaria");
              }}
            />
          </div>
        </nav>
        <main className="mt-7 md:mt-20 text-blue1 w-1/2 max-w-lg min-w-[300px]">
          <h1 className="text-xl md:text-3xl font-semibold ">
            
            {divStyle == "test" ? ("TEST") : "SISTEMA DE GESTIÓN DE EQUIPOS MÉDICOS" }
          </h1>
          <h1>{import.meta.env.REACT_APP_API_URL} </h1>
          <p className="max-w-[360px] my-2 md:text-xl ">
            Plataforma tecnológica avanzada para el control, mantenimiento y 
            trazabilidad de equipos médicos en las instituciones de salud del 
            estado Falcón. 
            <b className=""> Dirigido por: Secretaría de Salud</b>
          </p>
          <div></div>
        </main>
      </div>
      <div className="absolute right-3 sm:right-5 md:right-11 lg:right-16 bottom-4 w-1/2 mx-auto  max-w-[750px] min-w-[300px] ">
        <MainSVG className="relative"></MainSVG>
      </div>

      <img
        src={vector_blue}
        className="absolute  bottom-0 md:-bottom-20 md:-right-4  w-full -z-10 object-cover"
        alt="Mi SVG feliz"
      />
      <Alert
        open={alert.open}
        setAlert={setAlert}
        status={alert.status}
        message={alert.message}
      />
    </div>
  );
}
