import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
// import { debounceSearchRender } from "../components/DebounceSearchRender";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Select from "@mui/material/Select";
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
import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

let oldTypeProduct = null
export default function Products_crud(props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Productos";
  }, []);

  const [data, setData] = useState([]);
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");
  const [productsSearched, setProductsSearched] = useState([]);

  const [typePresentations, setTypePresentations] = useState([]);
  const [TypeAdministrations, setTypeAdministrations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [Medicaments, setMedicaments] = useState([]);

  const [open, setOpen] = useState(false);
  const [openMicroVinculate, setOpenMicroVinculate] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  const handleSearchForSelect = useDebounce(async (searchText, type) => {
    try {
      const response = await axios.get(
        `dashboard/products?search[all]=${searchText}&rowsPerPage=15&products[typeProduct]=${type}`
      );
      const responseSearch = response.data.products;
      if (responseSearch.length > 0) {
        setProductsSearched(responseSearch);
      } else {
        setProductsSearched("No se encontró ningún producto Detal");
      }

      // Realiza las acciones necesarias con la respuesta de la solicitud
    } catch (error) {
      // Maneja los errores de la solicitud
      // console.error(error);
    }
  }, 350);
  const [newProduct, setnewProduct] = useState({
    code: "",
    id: "",
    name: "",
    minimumStock: 100,
    categoryId: "",
    medicamentId: 1,
    typePresentationId: 1,
    typeAdministrationId: 1,
    unitPerPackage: "",
    concentrationSize: "",
    categoryObj: { name: "", id: "" },
    medicamentObj: { name: "N/A", id: 1 },
    typePresentationObj: { name: "N/A", id: 1 },
    typeAdministrationObj: { name: "N/A", id: 1 },
    type_product: "",
  });

  const [vinculatedProducts, setVinculatedProducts] = useState({
    mayor: [],
    detal: null,
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
  });
  const [searchProductText, setSearchProductText] = useState("");

  const columns = [
    {
      name: "code",
      label: "Cód.",
      options: {
        filter: false,
      },
    },
    {
      name: "hasRelation",
      label: "Tipo de producto",
      options: {
        customBodyRender: (value) => {
          return (
            <p className="min-w-[85px] relative">
              {value.typeProduct == 1 ? (
                <span className="text-green font-semibold">Mayor</span>
              ) : (
                <span className="">Detal</span>
              )}
              {value.micros + value.macros > 0 && <p className="absolute bg-grey opacity-60 -top-2 left-10 w-4 text-xs  text-white  block items-center text-center aspect-square rounded-full" style={{textAlign:"center" }}> <span>{value.micros + value.macros}</span></p>}
            </p>
          );
        },
        filter: true,
        filterList: parametersURL?.filterList[1] || [],
        filterOptions: {
          names: ["Mayor", "Detal"],
        },
        filterType: "dropdown",
      },
    },
    {
      name: "name",
      label: "Nombre",
      options: {
        filter: false,
      },
    },
    {
      name: "unitPerPackage",
      label: "Unidades x envase",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return (
            <p className="min-w-[85px]">
              {value > 1 ? (
                <span className="text-green font-semibold">{value}</span>
              ) : (
                <span className="">{value}</span>
              )}
            </p>
          );
        },
      },
    },
    {
      name: "typePresentationName",
      label: "T. de presentación",
      options: {
        filter: false,
        filterList: parametersURL?.filterList[4] || [],
        sort: true,
        filterOptions: {
          names: typePresentations
            ? typePresentations.map((ent) => ent.name)
            : [""],
        },
      },
    },

    {
      name: "concentrationSize",
      label: "Concentración / tamaño",
      options: {
        filter: false,
      },
    },
    {
      name: "typeAdministrationName",
      label: "T. de administración",
      options: {
        filter: false,
        filterList: parametersURL?.filterList[6] || [],
        sort: true,
        filterOptions: {
          names: TypeAdministrations
            ? TypeAdministrations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "medicamentName",
      label: "T. de medicamento",
      options: {
        filter: false,
        filterList: parametersURL?.filterList[7] || [],
        sort: true,
        filterOptions: {
          names: Medicaments ? Medicaments.map((ent) => ent.name) : [""],
        },
      },
    },
    {
      name: "categoryName",
      label: "Categoria",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[8] || [],
        sort: true,
        filterOptions: {
          names: categories ? categories.map((ent) => ent.name) : [""],
        },
      },
    },
  ];

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  useEffect(() => {
    if (isButtonDisabled) {
      setIsButtonDisabled(false);
    }

    return () => {
      "";
    };
  }, [newProduct]);

  const [totalData, setTotalData] = useState(0);
  // const [filterObject, setFilterObject] = useState({})
  let filterObject = {};

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 400);
  useEffect(() => {
    setData([]);
    setIsLoading(true);
    let url = `dashboard/products?relation=${relation}`;
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

  const deleteRegister = async (id_user, fnEmptyRows) => {
    try {
      await axios.delete(`dashboard/products/${id_user}`).then((response) => {
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
  // const [rowSelected, setRowSelected] = useState([])
  const options = {
    print: false,
    count: totalData,
    selectToolbarPlacement: "above",
    rowsExpanded: [],
    rowsSelected: [],
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

      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      if (arrValues.length > 0) {
        if (changedColumn === "categoryName") {
          filterObject[changedColumn] =
            `&category[name]=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn == "medicamentName") {
          filterObject[changedColumn] =
            `&medicament[name]=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn == "typePresentationName") {
          filterObject[changedColumn] =
            `&typePresentation[name]=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn == "typeAdministrationName") {
          filterObject[changedColumn] =
            `&typeAdministration[name]=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn === "hasRelation") {
          if (arrValues == "Mayor") {
            arrValues = [1];
          } else {
            arrValues = [2];
          }
          filterObject[changedColumn] =
            `&products[typeProduct]=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        }
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
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
      <div>
        {data[selectedRows.data[0].dataIndex]?.type_product == 1 && (
          <IconButton
            title="Despachar"
            onClick={() => {
              getMicroProduct(selectedRows, "detail");
              setIsSearchHidden("absolute");
              handleSearchForSelect(
                data[selectedRows.data[0].dataIndex]?.name,
                2
              );
              setSearchProductText(data[selectedRows.data[0].dataIndex]?.name);
            }}
          >
            <div
              className={`border rounded border-green text-green px-3 text-sm font-bold`}
            >
              <span className="mr-2 ">Vincular a producto detal</span>
            </div>
          </IconButton>
        )}
        {data[selectedRows.data[0].dataIndex]?.type_product == 2 && (
          <IconButton
            onClick={() => {
              getMicroProduct(selectedRows, "macros");
              setIsSearchHidden("hidden");
              setSearchProductText("");

            }}
          >
            <div
              className={`border rounded border-dark text-dark px-3 text-sm font-bold`}
            >
              <span className="mr-2 ">Vincular a producto Mayor</span>
            </div>
          </IconButton>
        )}
        <IconButton
          title="Copiar"
          onClick={async () => {
            await editIconClick(
              selectedRows,

              "Crear"
            );
            setIsButtonDisabled(true);
          }}
        >
          <ContentCopyIcon />
        </IconButton>

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
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar este producto?",
              aceptFunction: () =>
                deleteRegister(
                  data[selectedRows.data[0].dataIndex].id,
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
  const getMicroProduct = async (selectedRows, type) => {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = data[indx];
    try {
      axios
        .get(`dashboard/products/${type}/${dataOfIndx.id}`)
        .then((response) => {
          setOpenMicroVinculate(true);
          if (type == "macros") {
            setVinculatedProducts({
              mayor: response.data.macros || null,
              detal: dataOfIndx,
              selectedType: type,
            });
          } else {
            setVinculatedProducts({
              mayor: [dataOfIndx],
              detal: response.data.detail || null,
              selectedType: type,
            });

          }
        });
    } catch (error) {}
  };
  function editIconClick(
    selectedRows,

    submitText
  ) {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = data[indx];
    oldTypeProduct = dataOfIndx.type_product
    setnewProduct({
      ...dataOfIndx,
      id: submitText == "Crear" ? "" : dataOfIndx.id,
      categoryObj: { name: dataOfIndx.categoryName, id: dataOfIndx.categoryId },
      medicamentObj: {
        name: dataOfIndx.medicamentName,
        id: dataOfIndx.medicamentId,
      },
      typePresentationObj: {
        name: dataOfIndx.typePresentationName,
        id: dataOfIndx.typePresentationId,
      },
      typeAdministrationObj: {
        name: dataOfIndx.typeAdministrationName,
        id: dataOfIndx.typeAdministrationId,
      },
    });
    setOpen(true);
    setSubmitStatus(submitText);
  }

  const handleAutoComplete = (newValue, name) => {
    if (newValue != null) {
      if (name == "category" && newValue.id != 1) {
        setnewProduct((prev) => ({
          ...prev,
          [name + "Id"]: newValue.id,
          categoryObj: newValue,
          medicamentId: 1,
          typePresentationId: 1,
          typeAdministrationId: 1,
          medicamentObj: { name: "N/A", id: 1 },
          typePresentationObj: { name: "N/A", id: 1 },
          typeAdministrationObj: { name: "N/A", id: 1 },
        }));
      } else {
        setnewProduct((prev) => ({
          ...prev,
          [name + "Id"]: newValue.id,
          [name + "Obj"]: newValue,
        }));
      }
    }
  };

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      setTotalData(res.total);

      setData(response.data.products);
      if (relation == true) {
        setTypePresentations(response.data.typePresentations);
        setTypeAdministrations(response.data.typeAdministrations);
        setCategories(response.data.categories);
        setMedicaments(response.data.medicaments);
      }
      setIsLoading(false);
      setRelation(false);
    });
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");
  const [submitStatusVinculate, setSubmitStatusVinculate] = useState(
    "Guardar vinculación"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === "Cargando...") {
      return;
    }
    const search = `${newProduct.code} ${newProduct.name} ${newProduct.typePresentationObj.name} ${newProduct.concentrationSize} `;
    try {
      setnewProduct((prev) => ({
        ...prev,
        search: search,
      }));
      if (submitStatus === "Crear") {
        setSubmitStatus("Cargando...");
        await axios
          .post(`/dashboard/products`, { ...newProduct, search })
          .then((response) => {
            // const client = response.data.client;
            // client.array_areas = client.areas.map((a) => a.name);
            // client.blood_name = client.blood_types.name;
            // setData((prev) => [client, ...prev]);
          });
        setAlert({
          open: true,
          status: "Exito",
        });
        setSubmitStatus("Crear");
      }
      if (submitStatus === "Editar") {
        
        
        if (newProduct.hasRelation.micros + newProduct.hasRelation.macros > 0 && oldTypeProduct != null && oldTypeProduct != newProduct.type_product) {
          if (!window.confirm(`Este producto es ${oldTypeProduct == 1 ? "Mayor y tiene" : "Detal y tiene"} 1 o más productos ${oldTypeProduct == 2 ? "Mayores" : "Detales"} vinculados. Al editar el tipo de producto se eliminarán las vinculaciones`)) {
            return;
        }
        }
        setSubmitStatus("Cargando...");
        await axios
          .put(`/dashboard/products/${newProduct.id}`, {
            ...newProduct,
            search,
          })
          .then((response) => {
            setAlert({
              open: true,
              status: "Exito",
            });
          });
      }
      setParametersURL({
        page: 1,
        rowsPerPage: 25,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: "",
        filterList: [],
        total: 0,
      });
      setOpen(false);
      setnewProduct({
        code: "",
        id: "",
        name: "",
        categoryId: "",
        medicamentId: 1,
        typePresentationId: 1,
        typeAdministrationId: 1,
        unitPerPackage: 1,
        concentrationSize: "",
        categoryObj: { name: "", id: "" },
        medicamentObj: { name: "N/A", id: 1 },
        typePresentationObj: { name: "N/A", id: 1 },
        typeAdministrationObj: { name: "N/A", id: 1 },
        minimumStock: 100,
        type_product: "",
      });
      oldTypeProduct = null
    } catch (error) {
      
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
      setSubmitStatus(() => (newProduct.id > 0 ? "Editar" : "Crear"));
    }
  };

  const saveVinculation = async (mayor, detal) => {
    // e.preventDefault();
    if (submitStatusVinculate === "Cargando...") {
      return;
    }
    setSubmitStatus("Cargando...");

    try {
      await axios
        .post(`/dashboard/products/detail/assign/${mayor.id}/${detal.id}`)
        .then((response) => {
          // const client = response.data.client;
          setAlert({
            open: true,
            status: "Exito",
            message: "Productos vinculados!",
          });
        });

        if ( vinculatedProducts.selectedType == "macros") {
          setVinculatedProducts((prev) => {
            if (prev.mayor == null) {
              return {
                ...prev,
                mayor: [{ ...mayor }],
              };
            } else {
              return {
                ...prev,
                mayor: [
                  { ...mayor },
                  ...prev.mayor,
                ],
              };
            }
          });
        } else {
          setVinculatedProducts((prev) => ({
            ...prev,
            detal: {
              ...detal,
            },
          }));
        }
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
    setSubmitStatusVinculate("Guardar vinculación");
  };

  const removeVinculation = async (mayor_id, detal_id) => {
    try {
      await axios
        .delete(`/dashboard/products/detail/free/${mayor_id}/${detal_id}`)
        .then((response) => {
          // const client = response.data.client;
          setAlert({
            open: true,
            status: "Exito",
            message: "El producto se desvinculó",
          });

          if (vinculatedProducts.selectedType == "macros") {
            setVinculatedProducts((prev) => ({
              ...prev,
               mayor: prev.mayor.filter(obj => obj.id != mayor_id),
            }));
          } else {
            setVinculatedProducts((prev) => ({
              ...prev,
              detal: null,
            }));
            
          }
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
  };

  const autoVinculation = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        `Esto creará un producto idéntico pero con la unidad por envase en uno, será un producto detal y se vinculará automáticamente.`
      )
    ) {
      return;
    }
    if (submitStatusVinculate === "Cargando...") {
      return;
    }
    setSubmitStatus("Cargando...");
    try {
      await axios
        .post(
          `/dashboard/products/detail/generate/${vinculatedProducts.mayor[0].id}`
        )
        .then((response) => {});
      setAlert({
        open: true,
        status: "Exito",
        message:
          "Se creó un producto idéntico pero con unidad por envase en 1 y se vinculó",
      });
      setParametersURL({
        page: 1,
        rowsPerPage: 25,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: "",
        filterList: [],
        total: 0,
      });
      setOpenMicroVinculate(false);
      setVinculatedProducts({ mayor: [], detal: null });
    } catch (error) {}
  };
  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">Productos</h1>
            </div>
          </div>
        }
        data={data}
        columns={columns}
        options={options}
      />
    );
  }, [data]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setnewProduct((prev) => ({ ...prev, [name]: value }));
  }, []);
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="flex justify-between pr-10 mt-10 items-center ">
        <Button3D
          className="mt-2"
          color={"red"}
          text="Nuevo producto"
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setnewProduct({
                code: "",
                id: "",
                name: "",
                categoryId: "",
                medicamentId: 1,
                typePresentationId: 1,
                typeAdministrationId: 1,
                unitPerPackage: 1,
                concentrationSize: "",
                categoryObj: { name: "", id: "" },
                medicamentObj: { name: "N/A", id: 1 },
                typePresentationObj: { name: "N/A", id: 1 },
                minimumStock: 100,
                typeAdministrationObj: { name: "N/A", id: 1 },
                type_product: "",
              });
            }
            setOpen(true);
            setSubmitStatus("Crear");
          }}
        />
        <NavLink to={"/dashboard/productos/config_products"}>
          <SettingsIcon className="mx-2" />
          Configuración de productos
        </NavLink>
      </div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form
            onSubmit={handleSubmit}
            className=" md:w-[500px] gap-4 grid grid-cols-2"
          >
            <FormControl fullWidth>
              <InputLabel id="pt" className="px-1 bg-white">
                Tipo de productos
              </InputLabel>
              <Select
                labelId="type_product"
                id="demo-simple-select"
                name="type_product"
                value={newProduct?.type_product}
                onChange={(e) => {
                  if (e.target.value == 2) {
                    newProduct.unitPerPackage = 1;
                  }
                  handleChange(e);
                }}
              >
                <MenuItem value={"1"}>Mayor</MenuItem>
                <MenuItem value={"2"}>Detal</MenuItem>
              </Select>
            </FormControl>
            <Input
              label={"Nombre"}
              required
              key={0}
              value={newProduct?.name}
              name={"name"}
              onChange={handleChange}
            />
            <Input
              key={5}
              label={"Unidad por envase"}
              required
              type="number"
              name={"unitPerPackage"}
              value={newProduct?.unitPerPackage}
              readOnly={newProduct?.type_product == 2}
              onChange={(e) => {
                if (e.target.value >= 0) handleChange(e);
              }}
            />

            <Autocomplete
              value={newProduct?.typePresentationObj}
              options={typePresentations}
              name="typePresentationId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[Medicaments[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Presentación"
                  required
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "typePresentation")
              }
            />
            <Input
              key={1}
              label={"Concentración / tamaño"}
              type="text"
              required
              name={"concentrationSize"}
              value={newProduct?.concentrationSize}
              onChange={handleChange}
            />
            <Autocomplete
              value={newProduct?.typeAdministrationObj}
              options={TypeAdministrations}
              name="typeAdministrationId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[TypeAdministrations[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Administración"
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "typeAdministration")
              }
            />

            {/* <label className="">
              <span>Categoria</span>
              <Input
                id=""
                select
                name="categoryId"
                value={newProduct.categoryId}
                onChange={handleChange}

                // value={user_type_selected}
              >
                {categories?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Input>
            </label> */}
            {/* <Autocomplete
              value={newProduct?.categoryObj}
              options={categories}
              name="categoryId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[Medicaments[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  variant="outlined"
                  label="Categoria"
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "category")
              }
            /> */}

            <FormControl fullWidth>
              <InputLabel
                id="demo-simple-select-label"
                className="px-1 bg-white"
              >
                Categoria *
              </InputLabel>
              <Select
                required
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name="categoryId"
                value={newProduct.categoryId}
                onChange={handleChange}
              >
                {categories?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {newProduct.categoryId === 1 && (
              <Autocomplete
                value={newProduct?.medicamentObj}
                options={Medicaments}
                name="medicamentId"
                getOptionLabel={(option) => option.name}
                // defaultValue={[Medicaments[0]]}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="T. de medicamento"
                    required
                    placeholder="Favorites"
                  />
                )}
                onChange={(event, newValue) =>
                  handleAutoComplete(newValue, "medicament")
                }
              />
            )}
            <Input
              key={7}
              label={"Alertar cuando hayan menos de:"}
              type="number"
              required
              name={"minimumStock"}
              value={newProduct?.minimumStock}
              onChange={(e) => {
                if (e.target.value >= 0) handleChange(e);
              }}
            />

            <Button3D
              className="mt-2 col-span-2"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
              disabled={isButtonDisabled}
              type={"submit"}
              text={submitStatus}
            />
          </form>
        }
      ></Modal>
      {tabla}

      <Modal
        show={openMicroVinculate}
        onClose={() => setOpenMicroVinculate(false)}
        minHeight={isSearchHidden !== "hidden" ? "500px" : "300px"}
        content={
          <form className="col-span-3">
            <p className="text-center mb-4 text-xs">PRODUCTOS VINCULADOS</p>
            <table className="w-full">
              <thead>
                <tr
                  className="header  pb-0 text-left  bg-ligther text-dark text-xs"
                  style={{ fontSize: "9px !important" }}
                >
                  <th className="py-2">Mayor/detal</th>
                  <th className="py-2">Código</th>
                  <th className="py-2">Producto</th>
                  <th className="py-2">Administración</th>
                  <th className="py-2">T. de medicamento</th>
                  <th className="py-2">Categoria</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
              <tbody className="pl-5">
                {vinculatedProducts.selectedType == "macros" && (
                  <tr>
                    <td className="p-2 px-6 font-bold text-green">Mayor</td>

                    <td colSpan={8} className="relative gap-2 w-full">
                      <Input
                        label="Buscar productos Mayores"
                        type="search"
                        key={84233793}
                        id="fsdad"
                        name={`e${Math.random()}`}
                        value={searchProductText}
                        className="max-w-[300px] "
                        // autoComplete={"off"}
                        autoComplete="random-string-123"
                        size={"small"}
                        // Color={"white"}
                        onChange={(e) => {
                          setProductsSearched("Buscando...");
                          handleSearchForSelect(e.target.value, 1);
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
                            <InputAdornment position="end">
                              <SearchIcon className="text-dark" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <div
                        ref={searchRef}
                        className={`bg-ligther shadow-2xl  absolute -left-36 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[44px] z-50   ${isSearchHidden}`}
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
                                    key={`${product.id}+${i}-9`}
                                    className={` body border-b border-b-grey border-opacity-10   text-black items-center   hover:bg-blue1 hover:text-white cursor-pointer py-3`}
                                    onMouseDown={(e) => {
                                      console.log({mayor: product, detal: vinculatedProducts.detal},  product.id,
                                        vinculatedProducts.detal.id)
                                      saveVinculation(
                                        product,
                                        vinculatedProducts.detal
                                      );
                                      
                                    }}
                                  >
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
                                      )}{" "}
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
                    </td>
                  </tr>

                )}
                {vinculatedProducts?.mayor?.map((mayorObj) => {
                  return (
                    <tr className="bg-light">
                      <td className="p-2 px-6 font-bold text-green">Mayor</td>

                      <td className="p-2 px-6">{mayorObj.code}</td>
                      <td className="p-2 px-6">
                        {" "}
                        <span>
                          <b>{mayorObj.name}</b>{" "}
                          {mayorObj.unitPerPackage > 1 ? (
                            <span className="text-green font-semibold">
                              {mayorObj.unitPerPackage}
                              <small>x</small>{" "}
                            </span>
                          ) : (
                            <span>{mayorObj.unitPerPackage}</span>
                          )}{" "}
                          {mayorObj.typePresentationName != "N/A"
                            ? mayorObj.typePresentationName
                            : ""}{" "}
                          {mayorObj.concentrationSize != "N/A" && (
                            <b style={{ color: "#187CBA" }}>
                              {" "}
                              {mayorObj.concentrationSize}
                            </b>
                          )}
                        </span>
                      </td>

                      <td className="p-2 px-6">
                        {mayorObj.typeAdministrationName}
                      </td>
                      <td className="p-2 px-6">{mayorObj.medicamentName}</td>
                      <td className="p-2 px-6">{mayorObj.categoryName}</td>

                      <td className="p-4">
                      {(vinculatedProducts.selectedType == "macros") && (

                        <button
                          onClick={(e) => {
                            removeVinculation(
                              mayorObj.id,
                              vinculatedProducts.detal.id
                            );
                          }}
                          type="button"
                          className="bg-light p-1 pr-1 font-bold text-dark hover:bg-red hover:text-light rounded-md text-center"
                        >
                          x
                        </button>
                      )}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td className="p-2 px-6 font-bold">Detal</td>
                  {vinculatedProducts.detal != null ? (
                    <>
                      <td className="p-2 px-6">
                        {vinculatedProducts.detal.code}
                      </td>
                      <td className="p-2 px-6">
                        {" "}
                        <span>
                          <b>{vinculatedProducts.detal.name}</b>{" "}
                          {vinculatedProducts.detal.unitPerPackage != "N/A"
                            ? vinculatedProducts.detal.unitPerPackage
                            : ""}{" "}
                          {vinculatedProducts.detal.typePresentationName !=
                          "N/A"
                            ? vinculatedProducts.detal.typePresentationName
                            : ""}{" "}
                          {vinculatedProducts.detal.concentrationSize !=
                            "N/A" && (
                            <b style={{ color: "#187CBA" }}>
                              {" "}
                              {vinculatedProducts.detal.concentrationSize}
                            </b>
                          )}
                        </span>
                      </td>

                      <td className="p-2 px-6">
                        {vinculatedProducts.detal.typeAdministrationName}
                      </td>
                      <td className="p-2 px-6">
                        {vinculatedProducts.detal.medicamentName}
                      </td>
                      <td className="p-2 px-6">
                        {vinculatedProducts.detal.categoryName}
                      </td>

                      <td className="p-4">
                        {(vinculatedProducts.selectedType == "detail") && (

                        <button
                          onClick={(e) => {
                             
                            removeVinculation(
                              vinculatedProducts.mayor[0].id,
                              vinculatedProducts.detal.id
                            );
                          }}
                          type="button"
                          className="bg-light p-1 pr-1 font-bold text-dark hover:bg-red hover:text-light rounded-md text-center"
                        >
                          x
                        </button>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={8} className="relative py-3 gap-2 w-full">
                      <Input
                        label="Buscar productos detal"
                        type="search"
                        key={842793}
                        id="fsdad"
                        name={`e${Math.random()}`}
                        value={searchProductText}
                        className="max-w-[300px] "
                        // autoComplete={"off"}
                        autoComplete="random-string-123"
                        size={"small"}
                        // Color={"white"}
                        onChange={(e) => {
                          setProductsSearched("Buscando...");
                          handleSearchForSelect(e.target.value, 2);
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
                            <InputAdornment position="end">
                              <SearchIcon className="text-dark" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <span className="mx-4">ó</span>
                      <div
                        ref={searchRef}
                        className={`bg-ligther shadow-2xl  absolute -left-36 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[54px] z-50   ${isSearchHidden}`}
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
                                    className={`${
                                      product.product_macro_id != null
                                        ? "text-opacity-65 brightness-75"
                                        : "font-semibold"
                                    } body border-b border-b-grey border-opacity-10   text-black items-center   hover:bg-blue1 hover:text-white cursor-pointer py-3`}
                                    onMouseDown={(e) => {
                                      if (product.product_macro_id != null) {
                                        window.alert(
                                          "Este producto ya está vinculado a otro mayor con código: " +
                                            product.product_macro_id
                                        );
                                        return;
                                      }

                                      saveVinculation(
                                        vinculatedProducts.mayor[0],
                                        product
                                      );
                                      
                                    }}
                                  >
                                    <td className="p-2 px-6">{product.code}</td>
                                    <td className="p-2 px-6">
                                      {" "}
                                      {product.name}
                                    </td>
                                    <td className="p-2 px-6">
                                      {product.unitPerPackage}
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
                      <button
                        type="button"
                        onClick={autoVinculation}
                        className="border rounded py-2.5 border-green text-green px-3 text-sm font-bold hover:text-white hover:bg-green"
                      >
                        Crear un producto detal automáticamente vinculado
                      </button>{" "}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
            {/* {showVinculateButton && (
              <Button3D
                className="mt-5 w-full  col-span-2"
                color={"blue1"}
                type={"submit"}
                text={submitStatusVinculate}
              />
            )} */}
          </form>
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
    </>
  );
}
