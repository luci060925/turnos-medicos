import express from 'express';
import especialidadesRoutes from './routes/especialidades.routes.ts';
import profesionalesRoutes from './routes/profesionales.routes.ts';
import { GeneralController } from './controllers/general.controller.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint de bienvenida delegando al controller general
app.get('/', GeneralController.helloWorld);

app.use('/especialidades', especialidadesRoutes);
app.use('/profesionales', profesionalesRoutes);

// Middleware global 404 delegando al controller general
app.use(GeneralController.notFound);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});