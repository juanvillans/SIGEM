import React, { useEffect, useState, useCallback, useRef } from "react";
import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";
import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import MicIcon from "@mui/icons-material/Mic";
import {
  IconButton,
  TextField,
  MenuItem,
  Autocomplete,
  Box,
} from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import useDebounce from "../components/useDebounce";
import CryptoJS from "crypto-js";
import Input from "../components/Input";
import CheckableList from "../components/CheckableList";
import CheckIcon from "@mui/icons-material/Check";
import InputWhite from "../components/InputWhite";
import ProductSummary from "../components/ProductSummary";

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function limitObjectSize(obj, maxSize = 6) {
  const entries = Object.entries(obj);
  if (entries.length > maxSize) {
    const sortedEntries = entries.sort(
      (a, b) => b[1]._timestamp - a[1]._timestamp
    );
    return sortedEntries.slice(0, maxSize);
  }
  return obj;
}

const createHashFromTime = () => {
  const currentTimeInMillis = Date.now().toString();
  const hash = CryptoJS.SHA256(currentTimeInMillis).toString();
  return hash.substring(0, 6);
};

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  medicamentName: "&medicament[name]=",
  organizationName: "&organization[name]=",
  day: "&entries[day]=",
  month: "&entries[month]=",
  year: "&entries[year]=",
  status: "&entries[status]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
const currentDate = new Date();

