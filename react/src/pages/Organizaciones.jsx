import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StoreIcon from "@mui/icons-material/Store";

// import Chip from '@material-ui/core/Chip';
import { IconButton, InputLabel, FormControl, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";

// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  municipalityName: "&municipality[id]=",
};
let filterObject = {};



export default function Organizaciones(props) {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SIGEM | Organizaciones";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  const [NewRegister, setNewRegister] = useState({
    name: "",
    authorityFullname: "",
    authorityCi: "",
    municipalityId: "",
    parishId: "",
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
    parishId: 1,
  });

  
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
    }
    setIsSearchHidden("hidden");
  };


 
  const [totalData, setTotalData] = useState(0);
  const [generalData, setGeneralData] = useState({
    entitiesObject: {},
  })
  const columns = [
    {
      name: "name",
      label: "Entidad",
      options: {
        filter: false,
        sort: true,
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
      },
    },
    {
      name: "authorityFullname",
      label: "Encargado",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "authorityCi",
      label: "C.I del encargado",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "municipalityName",
      label: "Municipio",
      options: {
        sort: false,
        filter: true,
        filterList: parametersURL?.filterList[3] || [],
        filterOptions: {
          names: generalData?.municipalities?.map((obj) => obj.name),
        },
      },
    },
    {
      name: "parishName",
      label: "Parroquia",
      options: {
        filter: false,
        sort: false,
      },
    },
  ];
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText, page: 1 }));
  }, 800);

  useEffect(() => {
    let url = `dashboard/organizations?`;
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
    // console.log(url);
    getData(url);
    // url += `search?${parametersURL.search}`
    // console.log(parametersURL)
  }, [parametersURL]);
  


  const deleteRegister = async (id_user, fnEmptyRows) => {

    try {
      await axios
        .delete(`dashboard/organizations/${id_user}`)
        .then((response) => {
          setParametersURL(prev => ({...prev}))

          fnEmptyRows([]);
          setAlert({
            open: true,
            status: "Exito",
        
          });
        });
    } catch (error) {
      if (error.response.status == 403) {
        localStorage.removeItem("userData")
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("apiToken")
        location.href = "../"
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
    selectToolbarPlacement: 'above',
    rowsExpanded: [],
    rowsSelected: [],
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,
    download: false,
    viewColumns: false,

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
        const mappedValues = arrValues.map(municipalityName => {
          const municipalityObject = generalData.municipalities.find(municipality => municipality.name === municipalityName);
          return municipalityObject ? municipalityObject.id.toString() : null; // Return null if not found
      }).join().replaceAll(",", "[OR]");

        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${mappedValues}`;
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
          onClick={() => {
            editIconClick(selectedRows, displayData, setSelectedRows);
          }}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar esta organización?",
              aceptFunction: () =>
                deleteRegister(
                  dataTable[selectedRows.data[0].dataIndex].id,
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
    const dataOfIndx = dataTable[indx];
    setNewRegister({
      ...dataOfIndx,
    });
    setOpen(true);
    setSubmitStatus("Editar");
  }

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      setTotalData(+res.total);

      // console.log(response.data.products)
      // console.log(response.data.typePresentation)
      let entitiesObject = {};
      res.entities.forEach((obj) => {
        entitiesObject[obj.name] = obj.name;
      });
      setGeneralData({
        ...res,
        entitiesObject,
      });
      setDataTable(res.data);
      setIsLoading(false);
      setRelation(false);
    });
  };
  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("cargando...");
        await axios
          .post(`/dashboard/organizations`, NewRegister)
          .then((response) => {
            setSubmitStatus("Crear");
          });
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/organizations/${NewRegister.id}`, NewRegister)
          .then((response) => {});
      }
      setAlert({
        open: true,
        status: "Exito",
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
      setOpen(false);

      setNewRegister({
        name: "",
        authorityFullname: "",
        authorityCi: "",
        municipalityId: null,
        parishId: null,
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data.errors
                ? Object.values(error.response.data.errors)[0][0]
                : error.response?.data?.message || "Algo salió mal",
      });
      setSubmitStatus(() => (NewRegister.id > 0 ? "Editar" : "Crear"));
    }
  };

  // console.log(authorityptions);

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={"Organizaciones"}
        data={dataTable}
        columns={columns}
        options={options}
      />
    );
  }, [dataTable]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // console.log({name, value})
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
  // console.log({ productsSearched });
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="flex ">
        <Button3D
          className="mt-2"
          color={"red"}
          text={`Nuevo`}
          icon={"add"}
          onClick={(e) => {
            if (submitStatus == "Editar") {
              setNewRegister({
                name: "",
                authorityFullname: "",
                authorityCi: "",
                municipalityId: null,
                parishId: null,
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
              label={"Organización"}
              required
              key={"1r0"}
              name={"name"}
              onChange={handleChange}
              value={NewRegister?.name}
            />
            <Input
              label={"Nombre del encargado"}
              key={10}
              name={"authorityFullname"}
              onChange={handleChange}
              value={NewRegister?.authorityFullname}
            />
            <Input
              label={"C.I del encargado"}
              key={310}
              name={"authorityCi"}
              className={"col-span-2"}
              onChange={handleChange}
              value={NewRegister?.authorityCi}
            />
              <FormControl fullWidth>
              <InputLabel id="municipio" className="px-1 bg-white">Municipios</InputLabel>
              <Select
                labelId="municipio"
                id="demo-simple-select"
                name="municipalityId"
                value={NewRegister?.municipalityId}
                onChange={handleChange}
              >
                {generalData?.municipalities?.map((option) => (
                  <MenuItem key={`${option.id}-${option.name}`} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
                
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label" className="px-1 bg-white">Parroquia</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                disabled={!NewRegister.municipalityId}
                name="parishId"
                value={NewRegister?.parishId}
                onChange={handleChange}
              >
                {generalData?.municipalities?.find(obj => obj?.id == NewRegister?.municipalityId)?.parishes.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
           
            <Button3D
              className="mt-2 col-span-2"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
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
