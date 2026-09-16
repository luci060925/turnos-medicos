import type { Request, Response } from 'express';
import { especialidades } from '../resources.ts';
import type { Especialidad } from '../resources.ts';

// Formato UUID (8-4-4-4-12 caracteres hexadecimales)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /especialidades
export const getEspecialidades = async (req: Request, res: Response) => {
    let status = 200;
    try {
        return res.status(status).json({ success: true, data: especialidades });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// GET /especialidades/:id
export const getEspecialidadById = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            status = 400;
            throw new Error('El id de la especialidad debe ser un UUID válido');
        }

        const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

        if (!especialidad) {
            status = 404;
            throw new Error('No existe una especialidad con ese id');
        }

        return res.status(status).json({ success: true, data: especialidad });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// POST /especialidades
export const createEspecialidad = async (req: Request, res: Response) => {
    let status = 201; // El camino feliz es 201 (Creado)
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            status = 400;
            throw new Error('El cuerpo de la petición debe ser un objeto JSON');
        }

        const { nombreEspecialidad, activa } = req.body;

        if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string' || !nombreEspecialidad.trim()) {
            status = 400;
            throw new Error('El campo nombreEspecialidad es obligatorio');
        }

        if (activa !== undefined && typeof activa !== 'boolean') {
            status = 400;
            throw new Error('El campo activa debe ser true o false');
        }

        const duplicada = especialidades.some((e: Especialidad) => e.nombreEspecialidad === nombreEspecialidad);
        if (duplicada) {
            status = 400;
            throw new Error('Ya existe una especialidad con ese nombre');
        }

        const nueva: Especialidad = {
            especialidadId: crypto.randomUUID(),
            nombreEspecialidad,
            activa: Boolean(activa)
        };

        especialidades.push(nueva);

        console.clear();
        console.table(nueva);

        return res.status(status).json({ success: true, data: nueva });
    } catch (error: any) {
        if (status === 201) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// DELETE /especialidades/:id — borrado lógico
export const deleteEspecialidad = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            status = 400;
            throw new Error('El id de la especialidad debe ser un UUID válido');
        }

        const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

        if (!especialidad) {
            status = 404;
            throw new Error('No existe una especialidad con ese id');
        }

        especialidad.activa = false;

        console.clear();
        console.table(especialidad);

        status = 204; // Sin contenido
        return res.status(status).send();
    } catch (error: any) {
        if (status === 200 || status === 204) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};
