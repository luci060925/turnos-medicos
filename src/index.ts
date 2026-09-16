import express from 'express';
import especialidadesRoutes from './routes/especialidades.routes.ts';
import profesionalesRoutes from './routes/profesionales.routes.ts';
import { getWelcome, notFoundHandler, errorHandler } from './controllers/general.controller.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint de bienvenida delegando al controller general
app.get('/', getWelcome);

app.use('/especialidades', especialidadesRoutes);
app.use('/profesionales', profesionalesRoutes);

// Middleware global 404 delegando al controller general
app.use(notFoundHandler);

// Middleware de errores (ej. JSON mal formado) delegando al controller general
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});