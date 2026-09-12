# TurnosMed

> REST API para la gestión centralizada de turnos médicos — especialidades y profesionales con CRUD completo y borrado lógico.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

> Actividades 1 y 2 — Integraciones Web, Módulos 1 y 2. Teclab — Tecnicatura Superior en Programación.

## Contexto

Todos los profesionales del centro atienden de **lunes a viernes**, entre las **07:00** y las **13:00**, en turnos de **30 minutos**.

Los datos se cargan desde archivos JSON al iniciar el servidor y viven en arrays en memoria. Toda alta, baja o modificación persiste únicamente mientras el proceso esté corriendo: al reiniciar, los arrays vuelven al contenido de los JSON.

## Tech Stack

| Capa | Detalle |
|---|---|
| **Runtime** | Node.js 24 LTS |
| **Lenguaje** | TypeScript |
| **Framework** | Express.js |
| **Datos** | `node:fs/promises` — JSON en memoria |

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
│   │   └── profesionales.json
│   ├── controllers/
│   │   ├── especialidades.controller.ts
│   │   └── profesionales.controller.ts
│   ├── routes/
│   │   ├── especialidades.routes.ts
│   │   └── profesionales.routes.ts
│   ├── index.ts          Servidor Express: middlewares y rutas
│   └── resources.ts      Carga de JSON, tipos de dominio y parametría de agenda
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API REST

Base: `http://localhost:3000`

### Especialidades

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/especialidades` | Listado completo | 200 | 500 |
| GET | `/especialidades/:id` | Busca por `especialidadId` | 200 | 404, 500 |
| POST | `/especialidades` | Alta de especialidad | 201 | 400, 500 |
| DELETE | `/especialidades/:id` | Borrado lógico (`activa → false`) | 204 | 404, 500 |

### Profesionales

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/profesionales` | Listado de profesionales activos | 200 | 500 |
| GET | `/profesionales/:id` | Busca por `medicoId` | 200 | 404, 500 |
| POST | `/profesionales` | Alta, validando que la especialidad exista | 201 | 400, 500 |
| PUT | `/profesionales/:id` | Modificación parcial | 200 | 400, 404, 500 |
| DELETE | `/profesionales/:id` | Borrado lógico (`activo → false`) | 204 | 404, 500 |

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

### Rutas inexistentes

```json
{
  "success": false,
  "message": "Endpoint no encontrado",
  "ruta": "/ruta-inventada",
  "metodo": "GET"
}
```

## Configuración de la agenda

La interfaz `Parametria` define los límites operativos del centro:

| Propiedad | Formato | Descripción |
|---|---|---|
| `fechaMaxima` | `YYYY-MM-DD` | Fecha límite para reservar turnos |
| `horaMinima` | `HH:mm` | Hora de apertura |
| `horaMaxima` | `HH:mm` | Hora de cierre |

---

**Luciana Mansilla** · [LinkedIn](https://www.linkedin.com/in/luciana-mansilla-854bb5419/) · [GitHub](https://github.com/luci060925)
