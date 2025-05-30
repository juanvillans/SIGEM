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
    fontFamily: "normalFont",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    width: "100%",
    overflow: "hidden !important",
    padding: 5,
    alignItems: "center",
  },
  textHeader: {
    textAlign: "right",
    // position: "relative",
    // top: "-55px",
  },
  img: {
    width: "48px !important",
  },
  membrete: {
    fontSize: 7,
    fontWeight: "bold",
    fontFamily: "fontBold",
    // marginTop: 20,
    // marginLeft: 20,
    // color: "#555555",
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "fontBold",
    marginTop: 5,
    // textAlign: "center",
  },
  infoList: {
    position: "relative",
    // top: "-30px",
    flexDirection: "row",
    gap: 2,
    fontSize: 10,
    marginBottom: 4,
    paddingBottom: 3,
    // borderBottom: 1,
    // borderColor: "#f1f1f1",
  },
  tableList: {
    paddingVertical: 4,
    flexDirection: "row",
    gap: 1,
    fontSize: 10,
    // marginBottom: 4,
    // paddingBottom: 3,
    // borderTop: 1,
    // borderColor: "#f1f1f1",
    paddingHorizontal: 5,
  },
  p5: {
    padding: 5,
  },
  tableCell1: {
    width: "35%",
    fontWeight: "bold",
    fontFamily: "fontBold",
  },
  infoCell1: {
    width: "42%",
    color: "#555555",
    fontWeight: "bold",
    fontFamily: "fontBold",
  },
  infoCell2: {
    width: "58%",
  },
  tableCell2: {
    width: "70%",
  },
  infoGuide: {
    flexDirection: "column",
    // justifyContent: "space-between",
    position: "relative",
    // top: "-30px",
    fontSize: 10,
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
    // textAlign: "right",
    width: 100,
    color: "#555555",
  },

  parentTable: {
    border: 1,
    borderBottom: 0,
    borderTop: 0,
    // borderRadius: 6,
    // paddingTop: 5,
    // borderBottom: "0",
    position: "relative",
    // top: "-20px",
  },
  tableHeader: {
    backgroundColor: "#b8b8b8",
    borderTop: 1,
    color: "white",
    fontWeight: "bold",
    fontFamily: "fontBold",
    fontSize: 12,
    textAlign: "center",
    position: "relative",
    // top: "-20px",
  },
  eachProduct: {
    borderBottom: 1,
  },
  greyBackground: {
    backgroundColor: "#f3f3f3",
  },
  whiteBackground: {
    backgroundColor: "white",
  },

  footer: {
    width: "100%",
    // position: "absolute",
    // bottom: 150,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    // top: "-14",
    // paddingHorizontal: 25,
  },
  firmas: {
    width: "100%",
    border: 1,
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
  console.log({ props });
  return (
    <Document
      title={`Salida_${props.output.outputCode}_${props.output.organizationName}_${props.output.receiverFullname}`}
    >
      <Page size={{ width: 200 }} style={styles.page}>
        <View style={styles.header}>
          <Image src={secretariaLogo} style={styles.img} />
          <View style={styles.textHeader}>
            <Text style={styles.membrete}>
              DIVISION DE SUMINISTROS E INSUMOS
            </Text>
            <Text style={styles.guideTitle}>ORDEN DE SALIDA</Text>
          </View>
        </View>
        <View style={styles.p5}>
          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Destino:</Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>{props.output.organizationName}</Text>
            </View>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Recibe:</Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>{props.output.receiverFullname}</Text>
            </View>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Cédula: </Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>{props.output.receiverCi}</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Nro Guia: </Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>{props.output.guide}</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Fecha | hora: </Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>
                {props.output.departureDate} | {props.output.departureTime}
              </Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoCell1}>
              <Text>Elaborado por:</Text>
            </View>
            <View style={styles.infoCell2}>
              <Text>{props.output?.userFullName} </Text>
            </View>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text>Lista de entregados</Text>
        </View>

        <View style={styles.parentTable}>
          {props.output?.products.map((product, indx) => {
            const backgroundColor =
              indx % 2 === 0 ? styles.whiteBackground : styles.greyBackground;
            return (
              <View style={[styles.eachProduct, backgroundColor]}>
                <View style={styles.tableList}>
                  <View style={styles.tableCell1}>
                    <Text>Lote:</Text>
                  </View>
                  <View style={styles.tableCell2}>
                    <Text>{product.loteNumber} </Text>
                  </View>
                </View>
                <View style={styles.tableList}>
                  <View style={styles.tableCell1}>
                    <Text>Producto:</Text>
                  </View>
                  <View style={styles.tableCell2}>
                    <Text>
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
                </View>

                <View style={styles.tableList}>
                  <View style={styles.tableCell1}>
                    <Text>Cantidad:</Text>
                  </View>
                  <View style={styles.tableCell2}>
                    <Text>{product.quantity}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* <View style={styles.eachProduct}>
            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Lote:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>1369876568 </Text>
              </View>
            </View>
            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Producto:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>Acetaminofen 30 Tabletas 100mg</Text>
              </View>
            </View>

            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Cantidad:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>1000</Text>
              </View>
            </View>
          </View>

          <View style={styles.eachProduct}>
            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Lote:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>1369876568 </Text>
              </View>
            </View>
            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Producto:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>Guantes 2 10cm</Text>
              </View>
            </View>

            <View style={styles.tableList}>
              <View style={styles.tableCell1}>
                <Text>Cantidad:</Text>
              </View>
              <View style={styles.tableCell2}>
                <Text>1000</Text>
              </View>
            </View>
          </View> */}
        </View>

        <View style={styles.footer}>
          <View style={styles.firmas}>
            <View style={{ borderBottom: 1, paddingBottom: 5, paddingTop: 4 }}>
              <Text>Firma del jefe de almacén</Text>

              <View style={{ marginTop: 50, fontFamily: "normalFont" }}>
                <Text>Jefferson Medina</Text>
                <Text>C.I. 25783190</Text>
              </View>
            </View>
            <View style={styles.dosFirmas}>
              <Text
                style={{
                  borderRight: 1,
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
      </Page>

      {/* <Page size={{width: 200}} style={styles.page}>
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
            <View style={styles.textRigth}>
              <Text>Beneficiario:</Text>
              <Text>Cédula: </Text>
              <Text>Caso:</Text>
            </View>

            <View>
              <Text>Mercedez Colina</Text>
              <Text>11802869</Text>
              <Text>Social</Text>
            </View>
          </View>

          <View style={styles.rigthInfo}>
            <View style={styles.textRigth}>
              <Text>Nro Guia: </Text>
              <Text>Fecha: </Text>
              <Text>Enviado por:</Text>
            </View>

            <View>
              <Text>52421</Text>
              <Text>26/01/2024 </Text>
              <Text>Flor Chirino</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentTable}>
          <View style={styles.tableHeader}>
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

          <View style={styles.table}>
            <View style={[styles.tableCell, styles.firstCell]}>
              <Text>1369876568</Text>
            </View>
            <View style={[styles.tableCell, styles.middleCell]}>
              <Text>Fila 1, Celda 2</Text>
            </View>
            <View style={[styles.tableCell, styles.lastCell]}>
              <Text>10000</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableCell, styles.firstCell]}>
              <Text>1465687656</Text>
            </View>
            <View style={[styles.tableCell, styles.middleCell]}>
              <Text>Fila 2, Celda 2</Text>
            </View>
            <View style={[styles.tableCell, styles.lastCell]}>
              <Text>3</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{marginBottom: 10}}> 
            <Text>LCDA. NINFA PEREIRA</Text>
            <Text>C.I.N°14167516</Text>
          </View>
          <View style={styles.firmas}>
            <View>

            <Text>Fima del jefe de almacén</Text>
            </View>
            <Text>Firma del beneficiario </Text>
            <Text>Firma del despachador </Text>
          </View>
        </View>
      </Page> */}
    </Document>
  );
}
