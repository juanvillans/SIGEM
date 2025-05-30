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
import myBoldFont from "../assets/fonts/Montserrat-Bold.ttf";
import normalFont from "../assets/fonts/Montserrat-Regular.ttf";

Font.register({ family: "fontBold", src: myBoldFont });
Font.register({ family: "normalFont", src: normalFont });

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
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
    padding: 4,
    border: "1px solid black",
    flexGrow: 1,
    height: "160px",
    minWidth: "260.25984252 !important",
    maxWidth: "260.25984252 !important",
    position: "relative",
    overflow: "hidden !important",
  },
  header: {
    // flexDirection: "row",
    textAlign: "center",

    width: "100%",
    overflow: "hidden !important",
  },
  textHeader: {
    position: "absolute",
    textAlign: "center",
    // fontSize: 16,
    position: "absolute",
    top: -14,
    width: "100%",
    left: 18,
  },
  img: {
    width: 50,
    minWidth: 50,
  },
  membrete: {
    fontSize: 13,
    textAlign: "center",
    width: "100%",
    fontWeight: "800",
    marginTop: 20,
    // marginLeft: 20,
    // color: "#555555",
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "fontBold",
    marginTop: 5,
  },
  infoGuide: {
    flexDirection: "row",
    justifyContent: "left",
    width: "100%",
    fontSize: 13,
    // paddingHorizontal: 10,
    marginTop: 10,
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
    marginTop: 20,
  },
  table: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderStyle: "solid",
    // borderBottom: 1,
    // borderColor: "#000",
    // marginBottom: 10,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    borderStyle: "solid",
    borderBottom: 1,
    borderColor: "#000",
    fontWeight: "bold",
    fontFamily: "fontBold",
    // marginBottom: 10,
  },
  tableCell: {
    borderStyle: "solid",
    borderColor: "#000",
    padding: 4,
    fontSize: 10,
  },
  firstCell: {
    borderRight: 1,
    borderColor: "gray",
    width: 83,
  },
  nroCell: {
    borderRight: 1,
    borderColor: "gray",
    width: 30,
  },
  lastCell: {
    minWidth: 50,
    borderLeft: 1,
    borderColor: "gray",
  },
  middleCell: {
    flex: 1,
  },
  footer: {
    width: "100%",
    // position: "absolute",
    // bottom: 150,
    marginTop: 12,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    // top: "-14",
    // paddingHorizontal: 25,
  },
  firmas: {
    width: "100%",

    borderLeft: 0,
    borderRight: 0,
    flexDirection: "column",
    // marginBottom: 60,
    justifyContent: "space-between",
    color: "#202020",
    fontWeight: "bold",
    fontFamily: "fontBold",
  },
  dosFirmas: {
    flexDirection: "row",
    // textAlign: "center",
    justifyContent: "space-around",
    // gap: 10,
  },
});

// Create Document Component
export default function OuputGuide(props) {
  let nroColProduct = 0;
  const nroProducts = props.output?.products.length;
  // Genera el arreglo de objetos dividido en filas y columnas
  const sections = [];
  let currentRow = [];

  for (let i = 0; i < nroProducts; i++) {
    currentRow.push(props.output.products[i]);
    // console.log(currentRow)
    if (currentRow.length === 10) {
      sections.push(currentRow);
      currentRow = [];
    }
  }

  console.log(sections);
  return (
    <Document >
      {sections.map((row, rowIndex) => {
        return (
          <Page
            size={{ width: 404, height: 526.48 }}
            style={styles.page}
            // wrap={false}
          >
            <View style={styles.pageContainer}>
              {rowIndex == 0 && (
                <>
                  <View style={styles.header}>
                    <Image src={secretariaLogo} style={styles.img} />
                    <View style={styles.textHeader}>
                      <Text style={styles.membrete}>
                        DIVISION DE SUMINISTROS E INSUMOS
                      </Text>
                      <Text style={styles.guideTitle}>ORDEN DE SALIDA</Text>
                    </View>
                  </View>

                  <View style={styles.infoGuide}>
                    <View style={styles.leftInfo}>
                      <View>
                        <Text>Destino:</Text>
                        <Text>Recibe: </Text>
                        <Text>Cédula:</Text>
                        <Text>Nro Guia:</Text>
                        <Text>Fecha | hora:</Text>
                        <Text>Elaborado por:</Text>
                      </View>

                      <View>
                        <Text>{props.output.organizationName}</Text>
                        <Text>{props.output.receiverFullname}</Text>
                        <Text>{props.output.receiverCi}</Text>
                        <Text>{props.output.guide}</Text>
                        <Text>
                          {props.output.departureDate} |{" "}
                          {props.output.departureTime}
                        </Text>
                        <Text>{props.output?.fullName} </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.parentTable}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableCell, styles.nroCell]}>
                    <Text>#</Text>
                  </View>
                  <View style={[styles.tableCell, styles.firstCell]}>
                    <Text>LOTE</Text>
                  </View>
                  <View style={[styles.tableCell, styles.middleCell]}>
                    <Text>Producto</Text>
                  </View>
                  <View style={[styles.tableCell, styles.lastCell]}>
                    <Text>Cant.</Text>
                  </View>
                </View>

                {row.map((product, indx) => {
                  nroColProduct++
                  return (
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        borderStyle: "solid",
                        overflow: "hidden",
                        backgroundColor: indx % 2 === 0 ? "#e9e9e9" : "white",
                      }}
                      key={product.loteNumber + product.indx}
                    >
                      <View style={[styles.tableCell, styles.nroCell]}>
                        <Text>{nroColProduct }</Text>
                      </View>
                      <View style={[styles.tableCell, styles.firstCell]}>
                        <Text>{product.loteNumber}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.middleCell]}>
                        <Text>
                          {" "}
                          {`${product.name} ${
                            product.unitPerPackage != "N/A"
                              ? product.unitPerPackage
                              : ""
                          }${" "}${
                            product.typePresentationName != "N/A"
                              ? product.typePresentationName
                              : ""
                          }${" "}${
                            product.concentrationSize != "N/A"
                              ? product.concentrationSize
                              : ""
                          }`}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.lastCell]}>
                        <Text>{product.quantity}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {rowIndex == sections.length - 1 && (
                <View style={styles.footer}>
                  <View style={styles.firmas}>
                    <View style={{ paddingBottom: 5, paddingTop: 4 }}>
                      <Text>Firma del jefe de almacén</Text>

                      <View style={{ marginTop: 50, fontFamily: "normalFont" }}>
                        <Text>Jefferson Medina</Text>
                        <Text>C.I. 25783190</Text>
                      </View>
                    </View>
                    <View style={styles.dosFirmas}>
                      <Text
                        style={{
                          paddingBottom: 40,
                          paddingTop: 4,
                          paddingRight: 14,
                        }}
                      >
                        Beneficiario{" "}
                      </Text>
                      <Text style={{ paddingBottom: 40, paddingTop: 4 }}>
                        Despachador{" "}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
            <View
            fixed
              style={{
                position: "absolute",
                fontSize: "11",
                bottom: 1,
                right: 3,
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontFamily: "fontBold",
                  fontWeight: "bold",
                  marginRight: 4,
                }}
              >
                {rowIndex + 1}
              </Text>
              <Text>de {sections.length}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
