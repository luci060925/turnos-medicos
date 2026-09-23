# Módulo de Pacientes y Turnos

> Propuesta técnica del próximo módulo de TurnosMed, pensada como mockup para que el equipo de Frontend avance con la pantalla de gestión de pacientes y asignación de turnos médicos.

El documento define el modelado de datos de las entidades **Paciente** y **Turno**, el catálogo de **estados de turno** y los endpoints RESTful propuestos para cada una. Respeta las mismas convenciones del módulo ya implementado: identificadores UUID v4, validaciones previas, borrado lógico y respuestas con la estructura `{ success, data }` o `{ success, message }`.

Los datos de ejemplo viven en `src/data/pacientes.json`, `src/data/turnos.json` y `src/data/estados-turno.json`.

---

## 1. Modelado de datos

### 1.1 Paciente — `pacientes.json`

Es la persona que solicita atención en el centro médico. Reúne los datos mínimos para identificarla, contactarla y saber con qué cobertura se la atiende.

```typescript
export interface Paciente {
    pacienteId: string;        // UUID v4
    nombre: string;
    dni: string;
    fechaNacimiento: string;   // YYYY-MM-DD
    email: string;
    telefono: string;
    coberturaSalud: string;
    activo: boolean;
}
```

```json
{
  "pacienteId": "79793752-95ca-4af7-a318-bc464d456e75",
  "nombre": "María Elena Gómez",
  "dni": "38450912",
  "fechaNacimiento": "1994-06-15",
  "email": "maria.gomez@example.com",
  "telefono": "+542974253476",
  "coberturaSalud": "OSDE 310",
  "activo": true
}
```

| Campo | Descripción |
|---|---|
| `pacienteId` | Identificador único, generado por el servidor con `crypto.randomUUID()`. Es el dato con el que el resto de la API referencia al paciente y no se puede modificar. |
| `nombre` | Nombre y apellido del paciente, con el mismo criterio de campo único que ya usa la entidad Profesional. |
| `dni` | Número de documento. Se guarda como texto porque puede tener ceros a la izquierda y nunca se hacen operaciones matemáticas con él. No puede repetirse entre pacientes. |
| `fechaNacimiento` | Fecha en formato ISO `YYYY-MM-DD`. Permite calcular la edad, dato necesario para derivar al paciente a especialidades como Pediatría. |
| `email` | Correo de contacto, usado para los recordatorios de turno. |
| `telefono` | Teléfono en formato internacional, para avisos urgentes de cancelación o reprogramación. |
| `coberturaSalud` | Obra social o prepaga con su plan. Los pacientes sin cobertura se registran como `Particular`. |
| `activo` | Indica si la ficha está vigente. El borrado es lógico: al dar de baja pasa a `false` y el registro se conserva, igual que en Especialidades y Profesionales. |

### 1.2 Turno — `turnos.json`

Es la reserva de un espacio de atención: vincula a un paciente con un profesional en una fecha y hora determinadas, y registra en qué punto del circuito está esa atención.

```typescript
export interface Turno {
    turnoId: string;           // UUID v4
    fecha: string;             // YYYY-MM-DD
    hora: string;              // HH:mm
    especialidad: string;
    medicoId: string;          // UUID v4 del profesional
    nombreProfesional: string;
    pacienteId: string;        // UUID v4 del paciente
    nombrePaciente: string;
    estado: string;            // código del catálogo de estados
}
```

```json
{
  "turnoId": "85b2dec8-818d-460f-90e4-f8ea8623ef13",
  "fecha": "2026-10-05",
  "hora": "09:30",
  "especialidad": "Cardiología",
  "medicoId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "nombreProfesional": "Laura Martínez",
  "pacienteId": "79793752-95ca-4af7-a318-bc464d456e75",
  "nombrePaciente": "María Elena Gómez",
  "estado": "registrado"
}
```

