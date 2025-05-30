import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import StorageIcon from "@mui/icons-material/Storage";


const pageNotificationDictionary = {
  1: {
    pathname: "PedidosAMiAlmacen",
    state: "requestMyInventory",
    icon: <AssignmentIcon className="text-xs text-blue3 mr-2" />,
  },
  2: {
    pathname: "EntradasPorConfirmar",
    state: "requestMyInventory",
    icon: <AssignmentTurnedInIcon className="text-xs text-blue3 mr-2" />,
  },
  3: {
    pathname: "CantidadCritica",
    state: "requestMyInventory",
    icon: <ErrorOutlineIcon className="text-xs text-blue3 mr-2" />,
  },
  4: {
    pathname: "ProductosPorExpirar",
    state: "requestMyInventory",
    icon: <StorageIcon className="text-orange-500 text-xs text-blue3 mr-2" />,
  },
  5: {
    pathname: "ProductoVencido",
    state: "requestMyInventory",
    icon: <StorageIcon className="text-red-800 text-xs text-blue3 mr-2" />,
  },
};

function timeAgo(dateString) {
  const now = new Date();
  const pastDate = new Date(dateString);
  const seconds = Math.floor((now - pastDate) / 1000);
  let interval = Math.floor(seconds / 31536000); // Años

  if (interval >= 1) {
    return interval === 1 ? "hace 1 año" : `hace ${interval} años`;
  }
  interval = Math.floor(seconds / 2592000); // Meses
  if (interval >= 1) {
    return interval === 1 ? "hace 1 mes" : `hace ${interval} meses`;
  }
  interval = Math.floor(seconds / 86400); // Días
  if (interval >= 1) {
    return interval === 1 ? "hace 1 día" : `hace ${interval} días`;
  }
  interval = Math.floor(seconds / 3600); // Horas
  if (interval >= 1) {
    return interval === 1 ? "hace 1 hora" : `hace ${interval} horas`;
  }
  interval = Math.floor(seconds / 60); // Minutos
  if (interval >= 1) {
    return interval === 1 ? "hace 1 minuto" : `hace ${interval} minutos`;
  }
  return "justo ahora";
}
let buttonClickedOnce = false
let previusNumberOfNoti = 0;
export default function TopNavbar(props) {


  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsCounts, setNotificationsCounts] = useState(
    {count: props.notificationsCount, n: props.notificationsCount}
  );
  
  const notificationRef = useRef(null);
  const [page, setPage] = useState(1); // Track the current page
  const [loading, setLoading] = useState(false); // Prevent multiple requests
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setNotificationsCounts(props.notificationsCount);
    if (props.notificationsCount.count > 0) {
      setHasMore(true);
      buttonClickedOnce = false
    }
  }, [props.notificationsCount.n]);

  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setOpenNotification(false);
    }
  };
  // useEffect(() => {
  //   let sum = 0
  //   for (let i = 0; i < props.notifications.length; i++) {
  //     if (props.notifications[i].read_at !== null) {
  //       sum++
  //     }

  //   }
  //   // setNotificationCounts
  // }, [props.notifications]);
  useEffect(() => {
    if (openNotification) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openNotification]);
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post("dashboard/logout");
      localStorage.removeItem("userData");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("apiToken");

      // navigate("/dashboard/")
      // history.replaceState(null, null, location.href);
      // sessionStorage.setItem('isLoggedIn', false);
      location.href = "../";
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetMoreNotifications = async (page, typeAction) => {
    previusNumberOfNoti = notificationsCounts.count;

    if (loading || !hasMore) return; // Prevent multiple requests

    setLoading(true);
    try {
      const response = await axios.get(`dashboard/notifications?page=${page}`);
      const newNotifications = response.data.data.data;

      if (newNotifications.length === 0) {
        setHasMore(false); // No more notifications to load
      } else {
        if (typeAction == "button") {
          setNotifications([...newNotifications]); // Append new notifications
          setPage(2); // Increment page
          buttonClickedOnce = true
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]); // Append new notifications
          setPage((prev) => prev + 1); // Increment page
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll event
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Check if the user has scrolled to the bottom
    // setHasMore(true)
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore) {
      handleGetMoreNotifications(page, "scroll");
    }
  };

  return (
    <div className="topNabvar absolute p-4 pb-0 right-0 top-4 ">
      <div className="flex gap-5">
        <div className="relative" ref={notificationRef}>
          <button
            className="cursor-pointer hover:bg-light rounded-full"
            title="notificaciones"
            onClick={() => {
              setOpenNotification((prev) => !prev);
              if (!buttonClickedOnce) {
                handleGetMoreNotifications(1, "button");
                setNotificationsCounts(0);
              }
            }}
          >
            {notificationsCounts.count > 0 ? (
              <>
                <NotificationsIcon className="text-blue1"></NotificationsIcon>
                <span className="absolute left-3.5 -top-1 bg-red aspect-square inline-block w-4 text-center font-bold text-xs text-white rounded-full">
                  {notificationsCounts.count}
                </span>
              </>
            ) : (
              <>
                <NotificationsNoneIcon className="text-dark" />
              </>
            )}
          </button>
          {openNotification && (
            <div
              onScroll={handleScroll}
              style={{ maxHeight: `calc(100vh - 100px)` }}
              className="overflow-y-scroll  animate-flip-down animate-duration-100 absolute z-10 right-0  min-w-[320px] border-dark  rounded-xl rounded-tr-none box-shadow text-light"
            >
              <ul className="divide-y divide-dark text-xs ">
                {notifications.map((eachNoti, i) => {
                  return (
                    <li
                      key={eachNoti.id + "_" + i}
                      className={`${
                        i < previusNumberOfNoti
                          ? "brightness-110"
                          : "brightness-75"
                      } bg-blue1`}
                    >
                      <div
                        // to={{
                        //   pathname: pageNotificationDictionary[eachNoti.data.type].pathname,
                        //   state: {peeo: "sexo"}
                        // }}
                        // href={pageNotificationDictionary[eachNoti.data.type].link+`&requestMyInventory[id]=${eachNoti.data.id}`}
                        className="p-3 block  hover:brightness-125"
                        // target="_blank"
                        rel="noopener noreferrer "
                      >
                        <header className="w-full sm:flex justify-between">
                          <div className="flex">
                            {
                              pageNotificationDictionary[eachNoti.data.type]
                                .icon
                            }

                            <h3 className="font-bold mb-1">
                              {eachNoti.data.Title}
                            </h3>
                          </div>
                          <time className="opacity-70 text-xs">
                            {timeAgo(eachNoti.data.date)}
                          </time>
                        </header>
                        <span className=" opacity-90">
                          {eachNoti.data.message}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {loading && (
                <div className="p-3 text-center bg-blue2 text-white">
                  Cargando...
                </div>
              )}

              {/* No more notifications */}
              {!hasMore && (
                <div className="p-3 text-center bg-blue2 text-white">
                  No hay más notificaciones.
                </div>
              )}
            </div>
          )}
        </div>
        <div className="user_info cursor-pointer hover:underline z-10">
          <span className="opacity-75 mr-3 z-50">
            <AccountCircleIcon></AccountCircleIcon>
          </span>

          <div className="user_actions z-50 absolute transition hidden rounded-md shadow-md bg-white p-4 w-56 top-13 right-5 text-right ">
            <ul>
              <li className="font-bold  border-b border-b-grey mb-3">
                <span className="mr-2 ">
                  {" "}
                  {props?.userData?.name} {props?.userData?.lastName}{" "}
                </span>
                {/* <span className="mr-2"> '{props.userData.name + ' ' + props.userData.last_name}' </span> */}
              </li>
              <li className="mb-1 hover:text-purple hover:text-blue1 hover:bg-blue3">
                <Link to="/dashboard/cambiar_contraseña">
                  Cambiar contraseña
                </Link>
              </li>
              <li className=" hover:text-blue1 hover:bg-blue3">
                <a href="" onClick={handleLogout}>
                  Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
