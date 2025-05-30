import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
// import SettingsIcon from "@mui/icons-material/Settings";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
// import Chip from '@material-ui/core/Chip';
import Input from "../components/Input";
import InputWhite from "../components/InputWhite";
import MicIcon from '@mui/icons-material/Mic';
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Button3D from "../components/Button3D";
import ExpandRowProducts from "../components/ExpandRowProducts";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
// import { Suspense } from "react";
import CryptoJS from "crypto-js";
import { Box } from "@mui/material";
let tableSearchText = "";
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0"); // Get hours and pad with zero if needed
  const minutes = String(now.getMinutes()).padStart(2, "0"); // Get minutes and pad with zero if needed
  return `${hours}:${minutes}`; // Format as "HH:MM"
}

function limitObjectSize(obj, maxSize = 6) {
  const entries = Object.entries(obj);

  if (entries.length > maxSize) {
    // Sort by timestamp (newest first) and keep top maxSize
    const sortedEntries = entries.sort(
      (a, b) => b[1]._timestamp - a[1]._timestamp
    );
    const newestEntries = sortedEntries.slice(0, maxSize);

    // Rebuild object without timestamps
    // const result = {};
    // newestEntries.forEach(([key, value]) => {
    //   const { _timestamp, ...cleanValue } = value;
    //   result[key] = cleanValue;
    // });
    return newestEntries;
  }

  return obj;
}
const createHashFromTime = () => {
  // Get the current time in milliseconds
  const currentTimeInMillis = Date.now().toString();
  // Hash the current time
  const hash = CryptoJS.SHA256(currentTimeInMillis).toString();
  // Truncate hash to 6 characters
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

  useEffect(() => {
    document.title = "SISMED | Entradas";

    if (localStorage.getItem("entryForm")) {
      setLocalStorageForm(JSON.parse(localStorage.getItem("entryForm")));
    }
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
    conditions: [],
    entitiesObject: {},
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
    content: <></>,
  });

  const [typeOfGuide, setTypeOfGuide] = useState("nueva");

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    organizationId: null,
    organizationName: "",
    organizationObject: { organizationId: "", name: "" },
    arrivalTime: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    arrivalDate: new Date().toISOString().split("T")[0],
    products: [],
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
    filterList: [],
    filterObjectValues: {
      entityCode: props.userData.entityCode,
      organizationObj: { name: "", organizationId: null },
    },
  });

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
      name: "entityName",
      label: "Entidad",
      options: {
        display:
          parametersURL?.filterObject?.entityCode == "&entries[entityCode]=*"
            ? "true"
            : "excluded",
        filter: false,
        sort: true,
      },
    },
    {
      name: "entryCode",
      label: "Cód.",
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
    {
      name: "arrivalDate",
      label: "Fecha",
      options: {
        filter: false,
        customBodyRender: (value) => {
          const [year, month, day] = value?.split("-") || "n/a";
          return (
            <p>
              {day}-{month}-{year}
            </p>
          );
        },
      },
    },

    {
      name: "arrivalTime",
      label: "Hora",
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
        // filterList: parametersURL?.filterList[8] || [],
        // sort: true,
        // filterOptions: {
        //   names: generalData.organizations
        //     ? generalData.organizations.map((ent) => ent.name)
        //     : [""],
        // },
      },
    },

    {
      name: "authorityFullname",
      label: "Encargado de recibir",
      options: {
        // display: "excluded",
        filter: false,
      },
    },
    {
      name: "authorityCi",
      label: "C.I de encargado de recibir",
      options: {
        filter: false,
      },
    },

    {
      name: "status",
      label: "Estado",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[11] || [],
        sort: false,
        filterOptions: {
          names: ["Recibidos", "Cancelado"],
        },
      },
    },
    {
      name: "userFullName",
      label: "Registrado por",
      options: {
        filter: false,
      },
    },
  ];
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("_")) {
      // Campo dentro de products
      const [fieldName, index] = name.split("_");

      setNewRegister((prev) => {
        const updatedProducts = [...prev.products];
        updatedProducts[index][fieldName] = value;

        if (fieldName === "conditionId") {
          updatedProducts[index]["conditionName"] =
            generalData?.conditions?.find((obj) => obj.id == value).name;
        }
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
  };

  const handleSearchOrganizations = useDebounce(async (searchText) => {
    if (searchText.trim().length > 0) {
      try {
        const response = await axios.get(
          `dashboard/organizations?search[all]=${searchText}`
        );
        const responseSearch = response.data.data;
        setOrganizations(responseSearch);
        // Realiza las acciones necesarias con la respuesta de la solicitud
      } catch (error) {
        // Maneja los errores de la solicitud
      }
    }
  }, 250);

  const [organizationsEntries, setOrganizationsEntries] = useState(
    JSON.parse(localStorage.getItem("organizationsEntries")) || []
  );
  const [organizations, setOrganizations] = useState(organizationsEntries);

  const handleOptionSelectOrganizations = (event, value) => {
    if (value?.code.toLowerCase() !== "nocode") {
      setAlert({
        open: true,
        status: "Error",
        message: `${value.name}  debe registrar la salida de su inventario para recibirlo como entrada`,
      });
      setNewRegister((prev) => ({
        ...prev,
        organizationId: "",
        organizationName: "",

        organizationObject: {
          organizationId: "",
          name: "",
          code: "",
        },
      }));
      return;
    }
    if (value) {
      setNewRegister((prev) => ({
        ...prev,
        organizationId: value.id,
        organizationName: value?.name,

        organizationObject: {
          organizationId: value.id,
          name: value?.name,
          code: value?.code,
        },
      }));
    }
  };

  const [productsSearched, setProductsSearched] = useState([]);
  const [searchProductText, setSearchProductText] = useState("");
  const [typeProduct, setTypeProduct] = useState(
    props?.userData?.entityCode == 1 ? "*" : "2"
  );

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
      handleSearchForSelect(transcript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), typeProduct)
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

  const handleSearchForSelect = useDebounce(
    async (
      searchText,
      paramTypeProduct = props.userData?.entityCode == 1 ? "*" : "2"
    ) => {
      try {
        const response = await axios.get(
          `dashboard/products?search[all]=${searchText}&rowsPerPage=15&products[typeProduct]=${paramTypeProduct}`
        );
        const responseSearch = response.data.products;
        if (responseSearch.length > 0) {
          setProductsSearched(responseSearch);
        } else {
          setProductsSearched("No se encontró ningún producto");
        }

        // Realiza las acciones necesarias con la respuesta de la solicitud
      } catch (error) {
        // Maneja los errores de la solicitud
        // console.error(error);
      }
    },
    350
  );
  const [person, setPerson] = useState({
    authorityFullname: "",
    authorityCi: "",
  });
  // const [nameOptions, setNameOptions] = useState();

  const [authorityptions, setAuthorityptions] = useState(
    JSON.parse(localStorage.getItem("authorities")) || [
      { authorityFullname: "", authorityCi: "" },
    ]
  );

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

      // Aquí puedes realizar alguna acción adicional según tus necesidades cuando se seleccione una opción
    } else {
      // Si no se selecciona una opción, puedes reiniciar el nombre completo y cédula en el estado
      setNewRegister((prev) => ({
        ...prev,
        authorityFullname: "",
        authorityCi: "",
      }));
    }
  };
  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
    // setTimeout(() => {
    //   document.querySelectorAll(".productTd").forEach((allTd) => {
    //     if (tableSearchText.length > 1) {
    //       if (
    //         allTd.textContent
    //           .toLowerCase()
    //           .includes(tableSearchText.toLowerCase())
    //       ) {
    //         let trProduct = allTd.closest("tr");
    //         trProduct.style.background = "#FFFF00";
    //       }
    //     }
    //   });
    // }, 100);
  }, 350);

  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    let url = `dashboard/entries?entity=${parametersURL.filterObjectValues.entityCode}&relation=${relation}`;
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
      await axios.post(`/dashboard/cancellation/1`, obj).then((response) => {
        // setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
        setParametersURL((prev) => ({
          ...prev,
          page: 1,
          search: "",
          orderBy: "",
          orderDirection: "",
          filter: `&entries[entityCode]=${prev.filterObjectValues.entityCode}`,
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
      tableSearchText = searchText;
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
        if (changedColumn == "status") {
          arrValues = arrValues.map((eachValue) =>
            eachValue == "Recibidos" ? 1 : 2
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

    onColumnSortChange: (changedColumn, direction) => {
      if (changedColumn == "organizationObj") {
        changedColumn = "organizationName";
      }
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
          {dataTable[selectedRows.data[0].dataIndex]?.status == 1 && (
            <>
              <IconButton
                title="Copiar"
                onClick={async () => {
                  if (selectedRowRquest.id) {
                    editIconClick(selectedRowRquest, "Crear entrada", true);
                  } else {
                    window.alert("> Despliegue los productos");
                  }
                  // setIsButtonDisabled(true);
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                title="Editar"
                onClick={() => {
                  if (selectedRowRquest.id) {
                    editIconClick(selectedRowRquest, "Editar entrada", false);
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
                          Especifique porqué cancelará esta entrada
                        </p>{" "}
                        <InputWhite
                          key={8329}
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
      const entry = dataTable[rowMeta.dataIndex];
      // console.log(entry)
      return (
        <ExpandRowProducts
          id={entry.id}
          entityCode={entry.entityCode}
          code={entry.entryCode}
          route={"entry"}
          data={entry}
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
  function editIconClick(selectedRows, submitText, isJustForCopy = false) {
    // const indx = selectedRows.data[0].dataIndex;
    const copySelectedRowRquest = structuredClone(selectedRowRquest);

    setOrganizations([
      {
        id: copySelectedRowRquest?.organizationId || null,
        name: copySelectedRowRquest.organizationName,
      },
    ]);
    if (isJustForCopy) {
      copySelectedRowRquest.products.forEach((obj, indx) => {
        obj.loteNumber = "_"+createHashFromTime();
      });
    }

    setNewRegister({
      ...copySelectedRowRquest,
      // categoryObj: { name: copySelectedRowRquest.categoryName, id: copySelectedRowRquest.categoryId },
      organizationObject: {
        organizationId: copySelectedRowRquest.organizationId,
        name: copySelectedRowRquest.organizationName,
      },
      entryCode: isJustForCopy ? null : copySelectedRowRquest.entryCode,
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
      if (relation == true) {
        let entitiesObject = {};
        res.entities.forEach((obj) => {
          entitiesObject[obj.name] = obj.name;
        });
        setGeneralData({
          ...res,
          entitiesObject,
          entries: "",
        });
      }
      setIsLoading(false);
      setRelation(false);
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
        await axios
          .post(`/dashboard/entries`, NewRegister)
          .then((response) => {});
      }
      if (submitStatus === "Editar entrada") {
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/entries/${NewRegister.id}`, NewRegister)
          .then((response) => {});
        // fnEmptyRows([])
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
        filter: `&entries[entityCode]=${prev.filterObjectValues.entityCode}`,
        filterObjectValues: { entityCode: prev.filterObjectValues.entityCode },
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

      const newOrg = {
        name: NewRegister.organizationObject.name,
        id: NewRegister.organizationId,
        _timestamp: Date.now(),
        code: NewRegister.organizationObject.code,
      };
      let orgObjects = [...organizationsEntries];

      const indxFindOrg = orgObjects.findIndex(
        (obj) => obj.id == NewRegister.organizationId
      );
      if (indxFindOrg != -1) {
        orgObjects[indxFindOrg] = newOrg;
      } else {
        // Add to the beginning of the array
        orgObjects.unshift(newOrg);

        // If length exceeds 9, remove the last element
        if (orgObjects.length > 7) {
          orgObjects.pop();
        }
      }

      localStorage.setItem("authorities", JSON.stringify(objAutority));
      localStorage.setItem("organizationsEntries", JSON.stringify(orgObjects));
      setOrganizationsEntries(orgObjects);

      setOrganizations(orgObjects);

      setNewRegister({
        code: "",
        id: "",
        name: "",
        categoryId: "",
        medicamentId: "",
        typePresentationId: "",
        typeAdministrationId: "",
        arrivalTime: "",
        organizationId: "",
        organizationName: "",
        organizationObject: { name: "", organizationId: null },
        guide: "",
        authorityFullname: "",
        authorityCi: "",
        authorityObj: { authorityFullname: "", authorityCi: "" },
        unitPerPackage: "",
        concentrationSize: "",
        categoryObj: { name: "", id: "" },
        medicamentObj: { name: "N/A", id: 1 },
        typePresentationObj: { name: "N/A", id: 1 },
        typeAdministrationObj: { name: "N/A", id: 1 },
        arrivalDate: new Date().toISOString().split("T")[0],
        products: [],
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
      setSubmitStatus(() =>
        NewRegister.entryCode > 0 ? "Editar entrada" : "Crear entrada"
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
              <h1 className="text-grey  md:text-xl relative top-1 ">
                Entradas {props.userData.entityCode == 1 && "de"}
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
                      ] = `&entries[entityCode]=${e.target.value}`;
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
        options={options}
        columns={columns}
      />
    );
  }, [dataTable]);

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
            className="mt-2 "
            color={"red"}
            text="Nueva entrada"
            icon={"add"}
            fClick={(e) => {
              if (submitStatus == "Editar entrada") {
                setNewRegister({
                  code: "",
                  id: "",
                  name: "",
                  categoryId: "",
                  medicamentId: "",
                  organizationId: "",
                  typePresentationId: "",
                  typeAdministrationId: "",
                  arrivalDate: "",
                  arrivalTime: "",
                  guide: "",
                  authorityFullname: "",
                  authorityCi: "",
                  authorityObj: { authorityFullname: "", authorityCi: "" },
                  unitPerPackage: "",
                  concentrationSize: "",
                  categoryObj: { name: "", id: "" },
                  medicamentObj: { name: "N/A", id: 1 },
                  typePresentationObj: { name: "N/A", id: 1 },
                  typeAdministrationObj: { name: "N/A", id: 1 },
                  products: [],
                });
              }

              setNewRegister((prev) => ({
                ...prev,
                arrivalTime: getCurrentTime(),
              }));

              setOpen(true);
              setSubmitStatus("Crear entrada");
            }}
          />

          {localStorageForm && (
            <div
              className=" cursor-pointer mt-3 d-flex "
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
        <div className="flex items-center">
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
                ] = `&entries[organizationId]=${newValue.id}`;
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
                  e?.target?.value ||
                    NewRegister?.organizationObject?.name ||
                    ""
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
                label="Filtrar por origen"
              />
            )}
          />
        </div>
      </div>

      <Modal
        show={open}
        width={"96%"}
        onClose={() => (isSearchHidden == "absolute" ? "" : setOpen(false))}
        content={
          <form
            onSubmit={handleSubmit}
            className=" w-full gap-4 grid grid-cols-3 "
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
                  // Color={"white"}
                  onChange={(e) => {
                    setProductsSearched("Buscando...");
                    handleSearchForSelect(e.target.value, typeProduct);
                    setSearchProductText(e.target.value);
                    if (isSearchHidden == "hidden") {
                      setIsSearchHidden("absolute");
                    }
                    if (e.target.value.trim() == "") {
                      setIsSearchHidden("hidden");
                    }
                    // document.addEventListener("click", handleClickOutside);
                  }}
                  onFocus={(e) => {
                    setIsSearchHidden("absolute");
                  }}
                  onBlur={(e) => {
                    // setTimeout(() => {

                    setIsSearchHidden("hidden");
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

                <div>
                  <div
                    className="flex gap-2"
                    onClick={() => {
                      setIsSearchHidden("absolute");
                    }}
                  >
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md ${
                        typeProduct == "1"
                          ? "bg-blue1 text-white font-bold "
                          : "hover:bg-ligther bg-grey bg-opacity-10"
                      }`}
                      onClick={() => {
                        setProductsSearched("Buscando...");
                        document.querySelector("#searchInput").focus();
                        // setIsSearchHidden("absolute");
                        setTypeProduct("1");
                        handleSearchForSelect(searchProductText, 1); // Call with updated typeProduct
                      }}
                    >
                      Mayor
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md ${
                        typeProduct == "2"
                          ? "bg-blue1 text-white font-bold "
                          : "hover:bg-ligther bg-grey bg-opacity-10"
                      }`}
                      onClick={() => {
                        setProductsSearched("Buscando...");
                        document.querySelector("#searchInput").focus();
                        setTypeProduct("2");
                        // setIsSearchHidden("absolute");
                        handleSearchForSelect(searchProductText, 2); // Call with updated typeProduct
                      }}
                    >
                      Detal
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md ${
                        typeProduct == "*"
                          ? "bg-blue1 text-white font-bold "
                          : "hover:bg-ligther bg-grey bg-opacity-10"
                      }`}
                      onClick={() => {
                        setProductsSearched("Buscando...");
                        document.querySelector("#searchInput").focus();
                        // setIsSearchHidden("absolute");
                        setTypeProduct("*");
                        handleSearchForSelect(searchProductText, "*"); // Call with updated typeProduct
                      }}
                    >
                      Todos
                    </button>
                  </div>
                </div>
                <div
                  ref={searchRef}
                  className={`bg-ligther shadow-2xl  absolute left-0 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[73px] z-50   ${isSearchHidden}`}
                >
                  <table className=" ">
                    <thead>
                      <tr className="header  pb-0 text-left  bg-ligther text-dark text-xs">
                        <th className="py-2">Mayor/Detal</th>
                        <th className="py-2">Cód.</th>
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Uni. x env.</th>
                        <th className="py-2">presentación</th>
                        <th className="py-2">Concentración / tamaño</th>
                        <th className="py-2">Administración</th>
                        <th className="py-2">T. de medicamento</th>
                        <th className="py-2">Categoria</th>
                      </tr>
                    </thead>
                    {typeof productsSearched == "string" ? (
                      <p className="col-span-8 text-center py-4 font-bold">
                        {" "}
                        {productsSearched}{" "}
                      </p>
                    ) : (
                      <tbody>
                        {productsSearched?.map((product, i) => {
                          return (
                            <tr
                              key={`${product.id}+_${i}`}
                              className=" body border-b border-b-grey border-opacity-10   text-black items-center   hover:bg-blue1 hover:text-white cursor-pointer py-3"
                              onMouseDown={(e) => {
                                setIsSearchHidden("hidden");
                                setNewRegister((prev) => ({
                                  ...prev,
                                  products: [
                                    {
                                      loteNumber: "_" + createHashFromTime(),
                                      quantity: "",
                                      expirationDate: "",
                                      description: "Sin novedad",
                                      conditionId: 1,
                                      conditionName: "Buen estado",
                                      ...product,
                                      key: "",
                                    },
                                    ...prev?.products,
                                  ],
                                }));
                                setTimeout(() => {
                                  document
                                    .querySelector(`#loteNumber_0`)
                                    .select();
                                }, 100);
                              }}
                            >
                              <td className="p-2 px-6">
                                {product.type_product == 1 ? (
                                  <span className="text-green font-semibold">
                                    Mayor
                                  </span>
                                ) : (
                                  "Detal"
                                )}
                              </td>
                              <td className="p-2 px-6">{product.code}</td>
                              <td className="p-2 px-6"> {product.name}</td>
                              <td className="p-2 px-6">
                                {product.unitPerPackage > 1 ? (
                                  <span className="text-green font-semibold">
                                    {product.unitPerPackage}
                                    <small>x</small>{" "}
                                  </span>
                                ) : (
                                  <span>{product.unitPerPackage}</span>
                                )}
                              </td>
                              <td className="p-2 px-6">
                                {product.typePresentationName}
                              </td>
                              <td className="p-2 px-6">
                                {product.concentrationSize}
                              </td>
                              <td className="p-2 px-6">
                                {product.typeAdministrationName}
                              </td>
                              <td className="p-2 px-6">
                                {product.medicamentName}
                              </td>
                              <td className="p-2 px-6">
                                {product.categoryName}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
              <table className="w-full">
                <thead className="border py-2 my-3 border-light w-full">
                  <tr className="header p-0 bg-light text-dark text-xs">
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      #
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Nro Lote
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Cantidad
                    </th>
                    <th className="noPadding uppercase items-center flex justify-between text-dark text-left p-2 bg-th font-medium">
                      F. de vencimiento
                      <button
                        type="button"
                        title="Colocar todos en no vence"
                        className="text-xs inline bg-light mx-1 h-fit mt-1 py-2 px-1 rounded-md hover:bg-blue1 hover:text-white"
                        onClick={(e) => {
                          if (
                            window.confirm(
                              "Esto colocará todas las fechas de vencimieto en 09/09/9999"
                            )
                          ) {
                            setNewRegister((prev) => {
                              const updatedProducts = prev.products.map(
                                (pro) => {
                                  return {
                                    ...pro,
                                    expirationDate: "9999-09-09",
                                  };
                                }
                              );

                              return {
                                ...prev,
                                products: updatedProducts,
                              };
                            });
                          }
                        }}
                      >
                        N.V
                      </button>
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Estado
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Observación
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Cód. produ.
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Producto
                    </th>

                    <th className="opacity-50">
                      <DeleteIcon />
                    </th>
                  </tr>
                </thead>
                {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
                <tbody className="pl-5">
                  {NewRegister?.products?.map((product, i) => {
                    if (true) {
                      return (
                        <tr
                          key={product.id + "a" + i}
                          className="text-dark text-sm"
                        >
                          <td className="m">
                            {NewRegister?.products.length - i}
                          </td>
                          <td className="p-2   border-b border-opacity-80 min-w-[90px]  border-light">
                            <Input
                              label={"Nro lote"}
                              key={`loteNumber_${i}`}
                              value={NewRegister.products[i]?.loteNumber}
                              name={`loteNumber_${i}`}
                              required
                              id={`loteNumber_${i}`}
                              // data-index={i + 100}
                              size="small"
                              type={"text"}
                              onClick={(e) => {
                                e.target.select()
                              }}
                              onChange={handleChange}
                            />
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              // data-index={i}
                              label={"Cantidad"}
                              required
                              key={`quantity_${i}`}
                              id={`quantity_${i}`}
                              value={NewRegister.products[i]?.quantity}
                              name={`quantity_${i}`}
                              min={1}
                              onChange={handleChange}
                              type={"number"}
                            />
                          </td>

                          <td className="p-2  border-b border-opacity-80 border-light">
                            <div className="flex">
                              <Input
                                size="small"
                                // data-index={i}
                                required={true}
                                shrink="true"
                                type={"date"}
                                label={"F. de vencimiento"}
                                key={`expirationDate_${i}`}
                                value={NewRegister.products[i]?.expirationDate}
                                name={`expirationDate_${i}`}
                                onChange={handleChange}
                              />

                              <button
                                type="button"
                                title="No vence"
                                key={`expirationDateCheckbox_${i}`}
                                name={`expirationDate_${i}`}
                                id="nv"
                                className="text-xs inline bg-light mx-1 h-fit mt-1 py-2 px-1 rounded-md hover:bg-blue1 hover:text-white"
                                onClick={(e) => {
                                  setNewRegister((prev) => {
                                    const updatedProducts = [...prev.products];
                                    updatedProducts[i]["expirationDate"] =
                                      "9999-09-09";

                                    return {
                                      ...prev,
                                      products: updatedProducts,
                                    };
                                  });
                                }}
                              >
                                N.V
                              </button>
                            </div>
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              data-index={i}
                              select
                              label="Estado"
                              value={NewRegister.products[i]?.conditionId}
                              width={"100%"}
                              key={`conditionId_${i}`}
                              required
                              name={`conditionId_${i}`}
                              onChange={handleChange}
                            >
                              {generalData.conditions?.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.name}
                                </MenuItem>
                              ))}
                            </Input>
                          </td>
                          <td className="p-2  pl-2 border-b border-opacity-80 border-light">
                            <Input
                              label={"Observación"}
                              key={`description_${i}`}
                              value={NewRegister.products[i]?.description}
                              name={`description_${i}`}
                              size="small"
                              multiline
                              className="text-xs"
                              // data-index={i}
                              onChange={(e) => {
                                if (e.target.value.trim().length < 150) {
                                  handleChange(e);
                                }
                              }}
                            />
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            {product.code}
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            <p>
                              <b>{product.name}</b>{" "}
                              {product.unitPerPackage > 1 ? (
                                <span className="text-green font-semibold">
                                  {product.unitPerPackage}
                                  <small>x</small>{" "}
                                </span>
                              ) : (
                                <span>{product.unitPerPackage}</span>
                              )}{" "}
                              {product.typePresentationName != "N/A"
                                ? product.typePresentationName
                                : ""}{" "}
                              {product.concentrationSize != "N/A" && (
                                <b style={{ color: "#187CBA" }}>
                                  {" "}
                                  {product.concentrationSize}
                                </b>
                              )}
                            </p>
                          </td>

                          <td className="p-4">
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
                    }
                  })}
                </tbody>
              </table>
            </div>

            <TextField
              label="Nro guia"
              value={NewRegister.guide}
              name="guide"
              onChange={(e) => {
                handleChange(e);
              }}
              required
              type="number"
              key={5724}
            />

            <Autocomplete
              options={organizations}
              getOptionLabel={(option) => option.name}
              value={NewRegister?.organizationObject}
              onChange={(e, newValue) => {
                // console.lo
                handleOptionSelectOrganizations(e, newValue);
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={option.name + option.id}
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...optionProps}
                  >
                    {option.code !== props?.userData?.entityCode && (
                      <p>
                        <span style={{ color: "#011140", marginRight: "5px" }}>
                          {option.code !== "nocode" && <StoreIcon />}
                        </span>
                        {option.name}
                      </p>
                    )}
                  </Box>
                );
              }}
              onInputChange={(e, newValue) => {
                // console.lo

                if (typeOfGuide == "nueva") {
                  handleSearchOrganizations(
                    e?.target?.value ||
                      NewRegister?.organizationObject?.name ||
                      ""
                  );
                  // handleInputChangeOrganizations(e, newValue);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} required={true} label="Origen" />
              )}
            />

            <Input
              shrink={true}
              type={"date"}
              label={"Fecha de entrada"}
              required
              value={NewRegister?.arrivalDate}
              name={"arrivalDate"}
              onChange={handleChange}
            />
            <Input
              shrink={true}
              type={"time"}
              label={"Hora de entrada"}
              placeholder={"24h"}
              required
              value={NewRegister?.arrivalTime}
              name={"arrivalTime"}
              onChange={handleChange}
            />
            <Autocomplete
              options={Object.values(authorityptions)}
              getOptionLabel={(option) => option.authorityFullname}
              value={NewRegister}
              inputValue={NewRegister?.authorityFullname || ""}
              onChange={handleOptionSelect}
              onInputChange={handleInputChange}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  label="Nombre del encargado de recibir"
                />
              )}
            />

            <TextField
              label="Cédula del encargado"
              value={NewRegister.authorityCi}
              name="authorityCi"
              onChange={handleChange}
              required
              key={574}
            />
            {/* <Input
              label={"Nro de lote"}
              required
              key={1}
              value={NewRegister?.loteNumber}
              name={"loteNumber"}
              onChange={handleChange}
            /> */}

            {submitStatus == "Editar entrada" && (
              <p className="text-xs text-center col-span-3 relative top-3">
                Al editar se cancelará la versión anterior y se guardará esta
                nueva{" "}
              </p>
            )}
            <Button3D
              className="mt-2 col-span-3"
              color={submitStatus == "Crear entrada" ? "blue1" : "blue2"}
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
        content={modalConfirm.content}
      />
    </>
  );
}
