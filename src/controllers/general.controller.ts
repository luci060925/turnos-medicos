import type { Request, Response, NextFunction } from 'express';

// GET / (Endpoint de bienvenida)
export const getWelcome = async (req: Request, res: Response) => {
    let status = 200;
    try {
        return res.status(status).json({ 
            success: true, 
            message: '¡Bienvenido a la API de TurnosMed!' 
        });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
};

// Middleware para rutas no encontradas (404 Global)
export const notFoundHandler = async (req: Request, res: Response) => {
    let status = 404;
    try {
        throw new Error(`La ruta ${req.originalUrl} no existe en este servidor`);
    } catch (error: any) {
        return res.status(status).json({ 
            success: false, 
            message: error.message
        });
    }
};

// Middleware de errores: JSON mal formado u otros fallos fuera de los controllers
export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    let status = 500;
    try {
        if (err?.type === 'entity.parse.failed') {
            status = 400;
            throw new Error('El cuerpo de la petición no es un JSON válido');
        }
        throw new Error('Error interno del servidor');
    } catch (error: any) {
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};