import express from 'express';
import type { Request, Response } from 'express';
import especialidadesRoutes from './routes/especialidades.routes.ts';
import profesionalesRoutes from './routes/profesionales.routes.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Bienvenidos al servidor web de MedTurnos' });
});

app.use('/especialidades', especialidadesRoutes);
app.use('/profesionales', profesionalesRoutes);

// Middleware global 404
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        ruta: req.originalUrl,
        metodo: req.method
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
