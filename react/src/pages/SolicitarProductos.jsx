import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
// import SettingsIcon from "@mui/icons-material/Settings";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Select from "@mui/material/Select";
import StoreIcon from "@mui/icons-material/Store";

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
import ExpandRowProducts from "../components/ExpandRowProducts";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
// import { Suspense } from "react";
import MicIcon from '@mui/icons-material/Mic';

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
let tableSearchText = ""

const currentDate = new Date();
export default function SolicitarProductos(props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Solicitar productos";
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

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    comment: "",
    entityCodeDestiny: "",
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
    filterObjectValues: { status: "5" },

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
      name: "code",
      label: "Cód",
      options: {
        filter: false,
      },
    },

    {
      name: "date",
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
      name: "time",
      label: "Hora",
      options: {
        filter: false,
      },
    },
    {
      name: "entityCodeDestinyName",
      label: "Solicitado a",
      options: {
        // filter: true,
        customBodyRender: (value) => {
          if (generalData?.entitiesObject[value]) {
            return (
              <div className="flex">
                <p>
                  {" "}
                  <span className="text-blue1">
                    <StoreIcon style={{ fontSize: "15px" }} />
                  </span>{" "}
                  {value}
                </p>
              </div>
            );
          } else {
            return <p>{value}</p>;
          }
        },
        filterList: parametersURL?.filterList[6] || [],
        // sort: true,
        filterType: "dropdown",
        filterOptions: {
          names: generalData.entities
            ? generalData.entities.map((ent) => {
                if (props.userData.entityCode != ent.code) {
                  return ent.name;
                } else {
                  return "";
                }
              })
            : [""],
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
      name: "comment",
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

  const handleChange = (e) => {
    const { name, value } = e.target;

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
  };

  const [organizations, setOrganizations] = useState([]);

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
        `dashboard/products?search[all]=${searchText}&rowsPerPage=13`
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
  }, 290);
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

  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText }));
  }, 290);
  useEffect(() => {
    setDataTable([]);
    setIsLoading(true);
    let url = `dashboard/request-products?relation=${relation}`;
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
        .delete(`dashboard/request-products/${obj.id}`)
        .then((response) => {
          // setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
          setParametersURL((prev) => ({
            ...prev,
            page: 1,
            search: "",
            orderBy: "",
            orderDirection: "",
            filter: `&requestProduct[status]=${prev.filterObjectValues.status}`,
            filterObjectValues: {
              status: prev.filterObjectValues.status,
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
    selectToolbarPlacement: 'above',
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

    onSearchChange: (searchText) => {
      handleSearch(searchText);
      tableSearchText = searchText
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
          <IconButton
            title="Copiar"
            onClick={async () => {
              if (selectedRowRquest.id) {
                await editIconClick(selectedRowRquest, "Crear solicitud", true);
              } else {
                window.alert("> Despliegue los productos");
              }
              // setIsButtonDisabled(true);
            }}
          >
            <ContentCopyIcon />
          </IconButton>
          {parametersURL.filterObjectValues?.status == 5 && (
            <>
              <IconButton
                title="Editar"
                onClick={() => {
                  if (selectedRowRquest.id) {
                    editIconClick(selectedRowRquest, "Editar");
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
                  if (
                    window.confirm("¿Está seguro de cancelar esta solicitud?")
                  ) {
                    deleteRegister(
                      {
                        id: dataTable[selectedRows.data[0].dataIndex].id,
                      },
                      setSelectedRows
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
    expandableRowsOnClick: true,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      const entry = dataTable[rowMeta.dataIndex];
      // console.log(entry)
      return (
        <ExpandRowProducts
          id={entry.id}
          entityCode={entry.entityCode}
          code={entry.code}
          route={"request"}
          data={entry}
          isForRequest={true}
          status={parametersURL.filterObjectValues?.status}
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

    setNewRegister({
      ...copySelectedRowRquest,
      // categoryObj: { name: copySelectedRowRquest.categoryName, id: copySelectedRowRquest.categoryId },
      organizationObject: {
        organizationId: copySelectedRowRquest.organizationId,
        name: copySelectedRowRquest.organizationName,
      },
      entryCode: isJustForCopy ? null : copySelectedRowRquest.entryCode,
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
      setDataTable(res.requests);
      if (relation == true) {
        let entitiesObject = {};
        res.entities.forEach((obj) => {
          entitiesObject[obj.name] = obj.name;
        });
        setGeneralData({
          ...res,
          entitiesObject,
          requests: "",
        });
      }
      setIsLoading(false);
      setRelation(false);
    });
  };
  // console.log(generalData.entitiesObject)
  const [submitStatus, setSubmitStatus] = useState("Crear solicitud");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus == "Cargando...") {
      return;
    }

    try {
      if (submitStatus === "Crear solicitud") {
        setSubmitStatus("Cargando...");
        await axios
          .post(`/dashboard/request-products`, NewRegister)
          .then((response) => {});
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/request-products/${NewRegister.id}`, NewRegister)
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
        filter: `&requestProduct[status]=${prev.filterObjectValues.status}`,
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
        comment: "",
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
        NewRegister.entryCode > 0 ? "Editar" : "Crear solicitud"
      );
    }
  };

  function changeStatus(event) {
    filterObject["status"] = `&requestProduct[status]=${event.target.value}`;
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
          <div className="flex">
            <h1>Solicitar productos</h1>

            <div className="pl-6 flex flex-col md:flex-row gap-2">
              {statutes?.map((option) => {
                return (
                  <label
                  key={option.id}
                    className={`px-2 cursor-pointer border rounded-md border-grey hover:bg-light ${
                      parametersURL.filterObjectValues.status === option.id
                        ? "bg-blue1 text-white"
                        : ""
                    } `}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      value={option.id}
                      checked={
                        parametersURL.filterObjectValues.status === option.id
                      }
                      onChange={changeStatus}
                    />
                    {option.name}
                  </label>
                );
              })}
              {/* <input type="radio" className={'px-2 border rounded-md border-grey hover:bg-light bg-blue1 text-white'}>Sin respuesta</input>
              <input type="radio" className={'px-2 border rounded-md border-grey hover:bg-light '}>Aceptados</input>
              <input type="radio" className={'px-2 border rounded-md border-grey hover:bg-light '}>Rechazados</input> */}
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
      <div className="flex gap-10 ">
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
                comment: "",
                entityCodeDestiny: "",
                products: [],
              });
            }
            setOpen(true);
            setSubmitStatus("Crear solicitud");
          }}
        />
      </div>

      <Modal
        show={open}
        width={"96%"}
        minHeight={"500px"}
        onClose={() => (isSearchHidden == "absolute" ? "" : setOpen(false))}
        content={
          <form
            onSubmit={handleSubmit}
            className=" w-full gap-4 grid grid-cols-4 "
          >
            <div className="col-span-2">
              <span className="text-blue1"></span>
              <FormControl fullWidth>
                <InputLabel id="destino" className="px-1 bg-white">
                  <StoreIcon style={{ marginRight: "5px" }} />
                  Solicitar a
                </InputLabel>
                <Select
                  labelId="destino"
                  id="demo-simple-select"
                  name="entityCodeDestiny"
                  value={NewRegister?.entityCodeDestiny}
                  onChange={handleChange}
                  required={true}
                >
                  {generalData.entities?.map((option) =>
                    option.code != props?.userData?.entityCode ? (
                      <MenuItem key={option.code} value={option.code}>
                        {option.name}
                      </MenuItem>
                    ) : (
                      ""
                    )
                  )}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-2">
              <Input
                label={"Mensaje (opcional)"}
                key={`comment`}
                value={NewRegister.comment}
                name={`comment`}
                multiline
                // data-index={i}
                onChange={(e) => {
                  if (e.target.value.length < 150) {
                    handleChange(e);
                  }
                }}
              />
            </div>

            <div className="col-span-4 mb-5">
              <div className="flex items-center gap-3 rounded-t-lg  bg-light text-dark p-4 relative">
                <b>Productos:</b>
                <Input
                  label="Buscar productos"
                  type="search"
                  key={84279453}
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
                <div
                  ref={searchRef}
                  className={`bg-ligther shadow-2xl  absolute left-0 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[73px] z-50   ${isSearchHidden}`}
                >
                  <table className=" ">
                    <thead>
                      <tr className="header  pb-0 text-left  bg-ligther text-dark text-xs">
                        <th className="py-2">Cód. produ.</th>
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
                              key={`${product.id}+${i}`}
                              className=" body border-b border-b-grey border-opacity-10   text-black items-center   hover:bg-blue1 hover:text-white cursor-pointer py-3"
                              onMouseDown={(e) => {
                                if (selectedProductsNewRegister[product.code] && NewRegister.products.length > 0) {
                                  window.alert(
                                    "Este producto ya fue seleccionado. " +
                                      "Código: " +
                                      product.code
                                  );
                                  return;
                                } else {
                                  selectedProductsNewRegister[product.code] =
                                    "true";

                                  setNewRegister((prev) => ({
                                    ...prev,
                                    products: [
                                      {
                                        requestedQuantity: 50,
                                        ...product,
                                        key: "",
                                      },
                                      ...prev?.products,
                                    ],
                                  }));
                                }
                                setTimeout(() => {
                                  document
                                    .querySelector(`#requestedQuantity_0`)
                                    .focus();
                                }, 100);
                              }}
                            >
                              <td className="p-2 px-6">{product.code}</td>
                              <td className="p-2 px-6"> {product.name}</td>
                              <td className="p-2 px-6">
                              {product.unitPerPackage > 1 ? <span className="text-green font-semibold">{product.unitPerPackage}<small>x</small> </span> : <span>{product.unitPerPackage}</span>}
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
                      Cód. produ.
                    </th>
                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Producto
                    </th>

                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      Cantidad
                    </th>

                    <th className="noPadding uppercase text-dark text-left p-2 bg-th font-medium">
                      T. de medicamento
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
                          <td className="p-2   border-b border-opacity-80 border-light">
                            {product.code}
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            <p>
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
                            </p>
                          </td>
                          <td className="p-2   border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              // data-index={i}
                              label={"Cantidad"}
                              required
                              id={`requestedQuantity_${i}`}
                              key={`requestedQuantity_${i}`}
                              value={NewRegister.products[i]?.requestedQuantity}
                              name={`requestedQuantity_${i}`}
                              onChange={(e) => {
                                if (e.target.value > 0) handleChange(e);
                              }}
                              type={"number"}
                            />
                          </td>

                          <td className="p-2   border-b border-opacity-80 border-light">
                            <p>{product.medicamentName}</p>
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
                                delete selectedProductsNewRegister[
                                  product.code
                                ];
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
