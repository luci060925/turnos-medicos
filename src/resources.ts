// Definición de la interfaz que establece los límites operativos
export interface ConfiguracionAgenda {
  fechaMaxima: string;
  horaMinima: string;
  horaMaxima: string;
}

// Configuración de la agenda
export const agendaTurnosMed: ConfiguracionAgenda = {
  fechaMaxima: "2026-12-30", 
  horaMinima: "07:00",
  horaMaxima: "13:00"
};