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
  import Add from "@mui/icons-material/Add";
  // import Chip from '@material-ui/core/Chip';
  import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
  import Modal from "../components/Modal";
  import ConfirmModal from "../components/ConfimModal";
  import Alert from "../components/Alert";
  import Input from "../components/Input";
  import Button3D from "../components/Button3D";
  import CircularProgress from "@mui/material/CircularProgress";
  
  export default function Administracion(props) {
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      document.title = "SISMED | Todo";
    }, []);
  
    const [presentaciones, setPresentaciones] = useState([]);
    const [parametersURL, setParametersURL] = useState({
      page: 0,
      rowsPerPage: 0,
      search: "",
      orderBy: "",
      orderDirection: "",
      filter: {},
      total: 0,
    });
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [entities, setEntities] = useState([]);
  
    const [presentationcolumns, setPresentationColumns] = useState([
      {
        name: "entityName",
        label: "Institución",
        options: {
          filter: true,
        },
      },
  
      {
        name: "name",
        label: "Nombres",
        options: {
          filter: false,
        },
      },
    ]);
  
    const getData = async () => {
      await axios.get("dashboard/users").then((response) => {
        setIsLoading(true);
  
        const data = response.data;
        const users = data.data.users;
  
        if (isFirstTime === true) {
          let culopeluo = data.data.pagination;
          culopeluo.page--;
          setParametersURL((prev) => ({ ...prev, ...culopeluo }));
          setIsFirstTime(false);
        }
        setPresentaciones(users);
        setEntities(data.entities);
        setIsLoading(false);
      });
    };
  
    const getDataWithFilters = async (url) => {
      await axios.get(url).then((response) => {
        setIsLoading(true);
  
        const data = response.data;
        const users = data.data.users;
  
        if (url === "dashboard/users") {
          let culopeluo = data.data.pagination;
          culopeluo.page--;
          setParametersURL(culopeluo);
        }
        setPresentaciones(users);
        setEntities(data.entities);
        setIsLoading(false);
      });
    };
  
    const deleteUser = async (id_user, indx, fnEmptyRows) => {
      try {
        // const id_user = usuarios[dataForDeleteUserindx].id;
        // const code = usuarios[dataForDeleteUser.indx].code;
        console.log();
        await axios.delete(`dashboard/users/${id_user}`).then((response) => {
          setAlert({
            open: true,
            status: "Exito",
            message: response.data.Message || "",
          });
          const copyUsers = [...presentaciones];
          copyUsers.splice(indx, 1);
          setPresentaciones(copyUsers);
          console.log({ copyUsers, indx });
          // setPresentaciones((prev) => prev.filter((eachU) => eachU.id != id_user));
          fnEmptyRows([]);
          // dataForDeleteUser.setSelectedRows([]);
        });
      } catch (error) {
        setAlert({
          open: true,
          status: "Error",
          message: error.response?.data?.message || "Algo salió mal",
        });
      }
    };
    const [dataForDeleteUser, setDataForDeleteUser] = useState({
      indx: "",
      setSelectedRows: () => {},
    });
  
    useEffect(() => {
      getData();
  
      let url = "dashboard/users/filter";
      url += `?page=${parametersURL.page}`;
      url += `&rowsPerPage=${parametersURL.rowsPerPage}`;
      url += `&search=${parametersURL.search}`;
  
      console.log(isFirstTime);
  
      // url += `search?${parametersURL.search}`
    }, [parametersURL]);
  
    const filterObject = {};
  
    console.log(parametersURL);
    // const [rowSelected, setRowSelected] = useState([])
    const presentationOptions = {
      count: parametersURL.total,
      rowsPerPage: parametersURL.rowsPerPage,
      page: parametersURL.page,
      onChangePage: (currentPage) => {
        // console.log(currentPage)
        setParametersURL((prev) => ({ ...prev, page: currentPage }));
      },
      onChangeRowsPerPage: (numberOfRows) => {
        // console.log(numberOfRows)
        setParametersURL((prev) => ({ ...prev, rowsPerPage: numberOfRows }));
      },
      onFilterChange: (changedColumn, filterList, a, b, displayData) => {
        presentationcolumnscolumns.forEach((obj, i) => {
          filterObject[obj.name] = filterList[i];
        });
        // console.log(filterObject)
      },
      onSearchChange: (searchText) => {
        setParametersURL((prev) => ({ ...prev, search: searchText }));
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
              setDataForDeleteUser({
                indx: selectedRows.data[0].dataIndex,
                setSelectedRows: setSelectedRows,
              });
  
              setModalConfirm({
                isOpen: true,
                modalInfo: "¿Quiere eliminar a este usuario?",
                aceptFunction: () =>
                  deleteUser(
                    usuarios[selectedRows.data[0].dataIndex].id,
                    selectedRows.data[0].dataIndex,
                    selectedRows
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
      setNewUserData(usuarios[indx]);
      setOpen(true);
      setSubmitStatus("Editar");
    }
  
    const [open, setOpen] = useState(false);
    const [modalConfirm, setModalConfirm] = useState({
      isOpen: false,
      modalInfo: false,
    });
    const [newUserData, setNewUserData] = useState({
      entityId: "",
      charge: "",
      name: "",
      lastName: "",
      ci: "",
      email: "",
      address: "",
      phoneNumber: "",
    });
  
    const [submitStatus, setSubmitStatus] = useState("Crear");
  
    const handleSubmit = async (e, indx) => {
      e.preventDefault();
  
      try {
        if (submitStatus === "Crear") {
          setSubmitStatus("cargando...");
          await axios.post(`/dashboard/users/`, newUserData).then((response) => {
            const user = response.data.user;
            setPresentaciones((prev) => [user, ...prev]);
          });
          setAlert({
            open: true,
            status: "Exito",
            message: `El usuario ${newUserData.name} ha sido creado`,
          });
          setSubmitStatus("Crear");
        }
  
        if (submitStatus === "Editar") {
          setSubmitStatus("cargando...");
          await axios
            .put(`/dashboard/users/${newUserData.id}`, newUserData)
            .then((response) => {
              const newUserEdit = response.data.user;
              setAlert({
                open: true,
                status: "Exito",
                message: `${newUserEdit.name} ha sido editado`,
              });
              setPresentaciones((prev) =>
                prev.map((user) =>
                  user.id === newUserEdit.id ? newUserEdit : user
                )
              );
            });
        }
  
        setNewUserData({
          entityId: "",
          charge: "",
          name: "",
          lastName: "",
          ci: "",
          email: "",
          address: "",
          phoneNumber: "",
        });
  
        setOpen(false);
      } catch (error) {
        setAlert({
          open: true,
          status: "Error",
          message: `Algo salió mal`,
        });
        setSubmitStatus(() => (newUserData.id > 0 ? "Editar" : "Crear"));
      }
    };
  
    const [tabla, setTabla] = useState();
    useEffect(() => {
      setTabla(
        <MUIDataTable
          isRowSelectable={true}
          title={"Presentaciones"}
          data={presentaciones}
          columns={presentationcolumns}
          options={presentationOptions}
        />
      );
    }, [presentaciones]);
  
    const handleChange = useCallback((e) => {
      const { name, value } = e.target;
  
      setNewUserData((prev) => ({ ...prev, [name]: value }));
      console.log(newUserData);
    }, []);
    const [alert, setAlert] = useState({
      open: false,
      status: "",
      message: "",
    });
    useEffect(() => {
      if (alert.open === true) {
        setTimeout(() => {
          setAlert({ open: false, message: "", status: "" });
        }, 4000);
      }
    }, [alert.open === true]);
  
    return (
      <div className="">
        <div>
          <div className="flex">
            <Button3D
              className="mt-2"
              color={"blue1"}
              text="Nuevo"
              icon={"add"}
              onClick={(e) => {
                if (submitStatus == "Editar") {
                  setNewUserData({
                    entityID: "",
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
                setSubmitStatus("Crear");
              }}
            />
          </div>
          {tabla}
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
                select
                label="Institución"
                value={newUserData.entityId}
                defaultValue=""
                width={"100%"}
                required
                name={"entityId"}
                onChange={handleChange}
              >
                {entities.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Input>
              <Input
                label={"Cargo"}
                required
                key={0}
                name={"charge"}
                onChange={handleChange}
                value={newUserData?.charge}
              />
              <Input
                label={"Nombre/s"}
                required
                key={10}
                name={"name"}
                onChange={handleChange}
                value={newUserData?.name}
              />
              <Input
                label={"Apellido/s"}
                required
                key={1}
                name={"lastName"}
                onChange={handleChange}
                value={newUserData?.lastName}
              />
              <Input
                label={"CI"}
                required
                key={2}
                name={"ci"}
                onChange={handleChange}
                value={newUserData?.ci}
              />
              <Input
                key={5}
                id={"outlined-textarea"}
                label={"Dirección"}
                multiline
                name={"address"}
                value={newUserData?.address}
                onChange={handleChange}
              />
              <Input
                label={"Nro de teléfono"}
                type={"tel"}
                key={3}
                minLength={10}
                maxLength={11}
                // InputProps={{ maxLength: 14, minLength: 10 }}
                name={"phoneNumber"}
                value={newUserData?.phoneNumber}
                onChange={handleChange}
                required
              />
              <Input
                type={"email"}
                label={"Correo"}
                value={newUserData?.email}
                name={"email"}
                onChange={handleChange}
                required
              />
              <Button3D
                className="mt-2 col-span-2"
                color={"blue1"}
                text={submitStatus}
                onClick={(e) => {}}
              />
            </form>
          }
        ></Modal>
  
        <Alert open={alert.open} status={alert.status} message={alert.message} />
  
        <ConfirmModal
          closeModal={() => {
            setModalConfirm({ isOpen: false });
            // setRowSelected([])
          }}
          modalInfo={modalConfirm.modalInfo}
          isOpen={modalConfirm.isOpen}
          aceptFunction={() => modalConfirm.aceptFunction()}
        />
      </div>
    );
  }
  