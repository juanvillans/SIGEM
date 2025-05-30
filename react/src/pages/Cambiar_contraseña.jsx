import React, { useState, useEffect } from "react";
import LockIcon from "@mui/icons-material/Lock";
// import { TextField } from "@mui/material";
import InputWhite from "../components/InputWhite";

// import { styled } from "@mui/material/styles";
import Alert from "../components/Alert";
import axios from "../api/axios";

export default function Cambiar_contraseña(props) {
  const user = props.userData;
  const [showForm, setShowForm] = useState(true);

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });
  const [dataForNewPsw, setDataforNewPsw] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dataForNewPsw.oldPassword == dataForNewPsw.newPassword) {
      setAlert({
        open: true,
        status: "Error",
        message: "La contraseña nueva no puede ser la misma que la actual",
      });
    } else {
      try {
        await axios
          .post(`/dashboard/change-password`, dataForNewPsw)
          .then((response) => {
            setAlert({
              open: true,
              status: "Exito",
              message: response.data.Message || "",
            });
            sessionStorage.removeItem("x");
            setDataforNewPsw({
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          });
      } catch (error) {
        setAlert({
          open: true,
          status: "Error",
          message: error.response.data.errors
            ? Object.values(error.response.data.errors)[0][0]
            : error.response?.data?.message || "Algo salió mal",
        });
      }
    }
  };

  return (
    <>
      <div
        className="bg-white p-10 rounded-md mt-16"
        style={{
          background: "linear-gradient(128deg, rgba(255,255,255,1) 34%, rgba(191,4,4,1) 35%, rgba(1,17,64,1) 37%)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <div className="flex justify-between">
          <div className="max-w-[610px]">
            <h1 className="text-xl bold text-purple mb-2 ">
              PERFIL
            </h1>
            <ul className="text-xl">
              <li>
                Nombre/s: <b className="ml-2 text-base"> {user.name}</b>
              </li>
              <li>
                Apellido/s: <b className="ml-2 text-base"> {user.lastName}</b>
              </li>
              <li>
                C.I: <b className="ml-2 text-base"> {user.ci}</b>
              </li>
              {/* <li>
                Email: <b className="ml-2 text-base"> {user.email}</b>
              </li> */}
              <li>
                Tel: <b className="ml-2 text-base"> {user.phoneNumber}</b>
              </li>
              <li>
                Dirección: <b className="ml-2 text-base"> {user.address}</b>
              </li>
            </ul>
          </div>
          <form className="text-white " onSubmit={handleSubmit}>
            <button
              type="button"
              className="mb-6"
              onClick={() => setShowForm((prev) => !prev)}
            >
              <LockIcon /> Cambiar contraseña
            </button>
            {showForm && (
              <div className="gap-5 flex flex-col">
                <InputWhite
                  key={832349}
                  Color={"white"}
                  label={"Contraseña actual"}
                  required
                  size={"small"}
                  type="password"
                  onChange={(e) =>
                    setDataforNewPsw((prev) => ({
                      ...prev,
                      oldPassword: e.target.value,
                    }))
                  }
                  value={dataForNewPsw.oldPassword}
                />{" "}
                <InputWhite
                  key={8234249}
                  Color={"white"}
                  label={"Contraseña nueva"}
                  required
                  size={"small"}
                  type="password"
                  onChange={(e) =>
                    setDataforNewPsw((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  value={dataForNewPsw.newPassword}
                />{" "}
                <InputWhite
                  key={8234249}
                  Color={"white"}
                  label={"Contraseña nueva"}
                  required
                  size={"small"}
                  type="password"
                  value={dataForNewPsw.confirmPassword}
                  onChange={(e) =>
                    setDataforNewPsw((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />{" "}
              
                <button className=" border py-2 px-3 rounded-md bg-blue1 duration-100 text-white hover:font-bold hover:bg-blue3 hover:text-blue1 w-full ">
                  Aceptar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <Alert
        open={alert.open}
        status={alert.status}
        setAlert={setAlert}
        message={alert.message}
      />
    </>
  );
}
