import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";
import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import BadgeIcon from "@mui/icons-material/Badge";
import HistoryIcon from "@mui/icons-material/History";
import InputAdornment from "@mui/material/InputAdornment";
import MicIcon from "@mui/icons-material/Mic";

import ProductSummary from "../components/ProductSummary";
// import Chip from '@material-ui/core/Chip';
import {
  IconButton,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import InputWhite from "../components/InputWhite";

import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  medicamentName: "&medicament[name]=",
  organizationName: "&organization[name]=",
  day: "&outputs[day]=",
  month: "&outputs[month]=",
  year: "&outputs[year]=",
  municipalityName: "&municipality[name]=",
  status: "&outputs[status]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
const statutes = {
  1: "En proceso",
  2: "Cancelado",
  3: "Despachado",
  4: "Retrasado",
};
let tableSearchText = "";

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0"); // Get hours and pad with zero if needed
  const minutes = String(now.getMinutes()).padStart(2, "0"); // Get minutes and pad with zero if needed
  return `${hours}:${minutes}`; // Format as "HH:MM"
}

export default function Salidas(props) {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const guideNumberInput = document.querySelector("#guideNumber");
      if (guideNumberInput && guideNumberInput === document.activeElement) {
        event.preventDefault();
        requestGuide("id", guideNumberInput.id);
      }
    }
  });

  const [organizations, setOrganizations] = useState([]);

  const [relation, setRelation] = useState(true);

  const [parametersURL, setParametersURL] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
    filter: "",
    total: 0,
    filterList: [],
    filterObjectValues: {
      entityCode: props.userData.entityCode,
      organizationObj: { name: "", organizationId: null },
    },
  });

  const [open, setOpen] = useState(false);
  const [modalPdf, setModalPdf] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  let date = new Date().toISOString().split("T")[0];
  const [NewRegister, setNewRegister] = useState({
    id: null,
    area: "",
    inventory_general_id: "",
    departure_time: getCurrentTime(),
    description: "",
    organizationObject: { name: "", organizationId: null },
    departure_date: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");
  const [localStorageForm, setLocalStorageForm] = useState(false);

  useEffect(() => {
    document.title = "SIGEM | Salidas";

    if (localStorage.getItem("outputForm")) {
      setLocalStorageForm(JSON.parse(localStorage.getItem("outputForm")));
    }
  }, []);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        if (isSearchHidden == "absolute") {
          setIsSearchHidden("hidden");
        } else {
          setOpen(false);
          setIsSearchHidden("hidden");
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isSearchHidden]);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    conditions: [],
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    municipalities: [],
    organizations: [{ id: 1, name: "Paciente" }],
    entitiesObject: {},
  });

  // useEffect(() => {
  //   localStorage.setItem('outputForm', JSON.stringify(NewRegister))
  // }, [NewRegister]);

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
      name: "entity_name",
      label: "Entidad",
      options: {
        display:
          parametersURL?.filterObject?.entity_code == "&entries[entity_code]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
    {
      name: "code",
      label: "Cód.",
      options: {
        filter: false,
      },
    },
    {
      name: "departure_date",
      label: "Fecha",
      options: {
        filter: false,
      },
    },
    
    {
      name: "organizationObj",
      label: "Destino",
      options: {
        filter: false,
        customBodyRender: (value) => {
          if (value.code.toLowerCase() !== "nocode") {
            return (
              <div className="flex">
                <p>
                  {" "}
                  <span className="text-blue1">
                    <StoreIcon style={{ fontSize: "15px" }} />
                  </span>{" "}
                  {value.name}
                </p>
              </div>
            );
          } else {
            return <p>{value.name}</p>;
          }
        },
      },
    },
   
    {
      name: "productObj",
      label: "Equipo",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return <ProductSummary product={value} />;
        },
      },
    },
    
    {
      name: "serial_number",
      label: "Serial",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "national_code",
      label: "Bien Nacional",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "machine_status_name",
      label: "Estado",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "components",
      label: "Componentes",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          // Si no hay componentes o el objeto está vacío
          if (!value || Object.keys(value).length === 0) return "N/A";

          // Convertir el objeto en un array de componentes FALTANTES (false)
          const missingComponents = Object.entries(value)
            .filter(([_, isIncluded]) => !isIncluded) // Filtra los que tienen false
            .map(([component]) => component); // Extrae solo el nombre

          // Caso 1: No hay componentes faltantes
          if (missingComponents.length === 0) {
            return (
              <span className="text-white p-auto font-bold text-xs px-2 py-1 rounded bg-green">
                Incluidos
                <CheckIcon className="pb-1"></CheckIcon>
              </span>
            );
          }

          // Caso 2: Hay componentes faltantes
          return (
            <div className="relative group">
              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {/* Mostrar los primeros 3 faltantes (color amarillo) */}
                <p className="text-xs py-1 ">Faltan:</p>
                {missingComponents.slice(0, 3).map((comp, i) => (
                  <span
                    key={i}
                    className="bg-orange text-white text-center text-xs px-2 py-1 rounded"
                  >
                    {comp}
                  </span>
                ))}

                {/* Botón "Más" si hay más de 3 faltantes */}
                {missingComponents.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      document
                        .getElementById(
                          `missing-components-${tableMeta.rowIndex}`
                        )
                        .classList.toggle("hidden");
                    }}
                    className="text-xs p-1 rounded border border-gray-300 text-grey"
                  >
                    +{missingComponents.length - 3} faltantes
                  </button>
                )}
              </div>

              {/* Popup con TODOS los faltantes (solo visible al hacer clic) */}
              <div
                id={`missing-components-${tableMeta.rowIndex}`}
                className="hidden absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md p-2 border border-grey"
              >
                <div className="flex flex-wrap gap-1">
                  {missingComponents.map((comp, i) => (
                    <span
                      key={i}
                      className="bg-orange text-white text-xs px-2 py-1 rounded mb-1"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "user_name",
      label: "Registrado por",
      options: {
        filter: false,
        sort: false,
        display: "excluded",
      },
    },
  ];

  const searchRef = useRef(null);

  const [productsSearched, setProductsSearched] = useState([]);

  const [searchProductText, setSearchProductText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    document.querySelector("#searchInput").focus();
    setProductsSearched("Buscando...");

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.start();

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchProductText(
        transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );

      setIsListening(false);
      handleSearchForSelect(
        transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
      if (isSearchHidden == "hidden") {
        setIsSearchHidden("absolute");
      }
    };

    recognition.onerror = () => setIsListening(false);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        startListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startListening]);
  const handleSearchForSelect = useDebounce(async (searchText) => {
    try {
      const response = await axios.get(
        `dashboard/inventories?search[all]=${searchText}&rowsPerPage=15&entity=${props.userData.entityCode}`
      );
      const responseSearch = response.data.inventories;
      if (responseSearch.length > 0) {
        setProductsSearched(responseSearch);
      } else {
        setProductsSearched("No se encontró ningún producto");
      }

      // Realiza las acciones necesarias con la respuesta de la solicitud
    } catch (error) {
      // Maneja los errores de la solicitud
    }
  }, 290);

  const handleSearchOrganizations = useDebounce(async (searchText) => {
    if (searchText.trim().length > 0) {
      try {
        const response = await axios.get(
          `dashboard/organizations?search[all]=${searchText}`
        );
        const responseSearch = response.data.data;
        setOrganizations(responseSearch);
      } catch (error) {
        // Maneja los errores de la solicitud
      }
    }
  }, 290);

  const [person, setPerson] = useState({
    authorityFullname: "",
    authorityCi: "",
  });
  // const [nameOptions, setNameOptions] = useState();

  const authoritiesOptions = JSON.parse(
    localStorage.getItem("authorities")
  ) || [{ authorityFullname: "", authorityCi: "" }];

  const handleInputChange = (event, value) => {
    setNewRegister((prev) => ({
      ...prev,
      authorityFullname: value,
      authorityCi: "",
    }));

    // Aquí puedes realizar alguna acción adicional según tus necesidades cuando el texto del nombre cambie
  };

  const handleOptionSelect = (event, value) => {
    if (value) {
      setNewRegister((prev) => ({
        ...prev,
        authorityFullname: value.authorityFullname,
        authorityCi: value.authorityCi,
      }));
    }
  };

  const handleOptionSelectOrganizations = (event, value) => {
    if (value) {
      setNewRegister((prev) => ({
        ...prev,
        organizationId: value.id,
        organization_id: value.id,
        organizationName: value?.name,
        organizationObject: {
          organizationId: value.id,
          name: value?.name,
        },
        municipalityId: value?.municipalityId,
        parishId: value?.parishId,
      }));
    }
  };
  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})
  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 290);
  useEffect(() => {
    let url = `dashboard/outputs?entity=${parametersURL.filterObjectValues.entityCode}&relation=${relation}`;
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
      await axios.delete(`/dashboard/outputs/${obj.ID}`).then((response) => {
        // setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
        setParametersURL((prev) => ({
          ...prev,
          page: 1,
          rowsPerPage: parametersURL.rowsPerPage,
          search: "",
          orderBy: "",
          orderDirection: "",
          filter: `&outputs[entityCode]=${prev.filterObjectValues.entityCode}`,
          filterObjectValues: {
            entityCode: prev.filterObjectValues.entityCode,
          },
          filterObject,
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

  const editIconClick = async (rowData, submitText, isJustForCopy = false) => {
    console.log({ rowData });
    setOrganizations([
      {
        id: rowData.organization_id || null,
        name: rowData.organization_name,
      },
    ]);
    setNewRegister({
      ...rowData,
      departure_date: new Date(rowData.departure_date)
        .toISOString()
        .split("T")[0],
      organizationObject: {
        organizationId: rowData.organization_id,
        name: rowData?.organization_name,
        code: rowData?.organization_code,
      },
    });

    setOpen(true);
    setSubmitStatus(submitText);
  };

  // const [rowSelected, setRowSelected] = useState([])
  const options = {
    count: totalData,
    selectToolbarPlacement: "above",
    print: false,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,
    download: false,

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
      displayData
    ) => {
      let arrValues = filterList[columnIndex];
      // let newFilterObject = { ...filterObject }; // Copia el objeto de filtro actual
      // let copyText= textFilterUrl
      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      if (arrValues.length > 0) {
        filterObject[changedColumn] = `${filterConfiguration[changedColumn]
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
        filterObject,
      }));
    },

    onSearchChange: (searchText) => {
      handleSearch(searchText);
      tableSearchText = searchText;
    },

    onColumnSortChange: (changedColumn, direction) => {
      if (changedColumn == "organizationObj") {
        changedColumn = "organizationName";
      }
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
    tableBodyMaxHeight: "68vh",
    // count: 2,

    // customSearchRender: debounceSearchRender(500),
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
      console.log({ displayData, selectedRows });
      const dataIndex = selectedRows.data[0].dataIndex;
      const rowData = dataTable[dataIndex];
      return (
        <div>
          {/* <IconButton
            title="copiar"
            onClick={async () => {
              console.log(selectedRows, displayData, setSelectedRows);
              const selectedRow = selectedRows.data[0];
              await editIconClick(rowData, "Crear", true);
            }}
          >
            <ContentCopyIcon />
          </IconButton> */}

          {dataTable[selectedRows.data[0].dataIndex]?.status != 2 &&
            dataTable[selectedRows.data[0].dataIndex]?.status != 3 && (
              <>
                <IconButton
                  title="Editar"
                  onClick={() => {
                    editIconClick(rowData, "Editar", true);
                  }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  title="Eliminar"
                  onClick={() => {
                    setModalConfirm({
                      isOpen: true,
                      modalInfo: (
                        <>
                          <p className="mb-2">
                            Está seguro que cancelará esta salida?
                          </p>
                        </>
                      ),
                      aceptFunction: () => {
                        console.log({ rowData });
                        deleteRegister({
                          ID: rowData.id,
                        });
                      },
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
        </div>
      );
    },

    setRowProps: (row, dataIndex, rowIndex) => {
      if (dataTable[dataIndex].status == "2") {
        return {
          className: 'strikethrough-row',
          style: {
            opacity: ".8",
            textDecoration: "line-through",
            background: "#f3f3f3",
            color: "red",
          },
        };
      }
    },
  };

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;

      setTotalData(res.total);

    
      setDataTable(res.outputs);
      setIsLoading(false);
    });

    setRelation(false);
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitStatus === "Cargando...") {
      return;
    }
    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("Cargando...");
        await axios
          .post(`/dashboard/outputs`, NewRegister)
          .then((response) => { });
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/outputs/${NewRegister.id}`, NewRegister)
          .then((response) => { });
      }

      setAlert({
        open: true,
        status: "Exito",
        message: "Salida guardada",
      });
      setOpen(false);

      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        rowsPerPage: parametersURL.rowsPerPage,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: `&outputs[entityCode]=${prev.filterObjectValues.entityCode}`,
        filterObjectValues: { entityCode: prev.filterObjectValues.entityCode },
        filterObject,
        total: 0,
      }));

      setSubmitStatus("Crear");
      setSearchProductText("");
      setProductsSearched([]);

      setNewRegister({
        id: null,
        area: "",
        inventory_general_id: "",
        departure_time: getCurrentTime(),
        description: "",
        organizationObject: { name: "", organizationId: null },
        departure_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error?.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
      setSubmitStatus(() => (NewRegister.id != null ? "Editar" : "Crear"));
    }
  };
  const [hasLoadedRelations, setHasLoadedRelations] = useState(false);

  useEffect(() => {
    if (!hasLoadedRelations) {
      axios
        .get(`/dashboard/relation?entities=true&outputsYears=true`)
        .then((res) => {
          if (res.data.entities) {
            const entitiesObject = {};
            res.data.entities.forEach((obj) => {
              entitiesObject[obj.name] = obj.name;
            });
            setGeneralData((prev) => ({
              ...prev,
              entitiesObject,
              entities: res.data.entities,
              years: res.data.outputsYears,
            }));
          }
          setHasLoadedRelations(true);
        })
        .catch((err) => {
          console.error("Error al cargar datos relacionados:", err);
        });
    }
  }, [hasLoadedRelations, parametersURL.filterObjectValues.entityCode]);

  console.log(generalData.entities);
  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex flex-col md:flex-row gap-3 min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">
                Salidas {props.userData.entityCode == 1 && "de"}
              </h1>

              {props.userData.entityCode == 1 && (
                <span className="relative -top-2">
                  <Input
                    name="user_type"
                    id=""
                    select
                    value={parametersURL?.filterObjectValues?.entityCode}
                    // value={props.userData.entityCode}
                    size="small"
                    className="bg-blue/0 py-1 font-bold"
                    onChange={(e) => {
                      filterObject[
                        "entityCode"
                      ] = `&outputs[entityCode]=${e.target.value}`;
                      setParametersURL((prev) => ({
                        ...prev,
                        filter: Object.values(filterObject).join(""),
                        page: 1,
                        filterObjectValues: {
                          ...prev.filterObjectValues,
                          entityCode: e.target.value,
                        },
                        filterObject,
                      }));
                    }}
                  // value={user_type_selected}
                  >
                    {generalData.entities?.map((option) => (
                      <MenuItem key={option.code} value={option.code}>
                        {option.name}
                      </MenuItem>
                    )) || <MenuItem value={""}></MenuItem>}
                    {/* <MenuItem key={"todos"} value={"*"}>
                      Todos
                    </MenuItem> */}
                  </Input>
                </span>
              )}
            </div>
          </div>
        }
        data={dataTable}
        columns={columns}
        options={options}
      />
    );
  }, [dataTable, generalData.entities]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setNewRegister((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="md:flex items-center justify-between">
        <div className="flex gap-10">
          <Button3D
            className="mt-2"
            color={"red"}
            text="Nueva Salida"
            icon={"add"}
            onClick={(e) => {
              console.log("abriendo");
              setNewRegister((prev) => ({
                ...prev,
                departure_time: getCurrentTime(),
              }));
              if (submitStatus == "Editar") {
                setNewRegister({
                  id: null,
                  area: "",
                  inventory_general_id: "",
                  departure_time: getCurrentTime(),
                  description: "",
                  organizationObject: { name: "", organizationId: null },
                  departure_date: new Date().toISOString().split("T")[0],
                });
              }
              setOpen(true);
              setSubmitStatus("Crear");
            }}
          />

          {localStorageForm && (
            <div
              className="cursor-pointer mt-3 d-flex "
              onClick={(e) => {
                setOpen(true);
                setNewRegister(localStorageForm);
                setLocalStorageForm(false);
              }}
            >
              <HistoryIcon></HistoryIcon>
              <p className="inline pl-2">Restaurar formulario</p>
            </div>
          )}
        </div>

        <Autocomplete
          className="md:min-w-[290px] md:mr-28"
          size={"small"}
          id="destinyFilter"
          options={organizations}
          getOptionLabel={(option) => option?.name || ""} // Ensure a string is always returned
          value={parametersURL?.filterObjectValues?.organizationObj || null} // Use null for empty value
          onChange={(e, newValue) => {
            // console.log(newValue);

            // Update the filter object and parametersURL state
            if (newValue) {
              filterObject[
                "organizationObj"
              ] = `&outputs[organizationId]=${newValue.id}`;
            } else {
              delete filterObject["organizationObj"]; // Remove the organization filter if newValue is null
            }

            setParametersURL((prev) => ({
              ...prev,
              filter: Object.values(filterObject).join(""),
              page: 1,
              filterObjectValues: {
                ...prev.filterObjectValues,
                organizationObj: newValue, // Set to null if cleared
              },
              filterObject,
            }));
          }}
          onInputChange={(e, newValue, reason) => {
            if (reason === "clear") {
              // Handle the clear action explicitly
              setParametersURL((prev) => ({
                ...prev,
                filterObjectValues: {
                  ...prev.filterObjectValues,
                  organizationObj: null, // Clear the value
                },
              }));
            } else {
              // Handle search input changes
              handleSearchOrganizations(
                e?.target?.value || NewRegister?.organizationObject?.name || ""
              );
            }
          }}
          renderOption={(propsAutocomplete, option) => {
            const { key, ...optionProps } = propsAutocomplete;
            return (
              <Box
                key={option.name + option.id}
                component="li"
                sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                {...optionProps}
              >
                {option.code !== props?.userData?.entityCode && (
                  <p className="text-xs" style={{ fontSize: "14px" }}>
                    <span style={{ color: "#011140", marginRight: "5px" }}>
                      {option.code !== "nocode" && <StoreIcon />}
                    </span>
                    {option.name}
                  </p>
                )}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              className="text-xs"
              required
              key={params}
              {...params}
              label="Filtrar por destino"
            />
          )}
        />
      </div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        width={"w-[99%]"}
        content={
          <form
            onSubmit={handleSubmit}
            className=" gap-4 grid grid-cols-3 "
            id="outputForm"
          >
            <div className="col-span-3">
              <div className="flex items-center gap-3 rounded-t-lg  bg-light text-dark p-4 relative">
                <b>Productos:</b>
                <Input
                  label="Buscar productos"
                  type="search"
                  key={842793}
                  id="searchInput"
                  name={`e${Math.random()}`}
                  value={searchProductText}
                  className="max-w-[300px] "
                  // autoComplete={"off"}
                  autoComplete="random-string-123"
                  size={"small"}
                  onFocus={(e) => {
                    if (isSearchHidden == "hidden") {
                      setIsSearchHidden("absolute");
                    }
                    if (e.target.value.trim() == "") {
                      setIsSearchHidden("hidden");
                    }
                  }}
                  // Color={"white"}
                  onChange={(e) => {
                    setProductsSearched("Buscando...");
                    handleSearchForSelect(e.target.value);
                    setSearchProductText(e.target.value);
                    if (isSearchHidden == "hidden") {
                      setIsSearchHidden("absolute");
                    }
                    if (e.target.value.trim() == "") {
                      setIsSearchHidden("hidden");
                    }
                    // document.addEventListener("click", handleClickOutside);
                  }}
                  onBlur={(e) => {
                    // setTimeout(() => {
                    // setIsSearchHidden("hidden");
                    // }, 100);
                  }}
                  // Color={"dark"}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <SearchIcon className="text-dark" />
                        </InputAdornment>

                        <button
                          className="hover:text-blue2"
                          title="(Ctrl+Espacio) Dictar por voz "
                          onClick={startListening}
                          disabled={isListening}
                        >
                          {isListening ? "Escuchando..." : <MicIcon />}
                        </button>
                      </>
                    ),
                  }}
                />
                <div
                  ref={searchRef}
                  id="searchWindow"
                  className={`bg-ligther shadow-2xl  absolute left-0 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[73px] z-50   ${isSearchHidden}`}
                >
                  <table className="">
                    <thead>
                      <tr className="header pb-0 text-left bg-ligther text-dark text-xs">
                        <th className="py-2">Cód.</th>
                        <th className="py-2">Equipo</th>
                        
                        <th className="py-2">Serial</th>
                        <th className="py-2">Bien Nacional</th>
                        <th className="py-2">Estado</th>
                        <th className="py-2">Componentes</th>
                      </tr>
                    </thead>
                    {typeof productsSearched == "string" ? (
                      <p className="col-span-8 text-center py-4 font-bold">
                        {productsSearched}
                      </p>
                    ) : (
                      <tbody>
                        {productsSearched?.map((product, i) => (
                          <tr
                            key={`${product.product_code}+${i}`}
                            className="body border-b border-b-grey border-opacity-10 text-black items-center hover:bg-blue1 hover:text-white cursor-pointer py-3"
                            onMouseDown={() => {
                              setIsSearchHidden("hidden");
                              setNewRegister((prev) => ({
                                ...prev,
                                inventory_general_id: product.id, // This ID is inventory_general_id
                                ...product,
                                id: prev.id,
                                area: "",

                              }));
                            }}
                          >
                            <td className="p-2 px-6">{product.product_code}</td>
                            <td className="p-2 px-6">
                              <ProductSummary product={product.productObj} />
                            </td>
                            
                            <td className="p-2 px-6">
                              {product.serial_number}
                            </td>
                            <td className="p-2 px-6">
                              {product.national_code}
                            </td>
                            <td className="p-2 px-6">
                              {product.machine_status_name}
                            </td>
                            <td className="p-2 px-6">
                              <div className="flex flex-wrap gap-2">
                                {product?.components &&
                                  Object.entries(product.components).map(([component, isPresent], i) => (
                                    <div
                                      key={component + i}
                                      className={`text-xs bg-opacity-90 px-3 py-1 rounded-md text-white font-medium ${isPresent ? "bg-green" : "bg-red"
                                        }`}
                                    >
                                      {component}
                                    </div>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              <table className="border border-light w-full ">
                <thead className="header  text-dark text-xs px-  ">
                  <tr>
                    <th className="py-2">Cód.</th>
                    <th className="py-2">Equipo</th>
                    <th className="py-2">Serial</th>
                    <th className="py-2">Bien Nacional</th>
                    <th className="py-2">Estado</th>
                    <th className="py-2">Componentes</th>
                    <th className="opacity-50">
                      <DeleteIcon />
                    </th>
                  </tr>
                </thead>
                {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
                <tbody className="">
                  <tr
                    key={NewRegister.inventoryDetailID}
                    className="body px-2  px-30  text-dark items-center text-sm justify-between"
                  >
                    <td className="p-4 px-5">{NewRegister.product_code}</td>
                    <td className="p-4 px-5">
                      <ProductSummary product={NewRegister.productObj} />
                    </td>
                    <td className="p-4 px-5">{NewRegister.serial_number}</td>
                    <td className="p-4 px-5">{NewRegister.national_code}</td>
                    <td className="p-4 px-5">
                      {NewRegister.machine_status_name}
                    </td>
                    <td className="p-4 px-5">
                              <div className="flex flex-wrap gap-2">

                      {NewRegister?.components &&
                        Object.entries(NewRegister.components).map(([component, isPresent], i) => (
                          <div
                            key={component + i}
                            className={`text-xs bg-opacity-90 px-3 py-1 rounded-md text-white font-medium ${isPresent ? "bg-green" : "bg-red"
                              }`}
                          >
                            {component}
                          </div>
                        ))}
                        </div>
                    </td>

                    <td className="p-4 px-5">
                      <button
                      title="Eliminar producto"
                        onClick={(e) => {
                          setNewRegister((prev) => ({
                            ...prev,
                            inventory_general_id: "",
                            product_code: "",
                            productObj: null,
                            serial_number: "",
                            national_code: "",
                            machine_status_name: "",
                            components: {},

                          }));
                        }}
                        type="button"
                        className="bg-light p-1 pr-1 font-bold text-dark hover:bg-red hover:text-light rounded-md text-center"
                      >
                        x
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <>
              <Autocomplete
                options={organizations}
                getOptionLabel={(option) => option.name}
                value={NewRegister?.organizationObject}
                onChange={(e, newValue) => {
                  handleOptionSelectOrganizations(e, newValue);
                }}
                filterOptions={(options) => options}
                renderOption={(propsAutocomplete, option) => {
                  const { key, ...optionProps } = propsAutocomplete;
                  return (
                    <Box
                      key={option.name + option.id}
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...optionProps}
                    >
                      {option.code !== props?.userData?.entityCode && (
                        <p>
                          <span
                            style={{ color: "#011140", marginRight: "5px" }}
                          >
                            {option.code !== "nocode" && <StoreIcon />}
                          </span>
                          {option.name}
                        </p>
                      )}
                    </Box>
                  );
                }}
                onInputChange={(e, newValue) => {
                  handleSearchOrganizations(
                    e?.target?.value ||
                    NewRegister?.organizationObject?.name ||
                    ""
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    required
                    key={params}
                    {...params}
                    label="Destino"
                  />
                )}
              />
            </>
            <Input
              label={"Área"}
              value={NewRegister.area}
              name={"area"}
              onChange={handleChange}
            />

            <Input
              shrink={true}
              type={"date"}
              label={"Fecha de salida"}
              required
              value={NewRegister?.departure_date}
              name={"departure_date"}
              onChange={handleChange}
            />
            <Input
              shrink={true}
              type={"time"}
              label={"Hora de salida"}
              placeholder={"24h"}
              required
              value={NewRegister?.departure_time}
              name={"departure_time"}
              onChange={handleChange}
            />
            <Input
              label={"Descripción"}
              value={NewRegister.description}
              name={"description"}
              onChange={handleChange}
            />

            <Button3D
              className="mt-2 col-span-3"
              type="submit"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
              text={submitStatus}
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
