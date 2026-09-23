# TurnosMed

> REST API para la gestión centralizada de turnos médicos — especialidades y profesionales con CRUD completo y borrado lógico.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

> Actividades 1, 2, 3 y 4 — Integraciones Web, Módulos 1, 2, 3 y 4. Teclab — Tecnicatura Superior en Programación.

## Contexto

Todos los profesionales del centro atienden de **lunes a viernes**, entre las **07:00** y las **13:00**, en turnos de **30 minutos**.

Los datos se cargan desde archivos JSON al iniciar el servidor y viven en arrays en memoria. Toda alta, baja o modificación persiste únicamente mientras el proceso esté corriendo: al reiniciar, los arrays vuelven al contenido de los JSON.

La propuesta del próximo módulo, con el modelado de **Pacientes** y **Turnos**, el catálogo de estados y sus endpoints, está documentada en [`pacientes-turnos.md`](./pacientes-turnos.md).

## Tech Stack

| Capa | Detalle |
|---|---|
| **Runtime** | Node.js 24 LTS |
| **Lenguaje** | TypeScript |
| **Framework** | Express.js |
| **Datos** | `node:fs/promises` — JSON en memoria |
| **Identificadores** | UUID v4 (`crypto.randomUUID()`) |

## Requisitos previos

- Node.js 24 LTS o superior
- npm 11 o superior

## Instalación y ejecución

```bash
git clone https://github.com/luci060925/turnos-medicos.git
cd turnos-medicos
npm install
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Modo desarrollo con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta el proyecto compilado |

## Estructura del proyecto

```
turnos-medicos/
├── src/
│   ├── data/
│   │   ├── especialidades.json
│   │   ├── profesionales.json
│   │   ├── pacientes.json                 Mockup del próximo módulo
│   │   ├── turnos.json                    Mockup del próximo módulo
│   │   └── estados-turno.json             Catálogo de estados de turno
│   ├── controllers/
│   │   ├── general.controller.ts          helloWorld (bienvenida) y notFound (rutas inexistentes)
│   │   ├── especialidades.controller.ts   Lógica de la entidad Especialidades
│   │   └── profesionales.controller.ts    Lógica de la entidad Profesionales
│   ├── routes/
│   │   ├── especialidades.routes.ts
│   │   └── profesionales.routes.ts
│   ├── index.ts          Servidor Express: middlewares y rutas
│   └── resources.ts      Carga de JSON, tipos de dominio y parametría de agenda
├── .gitignore
├── package.json
├── tsconfig.json
├── pacientes-turnos.md   Propuesta del módulo de Pacientes y Turnos
└── README.md
```

### Arquitectura

Las rutas solo asocian cada endpoint con el método del controller de su entidad (`GeneralController`, `EspecialidadesController`, `ProfesionalesController`); la lógica vive en `src/controllers/`. Cada controller es una clase con métodos estáticos asincrónicos que siguen el mismo patrón:

- Una variable de estado `statusCode` propia del controller, que se ajusta según el camino del flujo (éxito o error).
- Validaciones previas a buscar, filtrar, modificar o eliminar datos. Si una no se cumple, se asigna el código correspondiente y se lanza `throw new Error(...)`.
- La lógica envuelta en `try-catch`: el `catch` responde con el código ya configurado, o `500` si el error fue inesperado.
- `return` explícito en cada respuesta, para evitar el error *headers already sent*.

```ts
static getProfesionalById = async (req: Request, res: Response) => {
    this.statusCode = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            this.statusCode = 400;
            throw new Error('El id del profesional debe ser un UUID válido');
        }
        // ...
        return res.status(this.statusCode).json({ success: true, data: profesional });
    } catch (error: any) {
        if (this.statusCode < 400) this.statusCode = 500;
        return res.status(this.statusCode).json({ success: false, message: error.message });
    }
};
```

## API REST

Base: `http://localhost:3000`

### Parámetros de entrada

| Tipo | Uso en esta API |
|---|---|
| **Params de ruta** | El identificador del recurso: `/especialidades/:id`, `/profesionales/:id` |
| **Query params** | No se usan en esta versión. Los filtros propuestos para `GET /turnos` están en [`pacientes-turnos.md`](./pacientes-turnos.md) |
| **Body (JSON)** | Los datos de alta y modificación en `POST` y `PUT`, con `Content-Type: application/json` |

### Identificadores (UUID v4)

