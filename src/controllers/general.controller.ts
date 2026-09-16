import type { Request, Response } from 'express';

export class GeneralController {
    static statusCode = 200;

    // GET / (Endpoint de bienvenida)
    static helloWorld = async (req: Request, res: Response) => {
        this.statusCode = 200;
        try {
            return res.status(this.statusCode).json({
                success: true,
                message: '¡Bienvenido a la API de TurnosMed!'
            });
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500;
            return res.status(this.statusCode).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // Middleware para rutas no encontradas (404 Global)
    static notFound = async (req: Request, res: Response) => {
        this.statusCode = 404;
        try {
            throw new Error(`La ruta ${req.originalUrl} no existe en este servidor`);
        } catch (error: any) {
            return res.status(this.statusCode).json({
                success: false,
                message: error.message
            });
        }
    };
}
