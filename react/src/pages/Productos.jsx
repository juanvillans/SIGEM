import React, { useEffect, useState, useCallback } from "react";
import MUIDataTable from "mui-datatables";
import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import useDebounce from "../components/useDebounce";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from "@mui/material/MenuItem";

const levels = [{value: "low", label: "Bajo", color:"green"}, {value: "medium", label: "Medio", color:"yellow"}, {value: "high", label: "Alto", color:"red"}];
export default function Productos() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  const [producto, setProducto] = useState({
    id: "",
    machine: "",
    brand: "",
    model: "",
    required_components: [],
    level: "low",
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
  });

  const [total, setTotal] = useState(0);

  const columns = [
    {
      name: "code",
      label: "Código",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "machine",
      label: "Equipo Médico",
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
      name: "level",
      label: "Nivel",
      options: {
        filter: false,
        sort: true,
       
      },
    },
    {
  name: "required_components",
  label: "Componentes",
  options: {
    filter: false,
    customBodyRender: (value, tableMeta) => {
      if (!value || value.length === 0) return "N/A";
      
      return (
        <div className="relative group">
          <div className="flex flex-wrap gap-1 max-w-[300px]">
            {value.slice(0, 3).map((comp, i) => (
              <span key={i} className="bg-blue1 text-white text-center text-xs px-2 py-2 rounded">
                {comp}
              </span>
            ))}
            {value.length > 3 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`components-${tableMeta.rowIndex}`).classList.toggle('hidden');
                }}
                className="text-xs p-2 rounded border border-grey text-grey hover:text-blue1"
              >
                +{value.length - 2} más
              </button>
            )}
          </div>
          
          {/* Popup con todos los componentes */}
          <div 
            id={`components-${tableMeta.rowIndex}`}
            className="hidden absolute z-10 mt-1 w-56 bg-light shadow-lg rounded-md p-2 border border-gray-200"
          >
            <div className="flex flex-wrap gap-1">
              {value.map((comp, i) => (
                <span key={i} className="bg-blue1 text-white text-xs px-2 py-2 rounded mb-1">
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
  ];

  const handleSearch = useDebounce((searchText) => {
    setQueryParams(prev => ({ ...prev, search: searchText, page: 1 }));
  }, 400);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `dashboard/products?page=${queryParams.page}&rowsPerPage=${queryParams.rowsPerPage}`;
      
      if (queryParams.search) {
        url += `&search[all]=${queryParams.search}`;
      }
      if (queryParams.orderBy) {
        url += `&orderBy=${queryParams.orderBy}&orderDirection=${queryParams.orderDirection}`;
      }

      const response = await axios.get(url);
      setData(response.data.products);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlert({
        open: true,
        status: "Error",
        message: "Error al cargar los productos"
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    document.title = "SIGEM | Productos";
    fetchData();
  }, [fetchData]);

  const deleteProducto = async (id, fnEmptyRows) => {
    try {
      await axios.delete(`dashboard/products/${id}`);
      fetchData();
      fnEmptyRows([]);
      setAlert({
        open: true,
        status: "Éxito",
        message: "Producto eliminado correctamente"
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response?.data?.message || "Error al eliminar el producto"
      });
    }
  };

  const options = {
    print: false,
    count: total,
    rowsPerPage: queryParams.rowsPerPage,
    page: queryParams.page - 1,
    serverSide: true,
    download: false,
    onChangePage: (currentPage) => {
      setQueryParams(prev => ({ ...prev, page: currentPage + 1 }));
    },
    onChangeRowsPerPage: (numberOfRows) => {
      setQueryParams(prev => ({
        ...prev,
        rowsPerPage: numberOfRows,
        page: 1,
      }));
    },
    onSearchChange: handleSearch,
    onColumnSortChange: (changedColumn, direction) => {
      setQueryParams(prev => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
      }));
    },
    filterType: "multiselect",
    selectableRows: "single",
    selectableRowsOnClick:true,
    selectableRowsHideCheckboxes:true,

    textLabels: {
      body: {
        noMatch: isLoading ? (
          <CircularProgress color="inherit" size={33} />
        ) : (
          "No se han encontrado productos"
        ),
      },
      pagination: {
        next: "Siguiente página",
        previous: "Anterior página",
        rowsPerPage: "Filas por página",
      },
      toolbar: {
        search: "Buscar producto",
      }
    },
    
    rowsPerPageOptions: [10, 25, 50, 100],

    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
      <div>
        <IconButton
          title="Copiar"
          onClick={() => handleEditClick(selectedRows, true)}
        >
          <ContentCopyIcon />
        </IconButton>
        <IconButton
          title="Editar"
          onClick={() => handleEditClick(selectedRows, false)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Está seguro de eliminar este producto?",
              aceptFunction: () => deleteProducto(
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

  const handleEditClick = (selectedRows, isCopy) => {
    const selectedData = data[selectedRows.data[0].dataIndex];
    setProducto({
      machine: selectedData.machine,
      brand: selectedData.brand,
      model: selectedData.model,
      required_components: selectedData.required_components,
      level: selectedData.level,
      id: isCopy ? "" : selectedData.id
    });
    setOpen(true);
    setSubmitStatus(isCopy ? "Copiar" : "Editar");
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === "Cargando...") return;
    
    try {
      setSubmitStatus("Cargando...");
      
      const productData = {
        machine: producto.machine,
        brand: producto.brand,
        model: producto.model,
        level: producto.level,
        required_components: producto.required_components
      };

      if (submitStatus === "Copiar" || submitStatus === "Crear") {
        await axios.post("/dashboard/products", productData);
      } else {
        await axios.put(`/dashboard/products/${producto.id}`, productData);
      }

      setAlert({
        open: true,
        status: "Éxito",
        message: `Producto ${submitStatus === "Editar" ? "actualizado" : "creado"} correctamente`
      });
      
      setOpen(false);
      setProducto({
        id: "",
        machine: "",
        brand: "",
        level: "low",
        model: "",
        required_components: [],
      });
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response?.data?.message || "Error al procesar la solicitud"
      });
    } finally {
      setSubmitStatus(submitStatus === "Editar" ? "Editar" : "Crear");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index, value) => {
    const newComponents = [...producto.required_components];
    newComponents[index] = value;
    setProducto(prev => ({...prev, required_components: newComponents}));
  };

  const addComponent = () => {
    setProducto(prev => ({
      ...prev, 
      required_components: [...prev.required_components, ""]
    }));
  };

  const removeComponent = (index) => {
    setProducto(prev => ({
      ...prev,
      required_components: prev.required_components.filter((_, i) => i !== index)
    }));
  };

  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="flex justify-between pr-10 mt-10 items-center">
        <Button3D
          color={"red"}
          text="Nuevo producto"
          icon={"add"}
          onClick={() => {
            setProducto({
              id: "",
              machine: "",
              brand: "",
              model: "",
              required_components: [],
              level: "low",
            });
            setOpen(true);
            setSubmitStatus("Crear");
          }}
        />
      </div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form onSubmit={handleSubmit} className="md:w-[500px] gap-4 grid grid-cols-2">
            <Input
              label={"Nombre del equipo"}
              required
              value={producto.machine}
              name="machine"
              onChange={handleChange}
              className="col-span-2"
            />
            <Input
              label={"Marca"}
              required
              value={producto.brand}
              name="brand"
              onChange={handleChange}
              className="col-span-2"

            />
            <Input
              label={"Modelo"}
              required
              value={producto.model}
              name="model"
              onChange={handleChange}
              className="col-span-2"

            />
            <Input
              name="maintenance_type_id"
              id=""
              label="Nivel"
              select
              value={producto.level}
              size="small"
              required={true}
              className="bg-blue/0  font-bold"
              onChange={(e) => {
                setProducto(prev => ({...prev, level: e.target.value}));
              }}
            >
              {levels?.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              )) || <MenuItem value={""}></MenuItem>}
            </Input>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Componentes Requeridos
              </label>
              <div className="space-y-2">
                {producto.required_components?.map((component, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                    required={true}
                      value={component}
                      onChange={(e) => handleComponentChange(index, e.target.value)}
                      placeholder="Nombre del componente"
                    />
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="px-3 py-2 border text-gray rounded hover:bg-red hover:text-white"
                    >
                    <CloseIcon />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addComponent}
                  className="px-3 py-2 bg-blue2 text-white rounded hover:bg-blue-600"
                >
                <AddIcon />
                </button>
              </div>
            </div>

            <Button3D
              className="mt-2 col-span-2"
              color={submitStatus === "Crear" || submitStatus === "Copiar" ? "blue1" : "blue2"}
              type="submit"
              text={submitStatus}
            />
          </form>
        }
      />

      <MUIDataTable
        title={
          <div className="flex min-h-[55px] pt-3">
            <h1 className="text-grey text-xl relative top-1">Productos</h1>
          </div>
        }
        data={data}
        columns={columns}
        options={options}
      />

      <Alert
        open={alert.open}
        setAlert={setAlert}
        status={alert.status}
        message={alert.message}
      />

      <ConfirmModal
        closeModal={() => setModalConfirm({ isOpen: false })}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={modalConfirm.aceptFunction}
      />
    </>
  );
}