`especialidadId` y `medicoId` son UUID; los registros nuevos se generan con `crypto.randomUUID()` (UUID v4). En las rutas con `:id` primero se valida el formato UUID (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, hexadecimal):

- Formato inválido (ej. `/profesionales/123`) → `400`
- Formato válido pero sin registro asociado → `404`

### General

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/` | Mensaje de bienvenida | 200 | 500 |
| * | Cualquier ruta o método no contemplado | Middleware `GeneralController.notFound` | — | 404 |

### Especialidades

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/especialidades` | Listado completo | 200 | 500 |
| GET | `/especialidades/:id` | Busca por `especialidadId` | 200 | 400, 404, 500 |
| POST | `/especialidades` | Alta de especialidad | 201 | 400, 500 |
| DELETE | `/especialidades/:id` | Borrado lógico (`activa → false`) | 204 | 400, 404, 500 |

Validaciones del alta: el cuerpo debe ser un objeto JSON; `nombreEspecialidad` es obligatorio (texto no vacío) y no puede repetirse; `activa`, si se envía, debe ser `true` o `false` (si se omite queda en `false`).

### Profesionales

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/profesionales` | Listado de profesionales activos | 200 | 500 |
| GET | `/profesionales/:id` | Busca por `medicoId` | 200 | 400, 404, 500 |
| POST | `/profesionales` | Alta, validando que la especialidad exista | 201 | 400, 500 |
| PUT | `/profesionales/:id` | Modificación parcial | 200 | 400, 404, 500 |
| DELETE | `/profesionales/:id` | Borrado lógico (`activo → false`) | 204 | 400, 404, 500 |

Validaciones del alta: el cuerpo debe ser un objeto JSON; `nombre` es obligatorio (texto no vacío); `especialidad` debe coincidir con una especialidad existente; `activo`, si se envía, debe ser `true` o `false` (si se omite queda en `false`).

Validaciones de la modificación: se debe enviar al menos uno de `nombre`, `especialidad` o `activo`; `nombre` no puede estar vacío, `especialidad` debe existir y `activo` debe ser booleano.

### Cuerpos de las peticiones

`POST /especialidades`
```json
{
  "nombreEspecialidad": "Kinesiología",
  "activa": true
}
```

`POST /profesionales`
```json
{
  "nombre": "Ana Gutiérrez",
  "especialidad": "Cardiología",
  "activo": true
}
```

`PUT /profesionales/:id` *(campos opcionales — solo se actualizan los enviados)*
```json
{
  "nombre": "Ana Gutiérrez",
  "especialidad": "Pediatría",
  "activo": true
}
```

### Formato de respuestas

Éxito:
```json
{ "success": true, "data": {} }
```

Error:
```json
{ "success": false, "message": "Descripción del problema" }
```

Las respuestas `204` no llevan cuerpo.

### Códigos de estado

| Código | Uso |
|---|---|
| `200` | Consulta o modificación exitosa |
| `201` | Alta exitosa |
| `204` | Borrado lógico exitoso (sin cuerpo) |
| `400` | Id sin formato UUID, cuerpo ausente, campos faltantes o de tipo inválido, especialidad inexistente o duplicada |
| `404` | Recurso inexistente o ruta no contemplada |
| `500` | Error inesperado del servidor |

### Rutas inexistentes

Respuesta del middleware `GeneralController.notFound` (`404`):

```json
{
  "success": false,
  "message": "La ruta /ruta-inventada no existe en este servidor"
}
```

### Datos para probar

| Recurso | Id | Registro |
|---|---|---|
| Especialidad | `e1a9b1c1-4d32-4b3a-9c12-3f4a5b6c7d8e` | Cardiología |
| Profesional | `1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | Laura Martínez |

Para un id inexistente con formato válido se puede usar `00000000-0000-4000-8000-000000000000`. Para los registros creados con `POST`, copiar el UUID devuelto en `data` y usarlo en `GET`, `PUT` o `DELETE`.

## Configuración de la agenda

La interfaz `Parametria` define los límites operativos del centro:

| Propiedad | Formato | Descripción |
|---|---|---|
| `fechaMaxima` | `YYYY-MM-DD` | Fecha límite para reservar turnos |
| `horaMinima` | `HH:mm` | Hora de apertura |
| `horaMaxima` | `HH:mm` | Hora de cierre |

---

**Luciana Mansilla** · [LinkedIn](https://www.linkedin.com/in/luciana-mansilla-854bb5419/) · [GitHub](https://github.com/luci060925)
