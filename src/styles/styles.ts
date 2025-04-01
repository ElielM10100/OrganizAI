import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  
  pickerRowContainer: {  // Estilo para o container de linhas de Pickers
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    width: "100%",
  },

  pickerButton: {  // Estilo para o botão do Picker
    backgroundColor: "#424242",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },

  pickerButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  pickerContainer: {
    flex: 1, // Cada Picker ocupa espaço igual
    marginHorizontal: 5, // Espaçamento lateral entre os Pickers
    borderWidth: 1,
    borderColor: "#616161",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#424242",
  },
  picker: {
    width: "100%",
    color: "#ffffff",
  },
  verseText: { // Estilo para o texto do versículo / LerBiblia.tsx
    fontSize: 28,
    color: "#e0e0e0",
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "#424242",
    padding: 10,
    borderRadius: 8,
  },
  contentText: { // Estilo para o texto do conteúdo
    fontSize: 18,
    textAlign: "center",
    color: "#eeeeee",
    paddingLeft: 20,
    paddingRight: 20,
  },
  navigationContainer: {  // Estilo para o container de navegação
    marginTop: 20,
    alignItems: "center",
  },
  navText: {  // Estilo para o texto da navegação
    fontSize: 16,
    marginBottom: 10,
    color: "#fdd835",
  },
  buttonGroup: {  // Estilo para o grupo de botões
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },

  compartilhar: {

  }

  
});
