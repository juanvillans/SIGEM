import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
// import { debounceSearchRender } from "../components/DebounceSearchRender";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import useDebounce from "../components/useDebounce";
import api from "../api/axios";
export default function Config_products(props) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    document.title = "SIGEM | Configuración de equipos médicos";
    getData()
  }, []);

  const [Data, setData] = useState({});
  const [selectedOption, setSelectedOption] = useState(1);
  const selectedOptionText = ()  => {
    if (selectedOption == 1) return 'categoria'
    if (selectedOption == 2) return 'presentación'
    if (selectedOption == 3) return 'administracion'
    if (selectedOption == 4) return 'Tipo de medicamento'
  };

  const [entities, setEntities] = useState([]);

  const columns = [

    {
      name: "id",
      label: "código",
      options: {
        filter: false,
      },
    },
    {
      name: "name",
      label: "nombre",
      options: {
        filter: false,
      },
    },
  ];


  const getData = async (type=1) => {
    // console.log(url)
    await axios.get("/dashboard/config-products").then((response) => {
      setIsLoading(true);
      const apiData = response.data.data
      setData({1: apiData.categories, 2: apiData.typePresentations, 3: apiData.typeAdministrations, 4: apiData.medicaments })
      setIsLoading(false);
      setSelectedOption(type)
      // setTotalData(data.total);
    });
  };

  const deleteUser = async (id_user, indx, fnEmptyRows) => {
    try {
      // const id_user = Data[dataForDeleteUserindx].id;
      // const code = Data[dataForDeleteUser.indx].code;
      await axios.delete(`dashboard/config-products/${selectedOption}/${id_user}`).then((response) => {
       getData(selectedOption)

        setAlert({
          open: true,
          status: "Exito",
        });

        fnEmptyRows([])

        dataForDeleteUser.setSelectedRows([]);
      });
    } catch (error) {
      console.log('error');

      setAlert({
        open: true,
        status: "Error",
        message: error.response.data?.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.message || "Algo salió mal",
      });
    }
  };
  const [dataForDeleteUser, setDataForDeleteUser] = useState({
    indx: "",
    setSelectedRows: () => {},
  });


  const options = {
    print: false,

    onSearchChange: (searchText,b,c,d) => {
      // handleSearch(searchText);
    },

    rowsPerPage: 25,
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
          onClick={() =>
            editIconClick(selectedRows, displayData, setSelectedRows)
          }
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title="Eliminar"
          onClick={() => {

            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar este registro?",
              aceptFunction: () =>
                deleteUser(
                  Data[selectedOption][selectedRows.data[0].dataIndex].id,
                  selectedRows.data[0].dataIndex,
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
    setNewUserData(Data[selectedOption][indx]);
    setOpen(true);
    setSubmitStatus("Editar");
  }

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });
  const [newUserData, setNewUserData] = useState({
    entityCode: "",
    charge: "",
    name: "",
    lastName: "",
    ci: "",
    email: "",
    address: "",
    phoneNumber: "",
  });

  const [submitStatus, setSubmitStatus] = useState("Crear " + selectedOptionText());

  const handleSubmit = async (e, indx) => {
    e.preventDefault();

    try {
      if (submitStatus.includes("Crear")) {
        setSubmitStatus("cargando...");
        await axios.post(`/dashboard/config-products/${selectedOption}`, newUserData).then((response) => {
          const user = response.data.data;
          // console.log(user)
          setData((prev) => ({...prev, [selectedOption]: [user, ...prev[selectedOption]]}));
          console.log(Data)
        });
        setAlert({
          open: true,
          status: "Exito",
        });
        setSubmitStatus("Crear " + selectedOptionText());
      }

      if (submitStatus.includes("Editar")) {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/config-products/${selectedOption}/${newUserData.id}`, newUserData)
          .then((response) => {
            const newUserEdit = response.data.data;

            setAlert({
              open: true,
              status: "Exito",
            });


            setData((prev) =>{
              return {...prev, [selectedOption]: Data[selectedOption].map((user) => (user.id === newUserEdit.id ? newUserEdit : user))}
            });
          });
      }

      setNewUserData({
        name: "",
      });
      setOpen(false);

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
      setSubmitStatus(() => (newUserData.id > 0 ? "Editar" : "Crear"));
    }
  };

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={<div className="relative -top-3 right-6 ">
        <label className={` py-3 px-4 cursor-pointer rounded-tl-lg border-light ${selectedOption == 1 ? 'bg-blue3 font-bold': ''}`}>
          <input
            className="hidden"
            type="radio"
            value="1"
            checked={selectedOption == 1}
            onChange={handleOptionChange}
          />
          Categorías
        </label>
        <label className={` py-3 px-4 cursor-pointer border-light border-x ${selectedOption == 2 ? 'bg-blue3 font-bold': ''}`}>
          <input
            className="hidden"
            type="radio"
            value="2"
            checked={selectedOption == 2}
            onChange={handleOptionChange}
          />
          T. de Presentaciones
        </label>
        <label className={` py-3 px-4  cursor-pointer border-light ${selectedOption == 3 ? 'bg-blue3 font-bold': ''}`}>
          <input
            className="hidden"
            type="radio"
            value="3"
            checked={selectedOption === "3"}
            onChange={handleOptionChange}
          />
          T. de administraciones
        </label>
        <label className={` py-3 px-4  cursor-pointer border-l border-light ${selectedOption == 4 ? 'bg-blue3 font-bold': ''}`}>
          <input
            className="hidden"
            type="radio"
            value="4"
            checked={selectedOption == "4"}
            onChange={handleOptionChange}
          />
          T. de Medicamentos
        </label>
      </div>}
        data={Data[selectedOption]}
        columns={columns}
        options={options}
      />
    );
  }, [selectedOption, Data]);


  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    console.log(event.target.value)
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setNewUserData((prev) => ({ ...prev, [name]: value }));
    // console.log(newUserData);
  }, []);
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
          text={`Añadir ${selectedOptionText()}`}
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setNewUserData({
                entityCode: "",
                charge: "",
                name: "",
                lastName: "",
                ci: "",
                email: "",
                address: "",
                phoneNumber: "",
              });
            }
            setOpen(true);
            setSubmitStatus("Crear " + selectedOptionText());
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
              label={"Nombre"}
              required
              key={10}
              name={"name"}
              onChange={handleChange}
              value={newUserData?.name}
            />

            <Button3D
              className="mt-2 col-span-2"
              color={submitStatus == "Crear" ? "blue1" : "blue2"}
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
      />
    </>
  );
}
