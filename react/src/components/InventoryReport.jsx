import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image,
    Font,
  } from "@react-pdf/renderer";
  import secretariaLogo from "../assets/img/logo_secretaria-circle-main.png";
  import goberncionLogo from "../assets/img/gobernacion.png";
  import myBoldFont from "../assets/fonts/Montserrat-Bold.ttf";
  import normalFont from "../assets/fonts/Montserrat-Regular.ttf";
  
  Font.register({ family: "fontBold", src: myBoldFont });
  Font.register({ family: "normalFont", src: normalFont });
  
  // Create styles
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      padding: 30,
      fontFamily: "normalFont",
    },
    pageContainer: {
      position: "relative",
      height: "100%",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    section: {
      marginBottom: 2,
      padding: 20,
      border: "1px solid #e9e9e9",
      flexGrow: 1,
      //   height: "160px",
      minWidth: "260.25984252 !important",
      maxWidth: "260.25984252 !important",
      position: "relative",
      overflow: "hidden !important",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      textAlign: "center",
  
      width: "100%",
      //   overflow: "hidden !important",
    },
    textHeader: {
      position: "absolute",
      textAlign: "center",
      fontSize: 10,
      // fontSize: 16,
      position: "absolute",
      top: -12,
      width: "100%",
      left: 10,
      backgroundColor: "transparent",
    },
    img: {
      width: 40,
      // height: 57,
      objectFit: "cover",
      position: "relative",
      top: "-7px",
    },
    goberncion: {
        width: 57,
        height: 40,
        objectFit: "cover",
        position: "relative",
        top: "-7px",
      },
    membrete: {
      fontSize: 10,
      textAlign: "center",
      width: "100%",
      fontWeight: "800",
      marginTop: 20,
      // marginLeft: 20,
      // color: "#555555",
    },
    guideTitle: {
      fontSize: 12,
      fontWeight: "bold",
      fontFamily: "fontBold",
      marginTop: 15,
    },
    infoGuide: {
      flexDirection: "row",
      justifyContent: "left",
      width: "100%",
      fontSize: 10,
      marginTop: 3,
      // paddingHorizontal: 10,
    },
    leftInfo: {
      flexDirection: "row",
      gap: 10,
    },
    rigthInfo: {
      flexDirection: "row",
      gap: 10,
    },
    textRigth: {
      textAlign: "right",
      width: 100,
      color: "#555555",
    },
    parentTable: {
      border: 1,
      borderRadius: 6,
      marginTop: 50,
      borderColor: "#696969",
      overflow: "hidden",
    },
    table: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderStyle: "solid",
      // borderBottom: 1,
      // borderColor: "#000",
      // marginBottom: 10,
      borderColor: "#696969",
      overflow: "hidden",
    },
    tableHeader: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderStyle: "solid",
      borderBottom: 1,
      borderColor: "#696969",
      fontWeight: "bold",
      fontFamily: "fontBold",
      fontSize: 9,
      // marginBottom: 10,
    },
    tableCell: {
      borderStyle: "solid",
        width: 50,
      color: 'black',
      flexDirection: 'row',
      alignItems: "center",
      paddingHorizontal: 3,
      paddingVertical: 3,
      fontSize: 9,
    },
    nroCell: {
      borderRight: 1,
      borderColor: "#c4c4c4",
      width: 22,
      fontSize: 7,
    },
    productCell: { 
      borderStyle: "solid",
      borderRight: 1,
      borderColor: "#c4c4c4",
      fontSize: 9,
      width: 260,
    },
    totalCell: {
        fontWeight: "bold",
        fontFamily: "fontBold",
        paddingHorizontal: 4
    },
    perExpireCell: {
        fontWeight: "bold",
        fontFamily: "fontBold",
        backgroundColor: "#A7D5F2",
        color: "#BF0404",
        padding: 2,
        borderRadius: 2,
    },
    goodCell: {
        fontWeight: "bold",
        fontFamily: "fontBold",
        backgroundColor: "#A7D5F2",
        color: "#011140",
        padding: 2,
        borderRadius: 2,
    },
    expiredCell: {
        fontWeight: "bold",
        fontFamily: "fontBold",
        backgroundColor: "#BF0404",
        color: "white",
        padding: 2,
        borderRadius: 2,
    },
    badCell: {
        fontWeight: "bold",
        fontFamily: "fontBold",
        backgroundColor: "#b65200",
        color: "white",
        padding: 2,
        borderRadius: 2,
    },
    fontSize6: {
        fontSize: 6
    },
    
   
  });
  
  // Create Document Component
  export default function OuputGuide(props) {
    let nroColProduct = 0;
    const nroProducts = props.products?.length;
  
    return (
      <Document
      // fileName={`${props.output.code}`}
      >
            <Page
              size="A4"
              style={{
                  backgroundColor: "#ffffff",
                  padding: 30,
                  fontFamily: "normalFont",
                  paddingTop: 30
              }}
              // wrap={false}
            >
                <View style={styles.header}>
                <Image src={goberncionLogo} style={styles.goberncion} />

                      <View style={styles.textHeader}>
                        <Text>
                          GOBERNACIÓN BOLIVARIANA DEL ESTADO FALCÓN
                        </Text>
                        <Text>
                          SECRETARIA REGIONAL DE SALUD
                        </Text>
                        <Text>
                          DIVISIÓN DE SUMINISTROS E INSUMOS
                          </Text>
                        <Text>
                          DEPARTAMENTO DE ALMACÉN
                          </Text>
                        <Text style={styles.guideTitle}>REPORTE DE INVENTARIO </Text>
                        <Text style={{color:"#313131"}}>{new Date().toISOString().split("T")[0]}
                        </Text>
                        
                      </View>
                      <Image src={secretariaLogo} style={styles.img} />

                    </View>
             
  
                <View style={styles.parentTable}>
                  <View style={styles.tableHeader}>
                    <View style={[styles.tableCell, styles.nroCell]}>
                      <Text>N°</Text>
                    </View>
                    <View style={[styles.tableCell, styles.productCell]}>
                      <Text>Producto</Text>
                    </View>
                    <View style={[styles.tableCell, styles.fontSize6]}>
                      <Text>Total</Text>
                    </View>
                    <View style={[styles.tableCell, styles.fontSize6 ]}>
                      <Text>Por vencer</Text>
                    </View>
                    <View style={[styles.tableCell, styles.fontSize6]}>
                      <Text>Buen estado</Text>
                    </View>
                    <View style={[styles.tableCell, styles.fontSize6]}>
                      <Text>Vencidos</Text>
                    </View>
                    <View style={[styles.tableCell, styles.fontSize6]}>
                      <Text>Defectuosos</Text>
                    </View>
                   
                  </View>
  
                  {props?.products.map((product, rowIndex) => {

                    nroColProduct++;
                    return (
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "100%",
                          borderStyle: "solid",
                          borderColor: "#e9e9e9",
                          overflow: "hidden",
                          backgroundColor: rowIndex % 2 === 0 ? "#e9e9e9" : "white",
                        }}
                        key={rowIndex}
                      >
                        <View style={[styles.tableCell, styles.nroCell]}>
                          <Text>{nroColProduct}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.productCell]}>
                          <Text>
                            {product.Nombre}
                            </Text>
                        </View>
                        <View style={[styles.tableCell, styles.totalCell]}>
                          <Text>{product.Total}</Text>
                        </View>
                        <View style={[styles.tableCell]}>
                          <Text style={styles["perExpireCell"]}>{product["Por vencer"]}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.firstCell]}>
                          <Text style={styles["goodCell"]}>{product["Buen estado"]}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.firstCell]}>
                          <Text style={styles["expiredCell"]}>{product["Vencidos"]}</Text>
                        </View>
                       
                        <View style={[styles.tableCell, styles.lastCell]}>
                          <Text style={styles["badCell"]}>{product["Defectuosos"]}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
            </Page>
      </Document>
    );
  }
  