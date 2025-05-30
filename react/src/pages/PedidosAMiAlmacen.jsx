import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
import StoreIcon from "@mui/icons-material/Store";
import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import Select from "@mui/material/Select";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandRowProducts from "../components/ExpandRowProducts";

import { useLocation } from "react-router-dom";

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
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  organizationName: "&organization[name]=",
  day: "&requests-to-my-inventory[day]=",
  month: "&requests-to-my-inventory[month]=",
  year: "&requests-to-my-inventory[year]=",
  municipalityName: "&municipality[name]=",
  status: "&requestMyInventory[status]=",
  entityCodeFrom: "&entityCodeFrom=",
};
let filterObject = {};
let cleanRows = "";
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];

const statutes = [
  { name: "Sin responder", id: "5" },
  { name: "Aceptados", id: "6" },
  { name: "Rechazados", id: "7" },
];
let tableSearchText = ""

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0"); // Get hours and pad with zero if needed
  const minutes = String(now.getMinutes()).padStart(2, "0"); // Get minutes and pad with zero if needed
  return `${hours}:${minutes}`; // Format as "HH:MM"
}


export default function Pedidos(props) {
  const location = useLocation();

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const guideNumberInput = document.querySelector("#guideNumber");
      if (guideNumberInput && guideNumberInput === document.activeElement) {
        event.preventDefault();
        requestGuide("id", guideNumberInput.id);
      }
    }
  });



  

  const [isLoading, setIsLoading] = useState(true);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");
  const [localStorageForm, setLocalStorageForm] = useState(false);
  const [showAllStock, setShowAllStock] = useState(false);

  let selectedRowRquest = false;
  function updateRequestedProducts(product) {
    setRequestedProducts((prev) =>
      prev.map((obj) => {
        if (obj.code == product.code) {
          if (obj?.selected === true) {
            return {
              ...obj,
              selected: false,
            };
          } else {
            return {
              ...obj,
              selected: true,
            };
          }
        } else {
          return obj;
        }
      })
    );
  }
  function handleSelectRow(row) {
    selectedRowRquest = row;
  }

  useEffect(() => {
    document.title = "SISMED | Pedidos a mi almacen";

    if (localStorage.getItem("outputForm")) {
      setLocalStorageForm(JSON.parse(localStorage.getItem("outputForm")));
    }
  }, []);

  useEffect(() => {
    const searchInput = document.querySelector("#searchInput");
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

  const [organizations, setOrganizations] = useState([]);

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  let date = new Date().toISOString().split("T")[0];
  const [NewRegister, setNewRegister] = useState({
    status: 3,
    code: "",
    id: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    guide: "new",
    comment: "",
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
  useEffect(() => {
    if (NewRegister.products.length >= 1) {
      localStorage.setItem("outputForm", JSON.stringify(NewRegister));
    }
  }, [NewRegister]);

  // useEffect(() => {
  //   localStorage.setItem('outputForm', JSON.stringify(NewRegister))
  // }, [NewRegister]);

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
    filterObjectValues: { entityCode: props.userData.entityCode, status: 5 },
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
      name: "entityCodeName",
      label: "Pedido por",
      options: {
        // filter: true,
        customBodyRender: (value) => {
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
        },
        filterList: parametersURL?.filterList[8] || [],
        sort: true,
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

  const [productsSearched, setProductsSearched] = useState([]);
  const [requestedProducts, setRequestedProducts] = useState([]);

  const [searchProductText, setSearchProductText] = useState("");
  const handleSearchForSelect = useDebounce(async (searchText) => {
    try {
      const response = await axios.get(
        `dashboard/inventories?search[all]=${searchText}&rowsPerPage=13&entity=${props.userData.entityCode}`
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

  
  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})
  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 290);
  useEffect(() => {
    let url = `dashboard/requests-to-my-inventory?entity=${parametersURL.filterObjectValues.entityCode}&relation=${relation}`;
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
    const requestMyInventoryId = location.state?.requestMyInventoryId;
    if (requestMyInventoryId) {
      // Perform actions based on the ID
    }
    url += location.search.slice(1)
    getData(url);
    // url += `search?${parametersURL.search}`
  }, [parametersURL, location.state]);

  const deleteRegister = async (obj, fnEmptyRows) => {
    
    try {
      await axios
          .put(
            `/dashboard/requests-to-my-inventory/7/${obj.id}`
          )
          .then((response) => {});
          setParametersURL((prev) => ({
            ...prev,
            page: 1,
            rowsPerPage: parametersURL.rowsPerPage,
            search: "",
            orderBy: "",
            orderDirection: "",
            filter: `&requestMyInventory[status]=${prev.filterObjectValues.status}`,
            filterObjectValues: {
              status: prev.filterObjectValues.status,
            },
            filterObject,
            total: 0,
          }));
  
          setAlert({
            open: true,
            status: "Exito",
            message: "Pedido rechazado"
          });
          fnEmptyRows([])
      } catch (error) {
     
        setAlert({
          open: true,
          status: "Error",
          message: error.response?.data?.errors
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
      // let newFilterObject = { ...filterObject }; // Copia el objeto de filtro actual
      // let copyText= textFilterUrl
      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      if (arrValues.length > 0) {
        if (changedColumn == "entityCodeName") {
          changedColumn = "entityCodeFrom";
          for (let i = 0; i < generalData.entities.length; i++) {
            const element = generalData.entities[i];
            if (element.name == arrValues[0]) {
              arrValues = [element.code];
              break;
            }
          }
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
        filterObject,
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
          {parametersURL.filterObjectValues?.status == 5 && (
            <>
              <IconButton
                title="Responder pedido"
                onClick={
                  async () => {
                    if (selectedRowRquest.id) {
                      cleanRows = setSelectedRows;
               
                      setRequestedProducts(selectedRowRquest.products);
                      setNewRegister((prev) => ({
                        ...prev,
                        organizationId: selectedRowRquest.organization?.id,
                        organizationName: selectedRowRquest.organization?.name,
                        receiverFullname:
                          selectedRowRquest.organization?.authorityFullname,
                        receiverCi: selectedRowRquest.organization?.authorityCi,
                        organizationObject: {
                          organizationId: selectedRowRquest.organization?.id,
                          name: selectedRowRquest.organization?.name,
                          authorityFullname:
                            selectedRowRquest.organization?.authorityFullname,
                          authorityCi:
                            selectedRowRquest.organization?.authorityCi,
                          code: selectedRowRquest.organization?.code,
                        },
                        municipalityId:
                          selectedRowRquest.organization?.municipalityId,
                        municipalityName:
                          selectedRowRquest.organization?.municipalityName,
                        parishId: selectedRowRquest.organization?.parishId,
                        parishName: selectedRowRquest.organization?.parishName,
                        departureTime: getCurrentTime(),
                        id: selectedRowRquest.id,
                        comment: selectedRowRquest.comment,
                      }));
                      setOpen(true);
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
                  <span className="mr-2">Responder pedido</span>
                </div>
              </IconButton>

              <IconButton
                title="Rechazar pedido"
                onClick={
                  async () => {
                    if (selectedRowRquest.id) {
                      deleteRegister(
                        {
                          code: dataTable[selectedRows.data[0].dataIndex]
                            .outputCode,
                          id: selectedRowRquest.id
                        },
                        setSelectedRows
                      );
                    } else {
                      window.alert("> Despliegue los productos");
                    }
                    // await editIconClick(selectedRows, "Crear", true);
                  }
                  // setIsButtonDisabled(true);
                }
              >
                <div
                  className={`border rounded border-red text-red px-3 text-sm font-bold`}
                >
                  <span className="mr-2">Rechazar pedido</span>
                </div>
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
      const row = dataTable[rowMeta.dataIndex];

      return (
        <ExpandRowProducts
          id={row.id}
          entityCode={row.entityCode}
          code={row.code}
          route={"request-to-my-inventory"}
          isForRequest={true}
          data={row}
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
      setDataTable(res.requests);
      setIsLoading(false);
    });

    setRelation(false);
  };
  const requestGuide = async (type, id, justForBill = false) => {
    await axios
      .get(
        `dashboard/requests-to-my-inventory?requests-to-my-inventory[${type}]=${id}`
      )
      .then((response) => {
        const data = response.data.requests - to - my - inventory;
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
        let outpudIdReturn = false;
        await axios.post(`/dashboard/outputs`, NewRegister).then((response) => {
          outpudIdReturn = response.data.outputGeneralID;
        });
        await axios
          .put(
            `/dashboard/requests-to-my-inventory/6/${NewRegister.id}/${outpudIdReturn}`
          )
          .then((response) => {});
      }
      cleanRows([]);

      setSubmitStatus("Crear");
      setAlert({
        open: true,
        status: "Exito",
        message: "La solicitud fue aceptada y se creó una salida",
      });
      setOpen(false);
      setParametersURL((prev) => ({
        ...prev,
        page: 1,
        rowsPerPage: parametersURL.rowsPerPage,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: `&requestMyInventory[status]=${prev.filterObjectValues.status}`,
        filterObjectValues: { status: prev.filterObjectValues.status },
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
        status: 3,
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
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">
                Pedidos a mi almacen
              </h1>
              <span className="relative -top-2">
                <Input
                  name="user_type"
                  id=""
                  select
                  value={parametersURL.filterObjectValues.status}
                  // value={props.userData.entityCode}
                  size="small"
                  className="ml-4 bg-blue/0 py-1 font-bold"
                  onChange={(e) => {
                    filterObject[
                      "status"
                    ] = `&requestMyInventory[status]=${e.target.value}`;
                    setParametersURL((prev) => ({
                      ...prev,
                      filter: Object.values(filterObject).join(""),
                      page: 1,
                      filterObjectValues: {
                        ...prev.filterObjectValues,
                        status: e.target.value,
                      },
                      filterObject,
                    }));
                  }}
                  // value={user_type_selected}
                >
                  {statutes?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                  {/* <MenuItem key={"todos"} value={"*"}>
                      Todos
                    </MenuItem> */}
                </Input>
              </span>
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
  const [selectedRow, setSelectedRow] = useState(0);

  const setSelected = (index) => {
    setSelectedRow(index);
  };
  const [lotsInventoryData, setLotsInventoryData] = useState(false);
  const [typeOfGuide, setTypeOfGuide] = useState("nueva");
  return (
    <>
      <div className="flex gap-10 mt-16"></div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        width={"w-[99%]"}
        content={
          <form
            onSubmit={handleSubmit}
            className=" gap-4 grid grid-cols-6 "
            id="outputForm"
          >
            <div
              className="col-span-2 overflow-hidden  overflow-y-scroll  sticky top-0"
              style={{ maxHeight: "80vh" }}
            >
              <h2 className="font-bold"> <span className="opacity-80">Pedido de:</span>  {NewRegister.organizationName}l</h2>
              <p className="border border-light rounded-xl p-3 my-3">{NewRegister.comment}
              </p>

              <table className="w-full pr-3">
                <thead>
                  <th className="noPadding text-left p-2 px-1 font-normal text-sm">
                    N°
                  </th>
                  <th className="noPadding text-left p-2 px-1 font-normal text-sm">
                    Cod.
                  </th>
                  <th className="noPadding text-left p-2 px-1 font-normal text-sm">
                    Producto
                  </th>
                  <th className="noPadding text-right p-2 px-1 font-normal text-sm">
                    Cant.
                  </th>
                </thead>
                <tbody style={{ fontSize: "12px" }}>
                  {requestedProducts.map((product, i) => {
                    return (
                      <tr
                        onClick={(e) => {
                          setLotsInventoryData(false);
                          setSearchProductText(
                            `${product.name} ${
                              product.unitPerPackage != "N/A"
                                ? product.unitPerPackage
                                : ""
                              } ${
                                product.typePresentationName != "N/A"
                                ? product.typePresentationName
                                : ""
                              } ${
                                product.concentrationSize != "N/A"
                                ? product.concentrationSize
                                : ""
                              }`
                            );
                            setProductsSearched([{ ...product }]);
                            setTimeout(() => {
                              document.querySelector("#searchInput").select();
                          
                            }, 100);

                          axios
                            .get(
                              `dashboard/detail-inventory/${product.productId}/${props.userData.entityCode}`
                            )
                            .then((response) => {
                              const lots = response.data.lotsPerOrigin;
                              if (lots.length == 0) {
                                setProductsSearched([{ ...product, stock: 0 }]);
                                setLotsInventoryData([]);

                              } else {
                                let valueLots = Object.values(lots)[0];
                                let sum =
                                  valueLots.expired.reduce(
                                    (acc, sum) => acc + sum.stock,
                                    0
                                  ) +
                                  valueLots.bad.reduce(
                                    (acc, sum) => acc + sum.stock,
                                    0
                                  ) +
                                  valueLots.good.reduce(
                                    (acc, sum) => acc + sum.stock,
                                    0
                                  ) +
                                  valueLots.perExpire.reduce(
                                    (acc, sum) => acc + sum.stock,
                                    0
                                  );
                                setProductsSearched([
                                  { ...product, stock: sum },
                                ]);

                                setLotsInventoryData(lots);
                                setTimeout(() => {
                                  document.querySelector(`#quantity_0`)?.focus();
                                  document
                                    .querySelectorAll(".trSearchedProducts")[0]
                                    ?.scrollIntoView();
                                }, 100);
                              }
                            });
                          setIsSearchHidden("absolute");
                          // Smooth scroll the search window to the clicked row position
                          setSelectedRow(0);
                        }}
                        className={`${
                          product?.selected ? "bg-blue3 bg-opacity-60" : ""
                        } body border-b border-b-grey border-opacity-10 px-3 px-30 text-black hover:bg-blue1 hover:text-white  cursor-pointer py-3 `}
                        key={i + "-" + product.code}
                      >
                        <td className="p-2 px-1 border-r border-r-light list-disc">
                          {i + 1}
                        </td>

                        <td className="p-2 px-1  ">{product.code}</td>
                        <td className="p-2 px-1  ">
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
                        <td>
                          <p
                            className={`${
                              product?.selected &&
                              product.totalSending &&
                              Object?.values?.(product?.totalSending)?.reduce(
                                (quantity, prev) => quantity + prev
                              ) >= product.requestedQuantity
                                ? "text-blue1 "
                                : " text-red"
                            } text-right  p-2 px-1 pr-2   font-bold`}
                          >
                            {product.requestedQuantity}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="col-span-4   gap-4 grid grid-cols-3 h-fit">
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
                        <InputAdornment position="end">
                          <SearchIcon className="text-dark" />
                        </InputAdornment>
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
                                        const lots =
                                          response.data.lotsPerOrigin;
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
                                                            value.conditionId ==
                                                            3
                                                          ) {
                                                            return "bg-red text-white";
                                                          } else if (
                                                            value.conditionId ==
                                                            2
                                                          ) {
                                                            return "bg-orange text-white";
                                                          } else if (
                                                            value.conditionId ==
                                                              1 ||
                                                            value.conditionId ==
                                                              4
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
                                                              updateRequestedProducts(
                                                                product
                                                              );
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
                                                            {
                                                              value.conditionName
                                                            }
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </td>
                                                  <td className="bg-ligther text-dark p-3">
                                                    {value.organizationCode !==
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
                            <td className="p-4 px-2">
                              {product.expirationDate}
                            </td>
                            {/* <td className="p-4 px-2">{product.stock}</td> */}
                            <td className="p-4 px-2 flex items-center gap-2 min-w-[184px] max-w-[184px]">
                              <Input
                                size="small"
                                data-index={i}
                                label={"Cantidad"}
                                required
                                // placeholder={"ayy"}
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
                                    setRequestedProducts((prev) =>
                                      prev.map((obj) => {
                                        if (obj.code == product.code) {
                                       
                                          if (obj.totalSending) {
                                          
                                            return {
                                              ...obj,
                                              totalSending: {
                                                ...obj?.totalSending,
                                                [product.loteNumber]:
                                                  e.target.value,
                                              },
                                            };
                                          } else {
                                            
                                            return {
                                              ...obj,
                                              totalSending: {
                                                [product.loteNumber]:
                                                  e.target.value,
                                              },
                                            };
                                          }
                                        } else {
                                   

                                          return { ...obj };
                                        }
                                      })
                                    );
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
                                  updateRequestedProducts(product);
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
                    )}
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
                <FormControl fullWidth>
                  <InputLabel id="Destino" className="px-1 bg-white">
                    Destino
                  </InputLabel>
                  <Select
                    labelId="Destino"
                    id="demo-simple-select"
                    name="orgnizationId"
                    value={NewRegister?.organizationId}
                    onChange={handleChange}
                  >
                    <MenuItem value={NewRegister.organizationId}>
                      {NewRegister.organizationName}
                    </MenuItem>
                  </Select>
                </FormControl>

                <Input
                  label={"Nombre de quien recibe"}
                  shrink={
                    NewRegister?.receiverFullname?.length > 1 ? "true" : false
                  }
                  required
                  // type={'text'}
                  key={0}
                  name={"receiverFullname"}
                  onChange={handleChange}
                  value={NewRegister?.receiverFullname}
                />
                <span>
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
                        checkIfHasARecentGuide(e.target.value);
                      } else {
                        setIsThereARecentGuide("");
                      }
                      handleChange(e);
                    }}
                    value={NewRegister?.receiverCi}
                  />
                  {isThereARecentGuide?.length > 1 && (
                    <p className="text-red text-xs">{isThereARecentGuide}</p>
                  )}
                </span>
              </>

              <Input
                shrink={"true"}
                type={"date"}
                label={"Fecha de salida"}
                required
                value={NewRegister?.departureDate}
                name={"departureDate"}
                onChange={handleChange}
              />
              <Input
                shrink={"true"}
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
                  <MenuItem value={NewRegister.municipalityId}>
                    {NewRegister.municipalityName}
                  </MenuItem>
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
                  disabled={!NewRegister.parishId}
                  name="parishId"
                  value={NewRegister?.parishId}
                  onChange={handleChange}
                >
                  <MenuItem value={NewRegister.parishId}>
                    {NewRegister.parishName}
                  </MenuItem>
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
                    Al editar se cancelará la versión anterior y se guardará
                    esta nueva{" "}
                  </p>
                </>
              )}

              <Button3D
                className="mt-2 col-span-3"
                color={submitStatus == "Crear" ? "blue1" : "blue2"}
                text={submitStatus}
                fClick={(e) => {}}
              />
            </div>
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
