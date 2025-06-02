import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
// import { debounceSearchRender } from "../components/DebounceSearchRender";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  IconButton,
} from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";

import useDebounce from "../components/useDebounce";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

let oldTypeProduct = null
export default function Products_crud(props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SIGEM | Equipos Médicos";
  }, []);

  const [data, setData] = useState([]);
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");
  const [productsSearched, setProductsSearched] = useState([]);

  const [open, setOpen] = useState(false);
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
    equipment_name: "",
    brand: "",
    model: "",
    consumables: [],
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
      name: "equipment_name",
      label: "Nombre del equipo",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "brand",
      label: "Marca",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "model",
      label: "Modelo",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "consumables",
      label: "Consumibles",
      options: {
        filter: false,
        customBodyRender: (value) => {
          if (!value || value.length === 0) return "N/A";
          return value.slice(0, 2).join(", ") + (value.length > 2 ? "..." : "");
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
        if (changedColumn === "equipment_name") {
          filterObject[changedColumn] =
            `&equipment_name=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn == "brand") {
          filterObject[changedColumn] =
            `&brand=` +
            encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"));
        } else if (changedColumn == "model") {
          filterObject[changedColumn] =
            `&model=` +
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
              modalInfo: "¿Quiere eliminar este equipo médico?",
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
              <h1 className="text-grey text-xl relative top-1 ">Equipos Médicos</h1>
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
          text="Nuevo equipo médico"
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setnewProduct({
                code: "",
                id: "",
                equipment_name: "",
                brand: "",
                model: "",
                consumables: [],
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
            className=" md:w-[500px] gap-4 grid grid-cols-2"
          >

            <Input
              label={"Nombre del equipo"}
              required
              key={0}
              value={newProduct?.equipment_name}
              name={"equipment_name"}
              onChange={handleChange}
            />
            <Input
              key={1}
              label={"Marca"}
              type="text"
              required
              name={"brand"}
              value={newProduct?.brand}
              onChange={handleChange}
            />
            <Input
              key={2}
              label={"Modelo"}
              type="text"
              required
              name={"model"}
              value={newProduct?.model}
              onChange={handleChange}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consumibles necesarios
              </label>
              <div className="space-y-2">
                {newProduct?.consumables?.map((consumable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={consumable}
                      onChange={(e) => {
                        const newConsumables = [...(newProduct.consumables || [])];
                        newConsumables[index] = e.target.value;
                        setnewProduct(prev => ({...prev, consumables: newConsumables}));
                      }}
                      placeholder="Nombre del consumible"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newConsumables = newProduct.consumables.filter((_, i) => i !== index);
                        setnewProduct(prev => ({...prev, consumables: newConsumables}));
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newConsumables = [...(newProduct.consumables || []), ""];
                    setnewProduct(prev => ({...prev, consumables: newConsumables}));
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Agregar consumible
                </button>
              </div>
            </div>

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
