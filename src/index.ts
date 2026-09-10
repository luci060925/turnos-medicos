import { readFile } from "node:fs/promises";
import express from "express";
// Importamos la configuración desde resources (nota que se usa .js en la ruta al compilar con NodeNext)
import { agendaTurnosMed, ConfiguracionAgenda } from "./resources.js";

// Arrays globales para almacenar los datos
let especialidades: any[] = [];
let profesionales: any[] = [];

// Manipulación asíncrona de archivos
async function cargarDatosIniciales() {
  try {
    const datosEspecialidades = await readFile("./src/data/especialidades.json", "utf-8");
    especialidades = JSON.parse(datosEspecialidades);

    const datosProfesionales = await readFile("./src/data/profesionales.json", "utf-8");
    profesionales = JSON.parse(datosProfesionales);

    console.log("Datos de TurnosMed cargados correctamente en memoria.");
    console.log(`La agenda opera hasta el ${agendaTurnosMed.fechaMaxima}, de ${agendaTurnosMed.horaMinima} a ${agendaTurnosMed.horaMaxima}`);
  } catch (error) {
    console.error("Error al leer los archivos JSON:", error);
  }
}

// Inicialización de la aplicación
const app = express();
app.use(express.json());

cargarDatosIniciales().then(() => {
  app.listen(3000, () => {
    console.log("Servidor backend operativo en el puerto 3000.");
  });
});