| Campo | Descripción |
|---|---|
| `turnoId` | Identificador único de la reserva, generado por el servidor. Es el comprobante del paciente y con él se consulta o modifica el turno. |
| `fecha` | Día de la atención en formato ISO. Debe ser un día hábil y no superar la `fechaMaxima` de la parametría de agenda. |
| `hora` | Hora de inicio en formato `HH:mm`. Debe caer en una franja de 30 minutos dentro del rango `horaMinima`–`horaMaxima`. |
| `especialidad` | Especialidad bajo la que se atiende. Tiene que existir en el listado y coincidir con la del profesional asignado. |
| `medicoId` | UUID del profesional. Es la referencia real: si el profesional cambia de nombre, el turno sigue apuntando al registro correcto. |
| `nombreProfesional` | Nombre del profesional al momento de reservar. Se guarda además del id para que el frontend arme la agenda sin pedir cada ficha por separado. |
| `pacienteId` | UUID del paciente, con el mismo criterio que `medicoId`. |
| `nombrePaciente` | Nombre del paciente al momento de reservar, para mostrar la agenda sin consultas adicionales. |
| `estado` | Punto del circuito en el que está el turno. Siempre es un `codigo` del catálogo de estados. |

> Los campos `nombreProfesional` y `nombrePaciente` son una copia del dato al momento de la reserva: sirven para mostrar la agenda en una sola consulta. Ante una diferencia, el dato válido es el de la ficha a la que apuntan `medicoId` y `pacienteId`.

### 1.3 Estados de turno — `estados-turno.json`

Catálogo cerrado de los estados válidos. Existe como archivo propio para que el frontend construya sus filtros y etiquetas a partir de la API, en lugar de tener la lista escrita a mano.

```typescript
export interface EstadoTurno {
    codigo: string;
    nombre: string;
    descripcion: string;
}
```

```json
{
  "codigo": "registrado",
  "nombre": "Registrado",
  "descripcion": "El turno fue reservado y quedó agendado."
}
```

| Campo | Descripción |
|---|---|
| `codigo` | Valor técnico del estado, en minúsculas. Es el que viaja en el campo `estado` del turno y el que se usa en las comparaciones del código. |
| `nombre` | Etiqueta legible, pensada para mostrarse en pantalla tal cual. |
| `descripcion` | Qué significa ese estado dentro del circuito de atención. |

### 1.4 Circuito de estados

| Código | Nombre | Significado |
|---|---|---|
| `registrado` | Registrado | El turno fue reservado y quedó agendado. |
| `validado` | Validado | Se verificaron los datos del turno y la cobertura del paciente. |
| `presente` | Presente | El paciente se acreditó en el centro médico. |
| `en_consulta` | En consulta | El profesional está atendiendo al paciente. |
| `finalizado` | Finalizado | La atención terminó y el turno se cerró. |
| `cancelado` | Cancelado | Se dio de baja con aviso previo y la franja quedó libre. |
| `ausente` | Ausente | El paciente no asistió ni avisó, y la franja se perdió. |

Transiciones permitidas:

| Estado actual | Puede pasar a | Quién lo hace |
|---|---|---|
| `registrado` | `validado`, `cancelado`, `ausente` | Administración, al verificar la cobertura y los datos. |
| `validado` | `presente`, `cancelado`, `ausente` | Recepción, cuando el paciente se acredita. |
| `presente` | `en_consulta`, `cancelado` | El profesional, al hacerlo pasar al consultorio. |
| `en_consulta` | `finalizado` | El profesional, al cerrar la atención. |
| `finalizado`, `cancelado`, `ausente` | — | Son estados finales: no admiten más cambios. |

`cancelado` y `ausente` se separan porque no son lo mismo: la cancelación llega con aviso y libera la franja para otro paciente, mientras que el ausente se registra cuando la franja ya se perdió. Distinguirlos permite medir el ausentismo real del centro.

---

## 2. Endpoints propuestos

Base: `http://localhost:3000`

