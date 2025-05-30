import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
// import { debounceSearchRender } from "../components/DebounceSearchRender";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
// import Chip from '@material-ui/core/Chip';
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  organizationName: "&organization[name]=",
  day: "&entries[day]=",
  month: "&entries[month]=",
  year: "&entries[year]=",
};

export default function Usuarios(props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Usuarios";
  }, []);

  const [usuarios, setUsuarios] = useState([]);
  const [totalData, setTotalData] = useState(0);

  const [parametersURL, setParametersURL] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
    filter: "",
    total: 0,
    filterList: [],
    filterObjectValues: { entityCode: props.userData.entityCode },
  });

  const [entities, setEntities] = useState([]);
  const [modules, setModules] = useState([]);

  const columns = [
    {
      name: "entityName",
      label: "Institución",
      options: {
        filter: false,
        filterList: parametersURL?.filterList?.[0] || [],
        sort: true,

      },
    },

    {
      name: "name",
      label: "Nombres",
      options: {
        filter: false,
      },
    },
    {
      name: "lastName",
      label: "Apellidos",
      options: {
        filter: false,
      },
    },
    {
      name: "charge",
      label: "Cargo",
      options: {
        filter: false,
      },
    },
    {
      name: "ci",
      label: "Ci",
      options: {
        filter: false,
      },
    },
    {
      name: "address",
      label: "Dirección",
      options: {
        filter: false,
      },
    },
    {
      name: "phoneNumber",
      label: "Nro de. teléfono",
      options: {
        filter: false,
      },
    },
    {
      name: "email",
      label: "Correo",
      options: {
        filter: false,
      },
    },
  ];

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 400);

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);

      const data = response.data;
      const users = data.data;
      setTotalData(data.total);
      setEntities(data.entities);
      setUsuarios(users);
      setIsLoading(false);
      setTotalData(data.total);
      setModules(data.modules);
    });
  };

  const deleteUser = async (id_user, fnEmptyRows) => {
    try {
      // const id_user = usuarios[dataForDeleteUserindx].id;
      // const code = usuarios[dataForDeleteUser.indx].code;
      await axios.delete(`dashboard/users/${id_user}`).then((response) => {
        setParametersURL((prev) => ({ ...prev }));
        fnEmptyRows([]);
        setAlert({
          open: true,
          status: "Exito",
        });
      });
    } catch (error) {
      if (error.response.status == 403) {
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("apiToken");
        location.href = "../";
      }
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };

  let filterObject = {};

  useEffect(() => {
    let url = `dashboard/users?entity=${parametersURL.filterObjectValues.entityCode}&page=${parametersURL.page}&rowsPerPage=${parametersURL.rowsPerPage}`;

    if (parametersURL.search) {
      url += `&search[all]=${parametersURL.search}`;
    }
    if (parametersURL.filter.length > 0) {
      url += `${parametersURL.filter}`;
    }
    if (parametersURL.orderBy.length > 0) {
      url += `&orderBy=${parametersURL.orderBy}&orderDirection=${parametersURL.orderDirection}`;
    }
    getData(url);
    // url += `search?${parametersURL.search}`
    // console.log(parametersURL)
  }, [parametersURL]);

  // setTimeout(() => {
  //   const inputsFilter = document.querySelector(".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-4.css-zcmli0-MuiGrid-root");
  //     const filterChips = document.querySelectorAll(".tss-1vsygk-MUIDataTableFilterList-root div")
  //     // inputsFilter?.remove()
  //     filterChips?.forEach(chip => {
  //       chip.remove()
  //     })
  // }, 4000);

  const options = {
    download: false,
    viewColumns: false,
    filter: false,
    print: false,
    count: totalData,   
    selectToolbarPlacement: 'above',
    rowsExpanded: [],
    rowsSelected: [],
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,

    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },

    onChangeRowsPerPage: (numberOfRows) => {
      setParametersURL((prev) => ({ ...prev, rowsPerPage: numberOfRows, page:  (totalData / numberOfRows ) < prev.page ? 1 : prev.page }));
    },

    onFilterChange: (
      changedColumn,
      filterList,
      typeFilter,
      columnIndex,
      displayData
    ) => {
      let arrValues = filterList[columnIndex];

      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      // let copyText= textFilterUrl

      if (arrValues.length > 0) {
        // if (changedColumn === 'entityName') {
        //   filterObject[changedColumn] = '&entityCode=' + encodeURIComponent(arrValues.map(v => entities.find(obj => obj.name == v).code).join().replaceAll(',', '[OR]'));
        // } else {
        // filterObject[changedColumn] = `&users[${changedColumn}]=${encodeURIComponent(arrValues.join().replaceAll(',', '[OR]'))}`;
        filterObject[changedColumn] = `&entity[name]=${encodeURIComponent(
          arrValues.join().replaceAll(",", "[OR]")
        )}`;
        // }
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
      }
      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
      }));
    },

    onSearchChange: (searchText) => {
      handleSearch(searchText);
    },

    onColumnSortChange: (changedColumn, direction) => {
      setParametersURL((prev) => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
      }));
    },

    filterType: "multiselect",
    selectableRowsOnClick: true,
    selectableRowsHideCheckboxes: true,
    selectableRows: "single",
    fixedHeader: true,
    textLabels: {
        body: {
        noMatch: isLoading ? (
          <CircularProgress color="inherit" size={33} />
        ) : (
          "No se han encontrado datos"
        ),
      },
      pagination: {
        next: "Siguiente página",
        previous: "Anterior página",
        rowsPerPage: "Filas por pág",
        displayRows: "of",
      },
      toolbar: {
        search: "Buscar",
        viewColumns: "Ver Columnas",
        filterTable: "Filtrar Tabla",
      },
      filter: {
        all: "Todos",
        title: "FILTROS",
        reset: "RESETEAR",
      },
      viewColumns: {
        title: "Mostrar Columnas",
        titleAria: "Mostrar/Ocultar Columnas de la Tabla",
      },
      selectedRows: {
        text: "fila seleccionada",
        delete: "Eliminar",
        deleteAria: "Eliminar Filas Seleccionadas",
      },
    },
    tableBodyMaxHeight: "60vh",
    // count: 2,

    // customSearchRender: debounceSearchRender(500),
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
      <div>
        <IconButton
          title="Editar"
          onClick={() =>
            editIconClick(selectedRows, displayData, setSelectedRows)
          }
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar a este usuario?",
              aceptFunction: () =>
                deleteUser(
                  usuarios[selectedRows.data[0].dataIndex].id,
                  setSelectedRows
                ),
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    ),
  };

  function editIconClick(selectedRows, displayData, setSelectedRows) {
    const indx = selectedRows.data[0].dataIndex;
    setNewUserData({
      ...usuarios[indx],
      permissions: Object.keys(usuarios[indx].permissions),
    });
    setOpen(true);
    setSubmitStatus("Editar");
  }

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  const [newUserData, setNewUserData] = useState({
    entityCode: "",
    charge: "",
    name: "",
    lastName: "",
    ci: "",
    email: "",
    address: "",
    phoneNumber: "",
    permissions: [],
  });

  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e, indx) => {
    e.preventDefault();

    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("cargando...");
        await axios.post(`/dashboard/users`, newUserData).then((response) => {
          const user = response.data.user;
          // setUsuarios((prev) => [user, ...prev]);
        });
        setAlert({
          open: true,
          status: "Exito",
          message: "Es posible que necesite cerrar sesión e iniciar nuevamente para ver los cambios"
        });
        setSubmitStatus("Crear");
      }

      if (submitStatus === "Editar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/users/${newUserData.id}`, newUserData)
          .then((response) => {
            setAlert({
              open: true,
              status: "Exito",
           message: "Es posible que necesite cerrar sesión e iniciar nuevamente para ver los cambios"

            });
            // setUsuarios((prev) =>
            //   // prev.map((user) => (user.id === newUserEdit.id ? newUserEdit : user))
            // );
          });
      }

      setNewUserData({
        entityCode: "",
        charge: "",
        name: "",
        lastName: "",
        ci: "",
        email: "",
        address: "",
        phoneNumber: "",
        permissions: [],
      });
      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: `&user[entityCode]=${prev.filterObjectValues.entityCode}`,
        filterObjectValues: { entityCode: prev.filterObjectValues.entityCode },
        filterObject,
        rowsPerPage: parametersURL.rowsPerPage,
        total: 0,
      }));
      setOpen(false);
    } catch (error) {
      if (error.response.status == 403) {
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("apiToken");
        location.href = "../";
      }
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
      setSubmitStatus(() => (newUserData.id > 0 ? "Editar" : "Crear"));
    }
  };

  const [tabla, setTabla] = useState();

  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
         
            <div>
              <div className="flex flex-col md:flex-row gap-3 min-h-[55px]  pt-3">
                <h1 className="text-grey md:text-xl relative top-1 ">
                  Usuarios  {props.userData.entityCode == 1 && ('de')}
                </h1>
                {props.userData.entityCode == 1 && (
                  <span className="relative -top-2">
                    <Input
                      name="user_type"
                      id=""
                      select
                      value={parametersURL.filterObjectValues.entityCode}
                      // value={props.userData.entityCode}
                      size="small"
                      className="bg-blue/0 py-1 font-bold"
                      onChange={(e) => {
                        filterObject[
                          "entityCode"
                        ] = `&user[entityCode]=${e.target.value}`;
                        setParametersURL((prev) => ({
                          ...prev,
                          filter: Object.values(filterObject).join(""),
                          filterObjectValues: {
                            ...prev.filterObjectValues,
                            entityCode: e.target.value,
                          },
                          filterObject,
                          page: 1,
                        }));
                      }}
                      // value={user_type_selected}
                    >
                      {entities?.map((option) => (
                        <MenuItem key={`${option.code}-${option.value}}`} value={option.code}>
                          {option.name}
                        </MenuItem>
                      ))}
                      {/* <MenuItem key={"*"} value={"*"}>
                        Todos
                      </MenuItem> */}
                    </Input>
                  </span>
                )}
              </div>
            </div>
          
        }
        data={usuarios}
        columns={columns}
        options={options}
      />
    );
  }, [usuarios]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setNewUserData((prev) => ({ ...prev, [name]: value }));
    // console.log(newUserData);
  }, []);
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      // Add the checkbox value to the array
      setNewUserData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, value],
      }));
    } else {
      // Remove the checkbox value from the array

      setNewUserData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((item) => item !== value),
      }));
    }
  };
  // console.log({ newUserData });
  return (
    <>
      <div className="flex">
        <Button3D
          className="mt-2"
          color={"red"}
          text="Nuevo"
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setNewUserData({
                entityCode: "",
                charge: "",
                name: "",
                lastName: "",
                ci: "",
                email: "",
                address: "",
                phoneNumber: "",
                permissions: [],
              });
            }
            setOpen(true);
            setSubmitStatus("Crear");
          }}
        />
      </div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form
            onSubmit={handleSubmit}
            className=" md:w-[500px] gap-4 grid grid-cols-2 "
          >
            <Input
              select
              label="Institución"
              value={newUserData.entityCode}
              defaultValue=""
              width={"100%"}
              required
              name={"entityCode"}
              onChange={handleChange}
            >
              {entities.map((option) => (
                <MenuItem key={`${option.code}-${option.name}}`} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </Input>
            <Input
              label={"Cargo"}
              required
              key={0}
              name={"charge"}
              onChange={handleChange}
              value={newUserData?.charge}
            />
            <Input
              label={"Nombre/s"}
              required
              key={10}
              name={"name"}
              onChange={handleChange}
              value={newUserData?.name}
            />
            <Input
              label={"Apellido/s"}
              required
              key={1}
              name={"lastName"}
              onChange={handleChange}
              value={newUserData?.lastName}
            />
            <Input
              label={"CI"}
              required
              key={2}
              name={"ci"}
              onChange={handleChange}
              value={newUserData?.ci}
            />
            <Input
              key={5}
              id={"outlined-textarea"}
              label={"Dirección"}
              multiline
              name={"address"}
              value={newUserData?.address}
              onChange={handleChange}
            />
            <Input
              label={"Nro de teléfono"}
              type={"tel"}
              key={3}
              minLength={10}
              maxLength={11}
              // InputProps={{ maxLength: 14, minLength: 10 }}
              name={"phoneNumber"}
              value={newUserData?.phoneNumber}
              onChange={handleChange}
              required
            />
            <Input
              type={"email"}
              label={"Correo"}
              value={newUserData?.email}
              name={"email"}
              onChange={handleChange}
              required
            />
            <fieldset>Permisos:</fieldset>
            <div className="col-span-2">
              {Object.entries(modules)?.map(([key, value]) => {
                return (
                  <label  key={value+key} className="block py-1 cursor-pointer hover:text-blue1 hover:font-bold">
                    <input
                      type="checkbox"
                      value={key}
                      checked={newUserData.permissions.some((v) => v == key)}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    {value}
                  </label>
                );
              })}
            </div>
            <Button3D
              className="mt-2 col-span-2"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
              text={submitStatus}
              fClick={(e) => {}}
            />
          </form>
        }
      ></Modal>
      {tabla}

      <Alert
        open={alert.open}
        setAlert={setAlert}
        status={alert.status}
        message={alert.message}
      />

      <ConfirmModal
        closeModal={() => {
          setModalConfirm({ isOpen: false });
          // setRowSelected([])
        }}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={() => modalConfirm.aceptFunction()}
      />
    </>
  );
}
