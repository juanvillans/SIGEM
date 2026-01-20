import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Select from "@mui/material/Select";
import StoreIcon from "@mui/icons-material/Store";
import CheckIcon from "@mui/icons-material/Check";

// import Chip from '@material-ui/core/Chip';
import Input from "../components/Input";
import {
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Modal from "../components/Modal";
import Alert from "../components/Alert";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
// import { Suspense } from "react";
import MicIcon from "@mui/icons-material/Mic";

const filterConfiguration = {
  organizationName: "&organization[name]=",
  day: "&request-products[day]=",
  month: "&request-products[month]=",
  year: "&request-products[year]=",
  status: "&requestProduct[status]=",
  entityCodeDestiny: "&entityCodeDestiny=",
};
let filterObject = {};
let selectedProductsNewRegister = {};
const statutes = [
  { name: "Sin respuesta", id: "5" },
  { name: "Aceptadas", id: "6" },
  { name: "Rechazadas", id: "7" },
];

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
let tableSearchText = "";

const currentDate = new Date();
export default function Solicitudes(props) {
  const [generalData, setGeneralData] = useState({
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
    conditions: [],
    entitiesObject: {},
    entities: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const getEntities = async () => {
    await axios.get("/dashboard/relation?entities=true").then((response) => {
      setGeneralData((prev) => ({
        ...prev,
        entities: response.data.entities,
      }));
    });
  };

  useEffect(() => {
    document.title = "SIGEM | Solicitudes";
    getEntities();
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
    content: <></>,
  });

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    body: "",

    entity_code: props.userData.entityCode,
  });
  useEffect(() => {
    if (NewRegister?.products?.length >= 1) {
      localStorage.setItem("entryForm", JSON.stringify(NewRegister));
    }
  }, [NewRegister]);

  const [relation, setRelation] = useState(true);
  const [parametersURL, setParametersURL] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
    filter: "",
    total: 0,
    filterObjectValues: {
      status: "5",
      entityCode:
        props.userData.entityCode == 1 ? "*" : props.userData.entityCode,
    },

    filterList: [],
  });
  let selectedRowRquest = false;

  function handleSelectRow(row) {
    selectedRowRquest = row;
  }

  const columns = [
    {
      name: "day",
      label: "Dia",
      options: {
        display: "excluded",

        filter: true,
        filterList: parametersURL?.filterList[0] || [],

        filterOptions: {
          names: days,
        },
      },
    },
    {
      name: "month",
      label: "Mes",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[1] || [],

        filterOptions: {
          names: months,
        },
      },
    },
    {
      name: "year",
      label: "Año",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[2] || [],

        filterOptions: {
          names: generalData?.years,
        },
      },
    },

    {
      name: "id",
      label: "Cód",
      options: {
        filter: false,
      },
    },

    {
      name: "created_at",
      label: "Fecha",
      options: {
        filter: false,
      },
    },

    {
      name: "entityName",
      label: "Solicitado por",
      options: {
        display: props.userData.entityCode == 1 ? "true" : "excluded",
        filter: false,
        sort: true,
      },
    },
    {
      name: "status",
      label: "Estado",
      options: {
        filter: false,
        customBodyRender: (value) => {
          if (value == "unchecked") {
            return <p className="text-red">Pendiente</p>;
          } else {
            return <p className="text-green">Atendido</p>;
          }
        },
      },
    },

    // {
    //   name: "status",
    //   label: "Estado",
    //   options: {
    //     filter: false,
    //     filterList: parametersURL?.filterList[11] || [],
    //     sort: false,
    //     filterOptions: {
    //       names: ["Sin responder", "Cancelado"],
    //     },
    //   },
    // },
    // {
    //   name: "userFullName",
    //   label: "Registrado por",
    //   options: {
    //     filter: false,
    //   },
    // },
    {
      name: "body",
      label: "Mensaje",
      options: {
        filter: false,
      },
    },
    {
      name: "userFullName",
      label: "Registrado por",
      options: {
        display: false,
        filter: false,
      },
    },
  ];
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");

  // const [nameOptions, setNameOptions] = useState();

  const [authorityptions, setAuthorityptions] = useState(
    JSON.parse(localStorage.getItem("authorities")) || [
      { authorityFullname: "", authorityCi: "" },
    ],
  );

  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText }));
  }, 290);
  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    let url = `dashboard/service_requests?entity=${props.userData.entityCode == 1 ? "*" : props.userData.entityCode}`;
    url += `&page=${parametersURL.page}`;
    url += `&rowsPerPage=${parametersURL.rowsPerPage}`;

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
  }, [parametersURL]);

  const deleteRegister = async (obj, fnEmptyRows) => {
    try {
      await axios
        .delete(`dashboard/service_requests/${obj.id}`)
        .then((response) => {
          // setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
          setParametersURL((prev) => ({
            ...prev,
            page: 1,
            search: "",
            orderBy: "",
            orderDirection: "",
            filterObjectValues: {
              status: "5",
              entityCode:
                props.userData.entityCode == 1
                  ? "*"
                  : props.userData.entityCode,
            },
            filterObject,
            rowsPerPage: parametersURL.rowsPerPage,
            total: 0,
          }));

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

  // const [rowSelected, setRowSelected] = useState([])
  const options = {
    count: totalData,
    selectToolbarPlacement: "above",
    rowsExpanded: [],
    rowsSelected: [],
    print: false,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,
    download: false,
    viewColumns: false,
    showColumns: true,
    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },

    onChangeRowsPerPage: (numberOfRows) => {
      setParametersURL((prev) => ({
        ...prev,
        rowsPerPage: numberOfRows,
        page: totalData / numberOfRows < prev.page ? 1 : prev.page,
      }));
    },

    onFilterChange: (
      changedColumn,
      filterList,
      typeFilter,
      columnIndex,
      displayData,
    ) => {
      let arrValues = filterList[columnIndex];

      // let newFilterObject = { ...filterObject }; // Copia el objeto de filtro actual
      // let copyText= textFilterUrl
      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      if (arrValues.length > 0) {
        if (changedColumn == "entityCodeDestinyName") {
          changedColumn = "entityCodeDestiny ";
          for (let i = 0; i < generalData.entities.length; i++) {
            const element = generalData.entities[i];
            if (element.name == arrValues[0]) {
              arrValues = [element.code];
              break;
            }
          }
        }
        if (changedColumn == "status") {
          arrValues = arrValues.map((eachValue) =>
            eachValue == "Recibidos" ? 1 : 2,
          );
        }

        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
      }

      // setFilterObject(newFilterObject); // Actualiza el objeto de filtro
      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
      }));
    },

    onSearchChange: (searchText) => {
      handleSearch(searchText);
      tableSearchText = searchText;
    },

    onColumnSortChange: (changedColumn, direction) => {
      setParametersURL((prev) => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
        filterObject,
      }));
    },

    filterType: "multiselect",
    selectableRowsOnClick: true,
    onRowSelectionChange: () => {
      selectedRowRquest = false;
    },
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

    tableBodyMaxHeight: "68vh",
    // count: 2,

    // customSearchRender: debounceSearchRender(500),
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
      return (
        <div>
          {props.userData.entityCode == 1 && (
            <IconButton
              title="Resuelto"
              onClick={async (e) => {
                const selectedData = dataTable[selectedRows.data[0].dataIndex]
                 
                handleCheck(selectedData);
                // setIsButtonDisabled(true);
              }}
            >
              <CheckIcon />
            </IconButton>
          )}

          {props.userData.entityCode != 1 && (
            <>
              <IconButton
                title="Editar"
                onClick={() => {
                  editIconClick(selectedRows, "Editar");
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                title="Eliminar"
                onClick={() => {
                  if (
                    window.confirm("¿Está seguro de cancelar esta solicitud?")
                  ) {
                    deleteRegister(
                      {
                        id: dataTable[selectedRows.data[0].dataIndex].id,
                      },
                      setSelectedRows,
                    );
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </div>
      );
    },
    expandableRowsHeader: false,
    expandableRowsOnClick: false,
    expandableRows: false,
  };
  function editIconClick(selectedRows, submitText, isJustForCopy = false) {
    // const indx = selectedRows.data[0].dataIndex;
    const selectedData = dataTable[selectedRows.data[0].dataIndex];
    setNewRegister({
      ...selectedData,
    });
    setOpen(true);
    setSubmitStatus(submitText);
  }
  // console.log({selectedRow})

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      setTotalData(res.total);
      setDataTable(res.data.data);
      console.log(res);
      if (relation == true) {
        // let entitiesObject = {};
        // res.entities.forEach((obj) => {
        //   entitiesObject[obj.name] = obj.name;
        // });
        // setGeneralData({
        //   ...res,
        //   entitiesObject,
        //   requests: "",
        // });
      }
      setIsLoading(false);
      setRelation(false);
    });
  };

  // console.log(generalData.entitiesObject)
  const [submitStatus, setSubmitStatus] = useState("Crear solicitud");

  const handleCheck = async (data) => {
    try {
      await axios.put(`/dashboard/service_requests/${data.id}`, {...data, status: "checked" });
      setAlert({
        open: true,
        status: "Exito",
      });
       setParametersURL((prev) => ({
        ...prev,
        page: 1,
        search: "",
        orderBy: "",
        orderDirection: "",

        filterObjectValues: {
          status: prev.filterObjectValues.status,
        },
        filterObject,
        rowsPerPage: parametersURL.rowsPerPage,
        total: 0,
      }));
      
    } catch (error) {
      console.log(error);
      setAlert({
        open: true,
        status: "Error",
        message: error.response?.data?.message || "Algo salió mal",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus == "Cargando...") {
      return;
    }

    try {
      if (submitStatus === "Crear solicitud") {
        setSubmitStatus("Cargando...");
        await axios
          .post(`/dashboard/service_requests`, NewRegister)
          .then((response) => {});
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/service_requests/${NewRegister.id}`, NewRegister)
          .then((response) => {});
      }
      setAlert({
        open: true,
        status: "Exito",
      });
      setSubmitStatus("Crear solicitud");
      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        search: "",
        orderBy: "",
        orderDirection: "",

        filterObjectValues: {
          status: prev.filterObjectValues.status,
        },
        filterObject,
        rowsPerPage: parametersURL.rowsPerPage,
        total: 0,
      }));
      setOpen(false);
      const objAutority = {
        ...authorityptions,
        [NewRegister.authorityCi]: {
          authorityFullname: NewRegister.authorityFullname,
          authorityCi: NewRegister.authorityCi,
        },
      };

      localStorage.setItem("authorities", JSON.stringify(objAutority));

      setNewRegister({
        code: "",
        id: "",
        body: "",
        entityCodeDestiny: "",
        products: [],
      });
      selectedProductsNewRegister = {};
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
      setSubmitStatus(() =>
        NewRegister.entryCode > 0 ? "Editar" : "Crear solicitud",
      );
    }
  };

  function changeStatus(event) {
    filterObject["status"] = `&service_requests[status]=${event.target.value}`;
    setParametersURL((prev) => ({
      ...prev,
      page: 1,
      filter: Object.values(filterObject).join(""),
      filterObjectValues: {
        ...prev.filterObjectValues,
        status: event.target.value,
      },
      filterObject,
    }));
  }

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex flex-col md:flex-row gap-3 min-h-[55px] pt-3">
              <h1 className="text-grey md:text-xl relative top-1">
                Solicitudes 
              </h1>

             
            </div>
          </div>
        }
        data={dataTable}
        options={options}
        columns={columns}
      />,
    );
  }, [dataTable, generalData]);

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      {props.userData.entityCode != 1 ? ( //si es distinto a 1 es una entidad, si es 1 es un usuario
        <div className="flex gap-10 mt-4">
          <Button3D
            className="mt-2"
            color={"red"}
            text="Nueva Solicitud"
            icon={"add"}
            onClick={(e) => {
              if (submitStatus == "Editar") {
                setNewRegister({
                  code: "",
                  id: "",
                  body: "",
                  entity_code: props.userData.entityCode,
                });
              }
              setOpen(true);
              setSubmitStatus("Crear solicitud");
            }}
          />
        </div> //si es 1 es un usuario, entonces no se muestra el boton de nueva solicitud
      ) : (
        <div className="flex gap-10 mt-16"></div>
      )}

      <Modal
        show={open}
        width={"500px"}
        minHeight={"300px"}
        onClose={() => (isSearchHidden == "absolute" ? "" : setOpen(false))}
        content={
          <form
            onSubmit={handleSubmit}
            className=" w-full gap-4 grid grid-cols-4 "
          >
            <div className="col-span-4">
              <Input
                label={"Mensaje "}
                key={`body`}
                value={NewRegister.body}
                name={`body`}
                multiline
                // data-index={i}
                onChange={(e) => {
                  if (e.target.value.length < 240) {
                    setNewRegister((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }));
                  }
                }}
              />
            </div>

            <Button3D
              className="mt-3 col-span-4 "
              color={submitStatus == "Crear solicitud" ? "blue1" : "blue2"}
              text={submitStatus}
              onClick={(e) => {}}
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
    </>
  );
}