### 2.1 Pacientes

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/pacientes` | Listado de pacientes activos | 200 | 500 |
| GET | `/pacientes/:id` | Busca por `pacienteId` | 200 | 400, 404, 500 |
| POST | `/pacientes` | Alta de paciente | 201 | 400, 500 |
| PUT | `/pacientes/:id` | Modificación parcial de la ficha | 200 | 400, 404, 500 |
| DELETE | `/pacientes/:id` | Borrado lógico (`activo → false`) | 204 | 400, 404, 500 |

**`POST /pacientes`** — body:

```json
{
  "nombre": "Camila Rojas",
  "dni": "45908321",
  "fechaNacimiento": "2004-11-23",
  "email": "camila.rojas@example.com",
  "telefono": "+542975604417",
  "coberturaSalud": "Particular"
}
```

El `pacienteId` lo genera el servidor y `activo` queda en `true`. Respuesta `201` con el paciente creado dentro de `data`.

**`PUT /pacientes/:id`** — mismo criterio que `PUT /profesionales/:id`: solo se actualizan los campos enviados y hay que mandar al menos uno. El `pacienteId` no se puede modificar.

### 2.2 Turnos

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/turnos` | Listado de turnos, con filtros opcionales | 200 | 400, 500 |
| GET | `/turnos/:id` | Busca por `turnoId` | 200 | 400, 404, 500 |
| POST | `/turnos` | Reserva de un turno | 201 | 400, 404, 409, 500 |
| PUT | `/turnos/:id` | Reprogramación o cambio de estado | 200 | 400, 404, 409, 500 |

**Query params de `GET /turnos`** (se pueden combinar):

| Parámetro | Formato | Ejemplo | Descripción |
|---|---|---|---|
| `fecha` | `YYYY-MM-DD` | `/turnos?fecha=2026-10-05` | Turnos de ese día. |
| `medicoId` | UUID v4 | `/turnos?medicoId=1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | Agenda de un profesional. |
| `estado` | código del catálogo | `/turnos?estado=registrado` | Turnos en ese estado. |
| `pacienteId` | UUID v4 | `/turnos?pacienteId=79793752-95ca-4af7-a318-bc464d456e75` | Historial de un paciente. |

```
GET /turnos?fecha=2026-10-05&estado=registrado
```

Si un parámetro tiene un formato inválido (una fecha mal escrita, un UUID que no cumple el formato o un estado que no está en el catálogo) la respuesta es `400`. Si el formato es correcto pero no hay coincidencias, la respuesta es `200` con `data` vacío.

**`POST /turnos`** — body:

```json
{
  "fecha": "2026-10-05",
  "hora": "09:30",
  "medicoId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "pacienteId": "79793752-95ca-4af7-a318-bc464d456e75"
}
```

La `especialidad`, el `nombreProfesional` y el `nombrePaciente` los completa el servidor a partir de las fichas referenciadas. El turno nace siempre en estado `registrado`.

**`PUT /turnos/:id`** — cubre dos escenarios:

*Reprogramar*, mientras el turno esté en `registrado` o `validado`:

```json
{
  "fecha": "2026-10-07",
  "hora": "11:00"
}
```

*Avanzar el circuito*:

```json
{
  "estado": "validado"
}
```

No se define `DELETE /turnos`. Dar de baja una reserva se resuelve con `PUT` al estado `cancelado`: así el turno queda en el historial del paciente y las cancelaciones se pueden contar junto con los ausentes para medir el ausentismo.

---

## 3. Validaciones previas

Siguen el mismo patrón que los controllers ya implementados: se validan antes de tocar los datos, asignan `this.statusCode` y lanzan `throw new Error(...)`.

**Pacientes**
- El `:id` debe tener formato UUID, si no responde `400`.
- El cuerpo debe ser un objeto JSON, si no responde `400`.
- `nombre` y `dni` son obligatorios y deben ser texto no vacío.
- El `dni` no puede pertenecer a otro paciente registrado.
- `fechaNacimiento` debe tener formato `YYYY-MM-DD` y no puede ser futura.
- `email` debe contener `@` y `activo`, si se envía, debe ser booleano.

**Turnos**
- El `:id` debe tener formato UUID.
- `medicoId` y `pacienteId` deben existir y estar activos, si no responde `404`.
- La especialidad del profesional debe estar activa en el listado.
- `fecha` debe ser un día hábil, de lunes a viernes, y no superar `fechaMaxima`.
- `hora` debe estar entre `horaMinima` y `horaMaxima`, y caer en una franja de 30 minutos (`:00` o `:30`).
- El profesional no puede tener otro turno en esa misma fecha y hora: si lo tiene, responde `409`.
- El `estado` enviado debe existir en `estados-turno.json` y la transición debe estar permitida desde el estado actual.
- Un turno en estado final no admite más cambios.

---

**Luciana Mansilla** · [LinkedIn](https://www.linkedin.com/in/luciana-mansilla-854bb5419/) · [GitHub](https://github.com/luci060925)