export default function Entradas(props) {
  let selectedRowRquest = false;
  const [isLoading, setIsLoading] = useState(true);
  const [localStorageForm, setLocalStorageForm] = useState(false);
  const [hasLoadedRelations, setHasLoadedRelations] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("entryForm")) {
      setLocalStorageForm(JSON.parse(localStorage.getItem("entryForm")));
    }
  }, []);

  const [organizations, setOrganizations] = useState([]);

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

  const handleOptionSelectOrganizations = (event, value) => {
    if (value && value?.code && value.code.toLowerCase() !== "nocode") {
      setAlert({
        open: true,
        status: "Error",
        message: `${value.name} debe registrar la salida de su inventario para recibirlo como entrada`,
      });
      setNewRegister((prev) => ({
        ...prev,
        organization_id: null,
        organizationName: "",
        organizationObject: null,
      }));
      return;
    }

    if (value) {
      setNewRegister((prev) => ({
        ...prev,
        organization_id: value.id,
        organizationName: value?.name,
        organizationObject: {
          organizationId: value.id,
          id: value.id,
          name: value?.name,
          code: value?.code,
        },
        municipalityId: value?.municipalityId,
        parishId: value?.parishId,
      }));
    } else {
      // Si se limpia la selección
      setNewRegister((prev) => ({
        ...prev,
        organization_id: null,
        organizationName: "",
        organizationObject: null,
      }));
    }
  };

  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    machine_status: [
      { id: 1, name: "OPERATIVO" },
      { id: 2, name: "INOPERATIVO" },
      { id: 3, name: "PENDIENTE DE VALIDACIÓN" },
    ],
    entitiesObject: {},
    entities: [],
    years: [],
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
    content: <></>,
  });

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    entity_code: props.userData.entityCode,
    area: "",
    product_id: null,
    quantity: 1,
    serial_number: "",
    national_code: "",
    organization_id: null,
    machine_status_id: 1,
    components: {},
    arrival_time: getCurrentTime(),
    arrival_date: new Date().toISOString().split("T")[0],
    status: 1,
  });
  useEffect(() => {
    if (NewRegister?.product_id) {
      localStorage.setItem("entryForm", JSON.stringify(NewRegister));
    }
  }, [NewRegister]);

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
    },
  });

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
      name: "arrival_date",
      label: "Fecha",
      options: {
        filter: false,
      },
    },
    {
      name: "organizationObj",
      label: "Origen",
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
      name: "arrival_time",
      label: "Hora",
      options: {
        filter: false,
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
      },
    },
  ];

  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRegister((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    if (searchText.trim() == "") {
      setProductsSearched([]);
      return;
    }

    try {
      const response = await axios.get(
        `dashboard/products?search[all]=${searchText}&rowsPerPage=15`
      );
      const responseSearch = response.data.products;
      if (responseSearch.length > 0) {
        setProductsSearched(responseSearch);
      } else {
        setProductsSearched("No se encontró ningún producto");
      }
    } catch (error) {
      setProductsSearched("Error al buscar productos");
    }
  }, 350);

  const [totalData, setTotalData] = useState(0);

  const handleSearch = useDebounce((searchText) => {
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 350);

  useEffect(() => {
    if (!hasLoadedRelations) {
      axios
        .get(
          `/dashboard/relation?entities=true&machine_status=true&entriesYears=true`
        )
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
              machine_status: res.data.machine_status,
              years: res.data.entriesYears,
              // conditions: res.data.conditions || prev.conditions,
            }));
          }
          setHasLoadedRelations(true);
        })
        .catch((err) => {
          console.error("Error al cargar datos relacionados:", err);
        });
    }
  }, [hasLoadedRelations, parametersURL.filterObjectValues.entityCode]);
  console.log({ NewRegister });
  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    let url = `dashboard/entries?entity=${parametersURL.filterObjectValues.entityCode}`;
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
  }, [parametersURL]);

  const deleteRegister = async (obj) => {
    try {
      await axios.delete(`/dashboard/entries/${obj.ID}`).then((response) => {
        setParametersURL((prev) => ({
          ...prev,
          page: 1,
          search: "",
          orderBy: "",
          orderDirection: "",
          filter: `&entries[entity_code]=${prev.filterObjectValues.entityCode}`,
          filterObjectValues: {
            entityCode: prev.filterObjectValues.entityCode,
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

    onSearchChange: (searchText) => {
      handleSearch(searchText);
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
        console.log({ changedColumn, columnIndex });
        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
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
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows) => {
      return (
        <div>
          {dataTable[selectedRows.data[0].dataIndex]?.status == 1 && (
            <>
              <IconButton
                title="Copiar"
                onClick={() => {
                  editIconClick(
                    dataTable[selectedRows.data[0].dataIndex],
                    "Crear entrada",
                    true
                  );
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                title="Editar"
                onClick={() => {
                  editIconClick(
                    dataTable[selectedRows.data[0].dataIndex],
                    "Editar entrada",
                    false
                  );
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
                          Está seguro que cancelará esta entrada?
                        </p>
                      </>
                    ),
                    aceptFunction: () => {
                      deleteRegister({
                        ID: dataTable[selectedRows.data[0].dataIndex].id,
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
    setRowProps: (row, dataIndex) => {
      if (dataTable[dataIndex].status == "2") {
        return {
          className: "strikethrough-row",
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

  function editIconClick(selectedRows, submitText, isJustForCopy = false) {
    const copySelectedRowRquest = structuredClone(selectedRows);
    if (isJustForCopy) {
      copySelectedRowRquest.serial_number = "_" + createHashFromTime();
      copySelectedRowRquest.national_code = "_" + createHashFromTime();

      copySelectedRowRquest.components =
        copySelectedRowRquest.product.required_components.reduce(
          (acc, component) => ({
            ...acc,
            [component]: true,
          }),
          {}
        );
    } else {
      copySelectedRowRquest.components =
        copySelectedRowRquest?.components || {};
    }

    setOrganizations([
      {
        id: copySelectedRowRquest.organization_id,
        name: copySelectedRowRquest.organization_name,
      },
    ]);

    setNewRegister({
      ...copySelectedRowRquest,
      code: isJustForCopy ? "" : copySelectedRowRquest.code,
      product: {
        brand: copySelectedRowRquest.product_brand,
        name: copySelectedRowRquest.product_name,
        model: copySelectedRowRquest.product_model,
        id: copySelectedRowRquest.product_id,
        required_components: copySelectedRowRquest.product_required_components,
        serial_number: copySelectedRowRquest.serial_number,
        national_code: copySelectedRowRquest.national_code,
      },
      organizationObject: {
        organizationId: copySelectedRowRquest.organization_id,
        id: copySelectedRowRquest.organization_id,
        name: copySelectedRowRquest?.organization_name,
        code: copySelectedRowRquest?.organization_code,
      },
      organization_id: copySelectedRowRquest.organization_id,
      organizationName: copySelectedRowRquest.organization_name,
      arrival_date: new Date(copySelectedRowRquest.arrival_date)
        .toISOString()
        .split("T")[0],
    });
    setSubmitStatus(submitText);
    setOpen(true);
  }

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      setTotalData(res.total);
      setDataTable(res.entries);
      setIsLoading(false);
    });
  };

  const [submitStatus, setSubmitStatus] = useState("Crear entrada");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus == "Cargando...") {
      return;
    }

    try {
      if (submitStatus === "Crear entrada") {
        setSubmitStatus("Cargando...");
        await axios.post(`/dashboard/entries`, NewRegister);
      }
      if (submitStatus === "Editar entrada") {
        setSubmitStatus("Cargando...");
        await axios.put(`/dashboard/entries/${NewRegister.id}`, NewRegister);
      }

      setAlert({
        open: true,
        status: "Exito",
      });
      setSubmitStatus("Crear entrada");
      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: `&entries[entity_code]=${prev.filterObjectValues.entityCode}`,
        filterObjectValues: { entityCode: prev.filterObjectValues.entityCode },
        filterObject,
        rowsPerPage: parametersURL.rowsPerPage,
        total: 0,
      }));
      setOpen(false);

      setNewRegister({
        code: "",
        id: "",
        entity_code: props.userData.entityCode,
        area: "",
        product_id: null,
        quantity: 1,
        serial_number: "",
        national_code: "",
        organization_id: null,
        machine_status_id: 1,
        components: {},
        organizationObject: null,
        organization_id: null,

        organizationName: "",
        arrival_time: getCurrentTime(),
        arrival_date: new Date().toISOString().split("T")[0],
        status: 1,
      });
      setOrganizations([]);
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
        NewRegister.code ? "Editar entrada" : "Crear entrada"
      );
    }
  };

  const [tabla, setTabla] = useState();
  console.log({ NewRegister, organizations });
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex flex-col md:flex-row gap-3 min-h-[55px] pt-3">
              <h1 className="text-grey md:text-xl relative top-1">
                Entradas {props.userData.entityCode == 1 && "de"}
              </h1>

              {props.userData.entityCode == 1 && (
                <span className="relative -top-2">
                  <Input
                    name="user_type"
                    id=""
                    select
                    value={parametersURL.filterObjectValues.entityCode}
                    size="small"
                    className="bg-blue/0 py-1 font-bold"
                    onChange={(e) => {
                      filterObject[
                        "entityCode"
                      ] = `&entries[entity_code]=${e.target.value}`;
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
                  >
                    {generalData.entities?.map((option) => (
                      <MenuItem key={option.code} value={option.code}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Input>
                </span>
              )}
            </div>
          </div>
        }
        data={dataTable}
        options={options}
        columns={columns}
      />
    );
  }, [dataTable, generalData]);

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="md:flex gap-10 justify-between">
        <div className="flex gap-4">
          <Button3D
            className="mt-2"
            color={"red"}
            text="Nueva entrada"
            icon={"add"}
            onClick={() => {
              if (submitStatus == "Editar entrada") {
                setNewRegister({
                  code: "",
                  id: "",
                  entity_code: props.userData.entityCode,
                  area: "",
                  product_id: null,
                  quantity: 1,
                  serial_number: "",
                  national_code: "",
                  organization_id: null,
                  machine_status_id: 1,
                  components: {},
                  organizationObject: {
                    organizationId: null,
                    name: "",
                    code: "",
                  },
                  organization_id: null,
                  organizationName: "",
                  arrival_time: getCurrentTime(),
                  arrival_date: new Date().toISOString().split("T")[0],
                  status: 1,
                });
              }
              // Resetear organizaciones para nueva entrada
              setOrganizations([]);
              setOpen(true);
              setSubmitStatus("Crear entrada");
            }}
          />

          {localStorageForm && (
            <div
              className="cursor-pointer mt-3 d-flex"
              onClick={() => {
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
      </div>

      <Modal
        show={open}
        width={"96%"}
        onClose={() => (isSearchHidden == "absolute" ? "" : setOpen(false))}
        content={
          <form
            onSubmit={handleSubmit}
            className="w-full gap-4 grid grid-cols-4"
          >
            <div className="col-span-4">
              <div className="flex items-center gap-3 rounded-t-lg bg-light text-dark p-4 relative">
                <b>Productos:</b>
                <Input
                  label="Buscar productos"
                  type="search"
                  key={842793}
                  id="searchInput"
                  name={`e${Math.random()}`}
                  value={searchProductText}
                  className="max-w-[300px]"
                  autoComplete="random-string-123"
                  size={"small"}
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
                  }}
                  onFocus={() => {
                    setIsSearchHidden("absolute");
                  }}
                  onBlur={() => {
                    setIsSearchHidden("hidden");
                  }}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <SearchIcon className="text-dark" />
                        </InputAdornment>
                        <button
                          className="hover:text-blue2"
                          title="(Ctrl+Espacio) Dictar por voz"
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
                  className={`bg-ligther shadow-2xl absolute left-0 max-h-96 overflow-auto rounded-lg border-t-0 top-[73px] z-50 ${isSearchHidden}`}
                >
                  <table className="">
                    <thead>
                      <tr className="header pb-0 text-left bg-ligther text-dark text-xs">
                        <th className="py-2">Cód.</th>
                        <th className="py-2">Nombre del equipo</th>
                        <th className="py-2">Marca</th>
                        <th className="py-2">Modelo</th>
                        <th className="py-2">Nivel</th>
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
                            key={`${product.id}+_${i}`}
                            className="body border-b border-b-grey border-opacity-10 text-black items-center hover:bg-blue1 hover:text-white cursor-pointer py-3"
                            onMouseDown={() => {
                              setIsSearchHidden("hidden");
                              setNewRegister((prev) => ({
                                ...prev,
                                product_id: product.id,
                                serial_number: "_" + createHashFromTime(),
                                national_code: "_" + createHashFromTime(),
                                product: product,
                                components: product.required_components.reduce(
                                  (acc, component) => ({
                                    ...acc,
                                    [component]: true,
                                  }),
                                  {}
                                ),
                              }));
                            }}
                          >
                            <td className="p-2 px-6">{product.code}</td>
                            <td className="p-2 px-6">{product.machine}</td>
                            <td className="p-2 px-6">{product.brand}</td>
                            <td className="p-2 px-6">{product.model}</td>
                            <td className="p-2 px-6">
                              {" "}
                              <span
                                className={`w-10 h-10 rounded-full bg-${product.level?.color}`}
                              ></span>{" "}
                              {product.level?.label}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              {NewRegister.product && (
                <>
                  <table className="border border-light w-full ">
                    <thead className="header  text-dark text-xs px-30  ">
                      <tr>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          #
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Producto
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Nro Serial
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Cod. Bien nacional
                        </th>
                        {/* <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">Stock</th> */}
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Estado del equipo
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Componentes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="">
                      <tr
                        key={NewRegister.product.id}
                        className="body px-2  px-30  text-dark items-center text-sm "
                      >
                        <td className="p-4 px-2 w-[60px] ">
                          {NewRegister.product.code}
                        </td>

                        <td className="p-4 px-2 w-[300px]">
                          {" "}
                          <b>{NewRegister.product.machine}</b>{" "}
                          <span className="text-blue1 font-semibold">
                            {NewRegister.product.brand}{" "}
                          </span>{" "}
                          <small className="text-grey font-bold">
                            {NewRegister.product.model}
                          </small>
                          <span
                            className={`w-10 h-10 rounded-full bg-${NewRegister.product.level?.color}`}
                          ></span>{" "}
                          {NewRegister.product.level?.label}
                        </td>
                        <td className="p-4 px-2 w-[200px]">
                          <Input
                            label={"Serial"}
                            key={`nro_serial_${NewRegister.product.id}`}
                            value={NewRegister.product?.serial_number}
                            name={`serial_number`}
                            size="small"
                            onChange={handleChange}
                          />
                        </td>
                        <td className="p-4 px-2 w-[200px]">
                          <Input
                            label={"Nacional"}
                            key={`national_code_${NewRegister.product.id}`}
                            value={NewRegister.product?.national_code}
                            name={`national_code`}
                            size="small"
                            onChange={handleChange}
                          />
                        </td>
                        <td className="p-4 px-2 w-[200px]">
                          <Input
                            name="machine_status_id"
                            id=""
                            select
                            value={NewRegister.machine_status_id}
                            size="small"
                            className="bg-blue/0 py-1 font-bold"
                            onChange={(e) => {
                              setNewRegister((prev) => ({
                                ...prev,
                                machine_status_id: e.target.value,
                              }));
                            }}
                          >
                            {generalData.machine_status?.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            )) || <MenuItem value={""}></MenuItem>}
                          </Input>
                        </td>

                        <td className="p-4 px-2">
                          <CheckableList
                            components={NewRegister.components || {}}
                            onComponentsChange={(updatedComponents) => {
                              setNewRegister((prev) => ({
                                ...prev,
                                components: updatedComponents,
                              }));
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <Input
              shrink={true}
              type={"date"}
              label={"Fecha de entrada"}
              required
              value={NewRegister.arrival_date}
              name={"arrival_date"}
              onChange={handleChange}
            />
            <Input
              shrink={true}
              type={"time"}
              label={"Hora de entrada"}
              placeholder={"24h"}
              required
              value={NewRegister.arrival_time}
              name={"arrival_time"}
              onChange={handleChange}
            />
            <>
              <Autocomplete
                options={organizations}
                getOptionLabel={(option) => option?.name || ""}
                value={NewRegister?.organizationObject || null}
                isOptionEqualToValue={(option, value) => {
                  return (
                    option?.id === value?.organizationId ||
                    option?.id === value?.id
                  );
                }}
                onChange={(e, newValue) => {
                  handleOptionSelectOrganizations(e, newValue);
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
                onInputChange={(_, newValue) => {
                  if (newValue && newValue.trim().length > 0) {
                    handleSearchOrganizations(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField required {...params} label="Origen" />
                )}
              />
            </>

            <Input
              label={"Área"}
              value={NewRegister.area}
              name={"area"}
              onChange={handleChange}
            />

            {submitStatus == "Editar entrada" && (
              <p className="text-xs text-center col-span-3 relative top-3">
                Al editar se cancelará la versión anterior y se guardará esta
                nueva
              </p>
            )}
            <Button3D
              className="mt-2 col-span-4"
              color={submitStatus == "Crear entrada" ? "blue1" : "blue2"}
              text={submitStatus}
              onClick={() => {}}
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
        }}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={() => modalConfirm.aceptFunction()}
        content={modalConfirm.content}
      />
    </>
  );
}
