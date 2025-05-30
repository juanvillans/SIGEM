import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";
import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { PDFViewer } from "@react-pdf/renderer";
import BadgeIcon from "@mui/icons-material/Badge";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import Select from "@mui/material/Select";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HistoryIcon from "@mui/icons-material/History";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandRowProducts from "../components/ExpandRowProducts";
import MicIcon from '@mui/icons-material/Mic';

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

import OuputGuide from "../components/OuputGuide4.jsx";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
import { Box } from "@mui/material";
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
  const [infoBill, setInfoBill] = useState({
    code: "",
    id: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    guide: "new",
    products: [],
    departureDate: new Date().toISOString().split("T")[0],
  });
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
    status: 1,
    code: "",
    id: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    guide: "new",
    parishId: "",
    municipalityId: 14,
    organizationName: "",
    organizationId: "",
    receiverCi: "",
    receiverName: "",
    organizationObject: { name: "", organizationId: null },
    products: [],
    departureDate: date,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");
  const [localStorageForm, setLocalStorageForm] = useState(false);
  const [showAllStock, setShowAllStock] = useState(false);

  let selectedRowRquest = false;

  function handleSelectRow(row) {
    selectedRowRquest = row;
  }

  useEffect(() => {
    document.title = "SISMED | Salidas";

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

  useEffect(() => {
    if (NewRegister.products.length >= 1) {
      localStorage.setItem("outputForm", JSON.stringify(NewRegister));
    }
  }, [NewRegister]);

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
      name: "entityName",
      label: "Entidad",
      options: {
        display:
          parametersURL?.filterObject?.entityCode == "&outputs[entityCode]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
    {
      name: "outputCode",
      label: "código",
      options: {
        filter: false,
      },
    },
    {
      name: "guide",
      label: "nro. guia",
      options: {
        filter: false,
      },
    },
    // {
    //   name: "totalQuantity",
    //   label: "Producti",
    //   options: {
    //     filter: false,
    //   },
    // },

    {
      name: "departureDate",
      label: "Fecha",
      options: {
        filter: false,
        customBodyRender: (value) => {
          const [year, month, day] = value?.split("-") || "n/a";
          return (
            <p className="min-w-[85px]">
              {day}-{month}-{year}
            </p>
          );
        },
      },
    },
    {
      name: "departureTime",
      label: "Hora",
      options: {
        filter: false,
      },
    },
    {
      name: "organizationObj",
      label: "Destino",
      options: {
        filter: false,

        // filterList: parametersURL?.filterList[8] || [],
        sort: true,
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
        // filterOptions: {
        //   names: generalData.organizations
        //     ? generalData.organizations.map((ent) => ent.name)
        //     : [""],
        // },
      },
    },

    {
      name: "receiverFullname",
      label: "recibió",
      options: {
        filter: false,
      },
    },
    {
      name: "receiverCi",
      label: "C.I del recibidor",
      options: {
        display: true,
        filter: false,
      },
    },
    {
      name: "status",
      label: "Estado",
      options: {
        // display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[11] || [],
        sort: true,
        filterOptions: {
          names: ["En proceso", "Despachado", "Cancelado", "Retrasado"],
        },
        customBodyRender: (value) => {
          const statusString = statutes[value];
          let color = "";
          if (value == 1) {
            color = "text-blue2";
          } else if (value == 2) {
            // color = "text-red";
          } else if (value == 3) {
            color = "text-green";
          } else if (value == 4) {
            color = "text-orange";
          } else {
            color = "";
          }
          return <b className={`${color}`}>{statusString}</b>;
        },
      },
    },
    {
      name: "authorityFullname",
      label: "Despachador",
      options: {
        filter: false,
      },
    },
    {
      name: "authorityCi",
      label: "C.I del despachador",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "description",
      label: "Observación",
      options: {
        display: false,
        filter: false,
      },
    },

    {
      name: "municipalityName",
      label: "Municipio",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[15] || [],
        filterOptions: {
          names: generalData?.municipalities.map((obj) => obj.name),
        },
        sort: true,
      },
    },
    {
      name: "parishName",
      label: "Parroquia",
      options: {
        filter: false,
        sort: true,
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
      setSearchProductText(transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

      setIsListening(false);
      handleSearchForSelect(transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      if (isSearchHidden == "hidden") {
        setIsSearchHidden("absolute");
      }
    };

    recognition.onerror = () => setIsListening(false);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        startListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const [isThereARecentGuide, setIsThereARecentGuide] = useState("");
  const checkIfHasARecentGuide = useDebounce(async (ci) => {
    try {
      const response = await axios.get(`dashboard/outputs/verify/${ci}`);
      setIsThereARecentGuide(response.data);

      // Realiza las acciones necesarias con la respuesta de la solicitud
    } catch (error) {
      // Maneja los errores de la solicitud
      setIsThereARecentGuide("");
    }
  }, 300);

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
        organizationName: value?.name,
        receiverFullname: value?.authorityFullname,
        receiverCi: value?.authorityCi,
        organizationObject: {
          organizationId: value.id,
          name: value?.name,
          authorityFullname: value?.authorityFullname,
          authorityCi: value?.authorityCi,
          code: value?.code,
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
      await axios.post(`/dashboard/cancellation/2`, obj).then((response) => {
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

  const dispatch = async (selectedRows) => {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = structuredClone(dataTable[indx]);
    if (
      !window.confirm(
        `Una vez guardado como Despachado no se podrá eliminar ni editar ${
          dataOfIndx.organizationCode.toLowerCase() !== "nocode" &&
          dataOfIndx.organizationCode
            ? "y los productos enviados se añadirán al inventario de " +
              dataOfIndx.organizationName
            : ""
        }. ¿Está seguro de continuar?`
      )
    ) {
      return;
    }
    try {
      await axios
        .get(`/dashboard/outputs/dispatch/${dataOfIndx.id}`)
        .then((response) => {
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
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };
  const editIconClick = async (
    selectedRows,
    submitText,
    isJustForCopy = false
  ) => {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = structuredClone(selectedRowRquest);
    if (isJustForCopy && dataOfIndx.status == 2) {
      dataOfIndx.status = 1;
    }
    try {
      await axios
        .post(`dashboard/products/get-stock`, {
          inventories: dataOfIndx.products.map((product) => ({
            inventoryDetailID: product.inventoryDetailID,
          })),
        })
        .then((response) => {
          dataOfIndx.products.forEach((product) => {
            product.stock = isJustForCopy
              ? response.data[product.id].stock
              : response.data[product.id].stock + product.quantity;
            product.conditionId = response.data[product.id].condition;

          });
          setOrganizations([
            {
              id: dataOfIndx.organizationId || null,
              name: dataOfIndx.organizationName,
            },
          ]);
          setNewRegister({
            ...dataOfIndx,
            inventoryDetailID: dataOfIndx.inventoryID,
            outputCode: isJustForCopy ? null : dataOfIndx.outputCode,
            organizationObject: {
              organizationId: dataOfIndx.organizationId,
              name: dataOfIndx?.organizationName,
              authorityFullname: dataOfIndx?.authorityFullname,
              authorityCi: dataOfIndx?.authorityCi,
              code: dataOfIndx?.organizationCode,
            },
          });
          // fnEmptyRows([]);
        });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error?.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }

    // if (isJustForCopy) {

    // }
    // setNewRegister({
    //   ...dataOfIndx,
    //   outputCode: isJustForCopy ? null : dataOfIndx.outputCode,
    //   organizationObject: {
    //     organizationId: dataOfIndx.organizationId,
    //     name: dataOfIndx?.organizationName,
    //     authorityFullname: dataOfIndx?.authorityFullname,
    //     authorityCi: dataOfIndx?.authorityCi,
    //   },
    // });
    setTypeOfGuide("nueva");
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
    onRowSelectionChange: () => {
      selectedRowRquest = false;
    },
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
          <IconButton
            title="copiar"
            onClick={async () => {
              if (selectedRowRquest.id) {
                await editIconClick(selectedRows, "Crear", true);
              } else {
                window.alert("> Despliegue los productos");
              }
            }}
          >
            <ContentCopyIcon />
          </IconButton>
          <IconButton
            title="Descargar factura de la guia"
            onClick={() => {
              // requestGuide(
              //   "id",
              //   dataTable[selectedRows.data[0].dataIndex].id,
              //   true
              if (selectedRowRquest.id) {
                setInfoBill(selectedRowRquest);
                setModalPdf(true);
              } else {
                window.alert("> Despliegue los productos");
              }
              // );
            }}
          >
            <BadgeIcon />
          </IconButton>
          {dataTable[selectedRows.data[0].dataIndex]?.status != 2 &&
            dataTable[selectedRows.data[0].dataIndex]?.status != 3 && (
              <>
                <IconButton
                  title="Despachar"
                  onClick={
                    async () => {
                      if (selectedRowRquest.id) {
                        dispatch(selectedRows);
                      } else {
                        window.alert("> Despliegue los productos");
                      }
                      // await editIconClick(selectedRows, "Crear", true);
                    }
                    // setIsButtonDisabled(true);
                  }
                >
                  <div
                    className={`border rounded border-green text-green px-3 text-sm font-bold`}
                  >
                    <span className="mr-2">DESPACHAR</span>
                    <LocalShippingIcon />
                  </div>
                </IconButton>

                <IconButton
                  title="Editar"
                  onClick={() => {
                    if (selectedRowRquest.id) {
                      editIconClick(selectedRows, "Editar");
                    } else {
                      window.alert("> Despliegue los productos");
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  title="Eliminar"
                  onClick={() => {
                    setModalConfirm({
                      isOpen: true,
                      // textInfo: 'textInfo',
                      modalInfo: (
                        <>
                          <p className="mb-2">
                            Especifique porqué cancelará esta salida
                          </p>{" "}
                          <InputWhite
                            key={832349}
                            id={"cancelDescription"}
                            name={"cancelDescription"}
                            Color={"white"}
                            required
                            multiline
                          />{" "}
                        </>
                      ),
                      aceptFunction: (e) => {
                        let cancelDescription =
                          document.querySelector("#cancelDescription").value;
                        deleteRegister(
                          {
                            ID: dataTable[selectedRows.data[0].dataIndex].id,
                            cancelDescription,
                          },
                          setSelectedRows
                        );
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
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      const output = dataTable[rowMeta.dataIndex];

      return (
        <ExpandRowProducts
          id={output.id}
          entityCode={output.entityCode}
          code={output.outputCode}
          route={"output"}
          data={output}
          handleSelectRow={handleSelectRow}
          tableSearchText={tableSearchText}
        />
      );
    },
    setRowProps: (row, dataIndex, rowIndex) => {
      if (dataTable[dataIndex].status == "2") {
        return {
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

      if (relation == true) {
        let entitiesObject = {};
        res.entities.forEach((obj) => {
          entitiesObject[obj.name] = obj.name;
        });
        setGeneralData({
          ...res,
          entitiesObject,
        });
      }
      setDataTable(res.outputs);
      setIsLoading(false);
    });

    setRelation(false);
  };
  const requestGuide = async (type, id, justForBill = false) => {
    await axios
      .get(`dashboard/outputs?outputs[${type}]=${id}`)
      .then((response) => {
        const data = response.data.outputs;
        if (data.length > 0) {
          const arrGuide = {
            ...data[0],
            products: [...data[0].products],
          };

          for (let i = 1; i < data.length; i++) {
            arrGuide.products.push(...data[i].products);
          }

          if (justForBill == true) {
            setInfoBill(arrGuide);
            setModalPdf(true);
          } else {
            setNewRegister(arrGuide);
            document.querySelector("#guideNumber").disabled = true;
          }
        } else {
          setAlert({
            open: true,
            status: "Error",
            message: `No se encontró ninguna guia ${guide}`,
          });
          return;
        }
      });
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (NewRegister?.status == 3) {
      if (
        !window.confirm(
          `Una vez guardado como Despachado no se podrá eliminar ni editar ${
            NewRegister.organizationObject.code !== "nocode" &&
            NewRegister.organizationObject.code
              ? "y los productos enviados se añadirán al inventario de " +
                NewRegister.organizationName
              : ""
          }. ¿Está seguro de continuar?`
        )
      ) {
        return;
      }
    }
    if (submitStatus === "Cargando...") {
      return;
    }
    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("Cargando...");
        await axios
          .post(`/dashboard/outputs`, NewRegister)
          .then((response) => {});
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/outputs/${NewRegister.id}`, NewRegister)
          .then((response) => {});
      }

      setSubmitStatus("Crear");
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

      setSearchProductText("");
      setProductsSearched([]);

      const objauthority = {
        ...authoritiesOptions,
        [NewRegister.authorityCi]: {
          authorityFullname: NewRegister.authorityFullname,
          authorityCi: NewRegister.authorityCi,
        },
      };

      localStorage.setItem("authorities", JSON.stringify(objauthority));
      setNewRegister({
        status: 1,
        authorityCi: "",
        authorityFullname: "",
        departureTime: "",
        municipalityId: 14,
        parishId: null,
        organizationId: null,
        organizationName: "",

        organizationObject: {
          organizationId: null,
          code: "",
          name: "",
          authorityFullname: "",
          authorityCi: "",
        },
        code: "",
        id: "",
        name: "",
        categoryId: "",
        medicamentId: "",
        receiverFullname: "",
        receiverCi: "",

        typePresentationId: "",
        typeAdministrationId: "",
        unitPerPackage: "",
        concentrationSize: "",
        categoryObj: { name: "", id: "" },
        medicamentObj: { name: "N/A", id: 1 },
        typePresentationObj: { name: "N/A", id: 1 },
        typeAdministrationObj: { name: "N/A", id: 1 },
        guide: "new",
        products: [],
        departureDate: new Date().toISOString().split("T")[0],
      });
      setIsThereARecentGuide("");
      setTypeOfGuide("nueva");
      localStorage.removeItem("outputForm");
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error?.response?.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
      setSubmitStatus(() =>
        NewRegister.outputCode != null ? "Editar" : "Crear"
      );
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
  }, [dataTable]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // setNewRegister((prev) => ({ ...prev, [name]: value }));
    if (name.includes("_")) {
      // Campo dentro de products
      const [fieldName, index] = name.split("_");
      setNewRegister((prev) => {
        const updatedProducts = [...prev.products];

        updatedProducts[index][fieldName] = value;
        return {
          ...prev,
          products: updatedProducts,
        };
      });
    } else {
      // Otro campo en newRegister
      setNewRegister((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });
  const [selectedRow, setSelectedRow] = useState(-1);

  const setSelected = (index) => {
    setSelectedRow(index);
  };
  const [lotsInventoryData, setLotsInventoryData] = useState(false);

  const [typeOfGuide, setTypeOfGuide] = useState("nueva");
  return (
    <>
      <div className="md:flex items-center justify-between">
        <div className="flex gap-10">
          <Button3D
            className="mt-2"
            color={"red"}
            text="Nueva Salida"
            icon={"add"}
            fClick={(e) => {
              setNewRegister((prev) => ({
                ...prev,
                departureTime: getCurrentTime(),
              }));
              if (NewRegister.outputCode) {
                setNewRegister({
                  status: 1,
                  authorityCi: "",
                  authorityFullname: "",
                  departureTime: getCurrentTime(),
                  organizationId: "",
                  organizationName: "",
                  organizationObject: { name: "" },
                  code: "",
                  municipalityId: 14,
                  parishId: null,
                  id: "",
                  name: "",
                  categoryId: "",
                  medicamentId: "",
                  typePresentationId: "",
                  typeAdministrationId: "",
                  receiverFullname: "",
                  receiverCi: "",
                  unitPerPackage: "",
                  concentrationSize: "",
                  categoryObj: { name: "", id: "" },
                  medicamentObj: { name: "N/A", id: 1 },
                  typePresentationObj: { name: "N/A", id: 1 },
                  typeAdministrationObj: { name: "N/A", id: 1 },
                  guide: "new",
                  products: [],
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
                setIsThereARecentGuide("");
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
                    setSelectedRow(null);
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

                      <button className="hover:text-blue2" title="(Ctrl+Espacio) Dictar por voz " onClick={startListening} disabled={isListening}>
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
                  <table className="parent_products bg-opacity-0">
                    <thead className="header px-2 py-1 pb-0 bg-ligther text-dark text-xs ">
                      <tr>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Cód. produ.
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Producto
                        </th>
                        <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                          Total
                        </th>
                        {showAllStock && (
                          <>
                            <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                              Por vencer
                            </th>
                            <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                              Buen estado
                            </th>
                            <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                              Vencidos
                            </th>
                            <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                              Defectuosos
                            </th>
                          </>
                        )}
                        <th
                          title="Mostrar vencidos y otros"
                          className="bg-light cursor-pointer hover:bg-grey hover:text-white text-sm"
                          onClick={() => setShowAllStock((prev) => !prev)}
                        >
                          {showAllStock ? "<<" : ">>"}
                        </th>
                      </tr>
                    </thead>

                    {typeof productsSearched === "string" ? (
                      <p className="col-span-8 text-center py-4 font-bold">
                        {/* Aqui se muestra el texto que dice buscando o que no se encontró ninguno */}
                        {productsSearched}
                      </p>
                    ) : (
                      <tbody>
                        {productsSearched?.map((product, i) => {
                          // when select the product ( and not the lote)
                          const isRowSelected = selectedRow === i;
                          // if (produ)
                          return (
                            <React.Fragment key={product.productId}>
                              <tr
                                onClick={(e) => {
                                  setLotsInventoryData(false);
                                  const clickedRow = e.currentTarget;
                                  // Calculate the top position of the clicked row relative to the search window
                                  clickedRow.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });

                                  // Smooth scroll the search window to the clicked row position
                                  setSelectedRow((prev) => {
                                    return prev == i ? null : i;
                                  });
                                  axios
                                    .get(
                                      `dashboard/detail-inventory/${product.productId}/${product.entityCode}`
                                    )
                                    .then((response) => {
                                      const lots = response.data.lotsPerOrigin;
                                      console.log(lots);
                                      
                                      setLotsInventoryData(lots);
                                    });
                                }}
                                className={`trSearchedProducts body border-b border-b-grey border-opacity-10 px-3 px-30 text-black hover:bg-blue1 hover:text-white  cursor-pointer py-3 ${
                                  isRowSelected ? "bg-blue1 text-white" : ""
                                }`}
                              >
                                <td className="p-4 px-2">{product.code}</td>
                                <td className="p-4 px-2">
                                  <b>{product.name}</b>{" "}
                                  {product.unitPerPackage > 1 ? <span className="text-green font-semibold">{product.unitPerPackage}<small>x</small> </span> : <span>{product.unitPerPackage}</span>}{" "}

                                  {product.typePresentationName != "N/A"
                                    ? product.typePresentationName
                                    : ""}{" "}
                                  {product.concentrationSize != "N/A" && (
                                    <b style={{ color: "#187CBA" }}>
                                      {" "}
                                      {product.concentrationSize}
                                    </b>
                                  )}
                                </td>
                                <td className="p-4 px-2">
                                  <span className="bg-white p-1 px-3 rounded text-dark font-bold">
                                    {product.stock}
                                  </span>
                                </td>
                                {showAllStock && (
                                  <>
                                    <td className="p-4 px-2">
                                      <span className="bg-blue3 p-1 px-3 pr-1 rounded text-red font-bold">
                                        {product.stockPerExpire}
                                        <RunningWithErrorsIcon className="relative  -top-1 left-1" />
                                      </span>
                                    </td>
                                    <td className="p-4 px-2">
                                      <span className="bg-blue3 p-1 px-3 rounded text-blue1 font-bold">
                                        {product.stockGood}
                                      </span>
                                    </td>
                                    <td className="p-4 px-2">
                                      <span className="bg-red p-1 px-3 rounded text-white">
                                        {product.stockExpired}
                                      </span>
                                    </td>
                                    <td className="p-4 px-2">
                                      <span className="bg-orange p-1 px-3 rounded text-white">
                                        {product.stockBad}
                                      </span>
                                    </td>
                                  </>
                                )}

                                {isRowSelected && (
                                  <table>
                                    <thead>
                                      <tr className="bg-blue2 text-left text-xs">
                                        <th className="noPadding p-1 px-3 w-[130px] min-w-[130px]">
                                          Lote
                                        </th>
                                        <th className="noPadding p-1 px-3 w-[105px] min-w-[105px]">
                                          F. de vencimiento
                                        </th>
                                        <th className="noPadding p-1 px-3 w-[89px] min-w-[89px]">
                                          Cantidad
                                        </th>
                                        <th className="noPadding p-1 px-3 w-[105px] min-w-[105px] max-w-[105px]">
                                          Condición
                                        </th>
                                        <th className="noPadding p-1 px-3">
                                          Origen
                                        </th>
                                        <th className="noPadding p-1 px-3">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {lotsInventoryData ? (
                                        Object.entries(lotsInventoryData).map(
                                          ([key, value]) => {
                                            return (
                                              <tr
                                                key={key}
                                                className="border-b border-blue1 mb-0 mt-0"
                                              >
                                                <td colSpan={4}>
                                                  {[
                                                    ...value.perExpire,
                                                    ...value.good,
                                                    ...value.bad,
                                                    ...value.expired,
                                                  ].map((value) => {
                                                    const conditionColor =
                                                      () => {
                                                        if (
                                                          value.conditionId == 3
                                                        ) {
                                                          return "bg-red text-white";
                                                        } else if (
                                                          value.conditionId == 2
                                                        ) {
                                                          return "bg-orange text-white";
                                                        } else if (
                                                          value.conditionId ==
                                                            1 ||
                                                          value.conditionId == 4
                                                        ) {
                                                          return "bg-blue3 text-blue1";
                                                        }
                                                      };
                                                    return (
                                                      <tr
                                                      key={value?.inventoryDetailID}
                                                        className={
                                                          NewRegister.products.some(
                                                            (obj) =>
                                                              obj?.inventoryDetailID == value?.inventoryDetailID
                                                          )
                                                            ? "hover:cursor-not-allowed bg-ligth text-sm my-0 py-0"
                                                            : `${conditionColor()} text-sm cursor-pointer hover:brightness-110 `
                                                        }
                                                        onClick={(e) => {
                                                          if (
                                                            !NewRegister.products.some(
                                                              (obj) =>
                                                                obj?.inventoryDetailID == value?.inventoryDetailID
                                                            )
                                                          ) {
                                                            setNewRegister(
                                                              (prev) => ({
                                                                ...prev,
                                                                products: [
                                                                  {
                                                                    ...product,

                                                                    product: `${
                                                                      product.name
                                                                    } ${
                                                                      product.unitPerPackage !=
                                                                      "N/A"
                                                                        ? product.unitPerPackage
                                                                        : ""
                                                                    }${" "}
                                                              ${
                                                                product.typePresentationName !=
                                                                "N/A"
                                                                  ? product.typePresentationName
                                                                  : ""
                                                              }${" "}
                                                              ${
                                                                product.concentrationSize !=
                                                                "N/A"
                                                                  ? product.concentrationSize
                                                                  : ""
                                                              }`,
                                                                    lots: "",
                                                                    ...value,
                                                                   
                                                                    description:
                                                                      "Sin novedad",
                                                                    quantity:
                                                                      "",
                                                                  },
                                                                  ...prev.products,
                                                                ],
                                                              })
                                                            );
                                                            const modal =
                                                              e.target.closest(
                                                                ".modal"
                                                              );

                                                            // Check if the modal exists
                                                            if (modal) {
                                                              // Set the scroll position to the top
                                                              modal.scrollTop = 0;
                                                            }
                                                            setIsSearchHidden(
                                                              "hidden"
                                                            );
                                                          }
                                                          setTimeout(() => {
                                                            document
                                                              .querySelector(
                                                                `#quantity_0`
                                                              )
                                                              .focus();
                                                          }, 100);
                                                        }}
                                                      >
                                                        <td
                                                          className={`w-[130px] p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light `}
                                                          scope="row"
                                                        >
                                                          {value.loteNumber}
                                                        </td>
                                                        {value.conditionId ==
                                                        4 ? (
                                                          <td className="text-red font-bold p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                                            {
                                                              value.expirationDate
                                                            }
                                                            <RunningWithErrorsIcon className="relative -top-1.5" />
                                                          </td>
                                                        ) : (
                                                          <td className="w-[105px]  p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                                            {
                                                              value.expirationDate
                                                            }
                                                          </td>
                                                        )}

                                                        <td className="w-[89px] min-w-[80px] p-2 px-2 pl-3 border-b border-opacity-80 font-bold bg-light bg-opacity-20 border-light">
                                                          {value.stock}
                                                        </td>
                                                        <td className="w-[105px] min-w-[105px] max-w-[105px] text-sm p-2 px-2 pl-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                                                          {value.conditionName}
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </td>
                                                <td className="bg-ligther text-dark p-3">
                                                  {value.organizationCode.toLowerCase() !==
                                                  "nocode" ? (
                                                    <span className="text-blue1">
                                                      <StoreIcon
                                                        style={{
                                                          fontSize: "15px",
                                                        }}
                                                      />
                                                    </span>
                                                  ) : (
                                                    ""
                                                  )}{" "}
                                                  {value.name}
                                                </td>
                                                <td className="bg-ligther text-dark p-3">
                                                  {value.good.reduce(
                                                    (acc, obj) =>
                                                      acc + obj.stock,
                                                    0
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )
                                      ) : (
                                        <p>Cargando...</p>
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              <table className="border border-light w-full ">
                <thead className="header  text-dark text-xs px-30  ">
                  <tr>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      #
                    </th>
                    {/* <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">Nro Guia</th> */}
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Nro Lote
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Cód del prod
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Producto
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      F. Vencimiento
                    </th>
                    {/* <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">Stock</th> */}
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Cantidad de salida
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Observación
                    </th>
                    <th className="opacity-50">
                      <DeleteIcon />
                    </th>
                  </tr>
                </thead>
                {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
                <tbody className="">
                  {NewRegister?.products?.map((product, i) => {
                      return (
                        <tr
                          key={product.inventoryDetailID + "x_" + i}
                          className="body px-2  px-30  text-dark items-center text-sm justify-between"
                        >
                          <td className="p-4 px-2">
                            {NewRegister?.products.length - i}
                          </td>
                          {/* <td className="p-4 px-2">{product.guide}</td> */}
                          <td className="p-4 px-2">{product.loteNumber}</td>
                          <td className="p-4 px-2">{product.code}</td>

                          <td className="p-4 px-2">
                            {" "}
                            <b>{product.name}</b>{" "}
                            {product.unitPerPackage > 1 ? <span className="text-green font-semibold">{product.unitPerPackage}<small>x</small> </span> : <span>{product.unitPerPackage}</span>}{" "}
                            {" "}
                            {product.typePresentationName != "N/A"
                              ? product.typePresentationName
                              : ""}{" "}
                            {product.concentrationSize != "N/A" && (
                              <b style={{ color: "#187CBA" }}>
                                {" "}
                                {product.concentrationSize}
                              </b>
                            )}
                          </td>
                          <td className="p-4 px-2">{product.expirationDate}</td>
                          {/* <td className="p-4 px-2">{product.stock}</td> */}
                          <td className="p-4 px-2 flex items-center gap-2 min-w-[184px] max-w-[184px]">
                            <Input
                              size="small"
                              data-index={i}
                              label={"Cantidad"}
                              required
                              key={`quantity_${i}`}
                              id={`quantity_${i}`}
                              // defaultValuevalue={product.stock}
                              value={NewRegister.products[i]?.quantity}
                              name={`quantity_${i}`}
                              InputProps={{
                                inputProps: {
                                  max: product.stock,
                                  min: 0,
                                },
                              }}
                              // onChange={() => {}}
                              onInput={(e) => {
                                if (
                                  e.target.value <= +product?.stock &&
                                  e.target.value >= 0
                                ) {
                                  handleChange(e);
                                }
                              }}
                              type={"number"}
                            />

                            <span className={`min-w-[37px] `}>
                              / {product.stock}
                            </span>
                          </td>
                          <td className="p-4 px-2">
                            <Input
                              label={"Observación"}
                              key={`description_${i}`}
                              value={NewRegister.products[i]?.description}
                              name={`description_${i}`}
                              size="small"
                              multiline
                              // data-index={i}
                              onChange={handleChange}
                            />
                          </td>

                          <td className="p-4 px-2">
                            <button
                              onClick={(e) => {
                                setNewRegister((prev) => ({
                                  ...prev,
                                  products: prev.products.filter(
                                    (eachProduct, j) => i !== j
                                  ),
                                }));
                              }}
                              type="button"
                              className="bg-light p-1 pr-1 font-bold text-dark hover:bg-red hover:text-light rounded-md text-center"
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
            </div>

            <Autocomplete
              options={Object.values(authoritiesOptions)}
              getOptionLabel={(option) => option.authorityFullname}
              value={NewRegister}
              inputValue={NewRegister.authorityFullname}
              onChange={(e, newValue) => {
                handleOptionSelect(e, newValue);
              }}
              onInputChange={handleInputChange}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label="Nombre del despachador"
                />
              )}
            />

            <TextField
              label="Cédula del despachador"
              value={NewRegister.authorityCi}
              name="authorityCi"
              onChange={handleChange}
              required
              type="number"
              key={57234}
            />

            <>
              <Autocomplete
                options={organizations}
                getOptionLabel={(option) => option.name}
                value={NewRegister?.organizationObject}
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

              <Input
                label={"Nombre de quien recibe"}
                shrink={
                  NewRegister?.receiverFullname?.length > 1 ? true : false
                }
                required
                // type={'text'}
                key={0}
                name={"receiverFullname"}
                onChange={handleChange}
                value={NewRegister?.receiverFullname}
              />
              <span className="flex gap-1">
                <Input
                  label={"C.I de quien recibe"}
                  // shrink={NewRegister?.receiverCi ? true : false}
                  required
                  type={"number"}
                  key={43242423}
                  name={"receiverCi"}
                  onChange={(e) => {
                    if (
                      NewRegister.organizationId == 1 &&
                      e.target.value.length >= 6
                    ) {
                    } else {
                      setIsThereARecentGuide("");
                    }
                    handleChange(e);
                  }}
                  value={NewRegister?.receiverCi}
                />
                <button
                  onClick={() => {
                    setIsThereARecentGuide("loading");
                    checkIfHasARecentGuide(NewRegister?.receiverCi);
                  }}
                  type="button"
                  className="bg-light p-3 text-grey hover:text-dark hover:shadow-lg"
                  title="Revisar salidas a esta persona"
                >
                  {isThereARecentGuide == "loading" ? (
                    <CircularProgress
                      style={{
                        fontSize: "11px !important",
                        height: "21px",
                        width: " 21px",
                      }}
                    />
                  ) : (
                    <RemoveRedEyeIcon />
                  )}
                </button>
                {isThereARecentGuide?.length > 10 && (
                  <p className="text-red text-xs">{isThereARecentGuide}</p>
                )}
              </span>
            </>

            <Input
              shrink={true}
              type={"date"}
              label={"Fecha de salida"}
              required
              value={NewRegister?.departureDate}
              name={"departureDate"}
              onChange={handleChange}
            />
            <Input
              shrink={true}
              type={"time"}
              label={"Hora de salida"}
              placeholder={"24h"}
              required
              value={NewRegister?.departureTime}
              name={"departureTime"}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel id="municipio" className="px-1 bg-white">
                Municipios
              </InputLabel>
              <Select
                labelId="municipio"
                id="demo-simple-select"
                name="municipalityId"
                value={NewRegister?.municipalityId}
                onChange={handleChange}
              >
                {generalData?.municipalities?.map((option) => (
                  <MenuItem
                    key={`${option.id}-${option.name}`}
                    value={option.id}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel
                id="demo-simple-select-label"
                className="px-1 bg-white"
              >
                Parroquia
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                disabled={!NewRegister.municipalityId}
                name="parishId"
                required={true}
                value={NewRegister?.parishId}
                onChange={handleChange}
              >
                {generalData?.municipalities
                  ?.find((obj) => obj?.id == NewRegister?.municipalityId)
                  ?.parishes.map((option) => (
                    <MenuItem
                      key={`${option.id}-${option.name} `}
                      value={option.id}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {submitStatus !== "Editar" && (
              <span className="col-span-3 flex justify-around">
                <label
                  className={`cursor-pointer p-2 px-3 hover:bg-light rounded text-blue1 ${
                    NewRegister?.status == 1 ? "font-bold" : ""
                  }`}
                >
                  <input
                    type="radio"
                    className="mr-3 scale scale-125"
                    name="status"
                    value={1}
                    checked={NewRegister?.status == 1}
                    onChange={handleChange}
                  />
                  En proceso
                </label>
                {NewRegister?.status == 1 &&
                  NewRegister.organizationObject.code !== "nocode" &&
                  NewRegister.organizationObject?.code?.length >= 1 && (
                    <small className="mt-2">
                      No se añadirá al inventario de{" "}
                      {NewRegister.organizationName} hasta que esté en
                      despachado
                    </small>
                  )}
                <label
                  className={`cursor-pointer p-2 px-3 hover:bg-light rounded text-blue1 ${
                    NewRegister?.status == 3 ? "font-bold" : ""
                  }`}
                >
                  <input
                    type="radio"
                    className="mr-3 scale scale-125"
                    name="status"
                    value={3}
                    checked={NewRegister?.status == 3}
                    onChange={handleChange}
                  />
                  Despachado
                </label>
              </span>
            )}
            {submitStatus == "Editar" && (
              <>
                <div>
                  {NewRegister?.status == 1 ? (
                    <div>
                      {" "}
                      <span className="bg-blue2 h-4 w-4 rounded-full inline-block"></span>{" "}
                      En Proceso
                    </div>
                  ) : (
                    <div>
                      {" "}
                      <span className="bg-green h-4 w-4 rounded-full inline-block"></span>{" "}
                      Despachado{" "}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center col-span-3 relative top-3">
                  Al editar se cancelará la versión anterior y se guardará esta
                  nueva{" "}
                </p>
              </>
            )}

            <Button3D
              className="mt-2 col-span-3"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
              text={submitStatus}
              fClick={(e) => {}}
            />
          </form>
        }
      ></Modal>
      {tabla}

      <Modal
        show={modalPdf}
        onClose={() => setModalPdf(false)}
        content={
          <PDFViewer
            style={{ width: "1000px", height: "800px" }}
            filename={`guia-${infoBill.guide}-${infoBill.code}`}
          >
            <OuputGuide
              output={infoBill}
              entityCode={props.userData.entityCode}
            />
          </PDFViewer>
        }
      ></Modal>

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

      {/* <PDFViewer style={{ width: "1000px", height: "800px" }}>
        <OuputGuide output={infoBill} userData={props.userData} />
      </PDFViewer> */}
    </>
  );
}
