import type { Request, Response } from 'express';
import { profesionales, especialidades } from '../resources.ts';
import type { Profesional } from '../resources.ts';

// Formato UUID (8-4-4-4-12 caracteres hexadecimales)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /profesionales — solo activos
export const getProfesionales = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const activos = profesionales.filter((p: Profesional) => p.activo);
        return res.status(status).json({ success: true, data: activos });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// GET /profesionales/:id
export const getProfesionalById = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            status = 400;
            throw new Error('El id del profesional debe ser un UUID válido');
        }

        const profesional = profesionales.find((p: Profesional) => p.medicoId === id);

        if (!profesional) {
            status = 404;
            throw new Error('No existe un profesional con ese id');
        }

        return res.status(status).json({ success: true, data: profesional });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// POST /profesionales
export const createProfesional = async (req: Request, res: Response) => {
    let status = 201;
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            status = 400;
            throw new Error('El cuerpo de la petición debe ser un objeto JSON');
        }

        const { nombre, especialidad, activo } = req.body;

        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            status = 400;
            throw new Error('El campo nombre es obligatorio');
        }

        const especialidadExiste = especialidades.some(e => e.nombreEspecialidad === especialidad);
        if (!especialidadExiste) {
            status = 400;
            throw new Error('La especialidad indicada no existe en el listado');
        }

        if (activo !== undefined && typeof activo !== 'boolean') {
            status = 400;
            throw new Error('El campo activo debe ser true o false');
        }

        const nuevo: Profesional = {
            medicoId: crypto.randomUUID(),
            nombre,
            especialidad,
            activo: Boolean(activo)
        };

        profesionales.push(nuevo);

        console.clear();
        console.table(nuevo);

        return res.status(status).json({ success: true, data: nuevo });
    } catch (error: any) {
        if (status === 201) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// PUT /profesionales/:id — modificación parcial
export const updateProfesional = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            status = 400;
            throw new Error('El id del profesional debe ser un UUID válido');
        }

        const index = profesionales.findIndex((p: Profesional) => p.medicoId === id);

        if (index === -1) {
            status = 404;
            throw new Error('Profesional no encontrado');
        }

        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            status = 400;
            throw new Error('El cuerpo de la petición debe ser un objeto JSON');
        }

        const { nombre, especialidad, activo } = req.body;

        if (nombre === undefined && especialidad === undefined && activo === undefined) {
            status = 400;
            throw new Error('Debe enviar al menos un campo a modificar: nombre, especialidad o activo');
        }

        if (nombre !== undefined && (typeof nombre !== 'string' || !nombre.trim())) {
            status = 400;
            throw new Error('El campo nombre no puede estar vacío');
        }

        if (especialidad !== undefined) {
            const especialidadExiste = especialidades.some(e => e.nombreEspecialidad === especialidad);
            if (!especialidadExiste) {
                status = 400;
                throw new Error('La especialidad indicada no existe');
            }
        }

        if (activo !== undefined && typeof activo !== 'boolean') {
            status = 400;
            throw new Error('El campo activo debe ser true o false');
        }

        profesionales[index] = {
            ...profesionales[index],
            nombre:       nombre       ?? profesionales[index].nombre,
            especialidad: especialidad ?? profesionales[index].especialidad,
            activo:       activo       ?? profesionales[index].activo,
        };

        console.clear();
        console.table(profesionales[index]);

        return res.status(status).json({ success: true, data: profesionales[index] });
    } catch (error: any) {
        if (status === 200) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};

// DELETE /profesionales/:id — borrado lógico
export const deleteProfesional = async (req: Request, res: Response) => {
    let status = 200;
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
            status = 400;
            throw new Error('El id del profesional debe ser un UUID válido');
        }

        const profesional = profesionales.find((p: Profesional) => p.medicoId === id);

        if (!profesional) {
            status = 404;
            throw new Error('No existe un profesional con ese id');
        }

        profesional.activo = false;

        console.clear();
        console.table(profesional);

        status = 204;
        return res.status(status).send();
    } catch (error: any) {
        if (status === 200 || status === 204) status = 500;
        return res.status(status).json({
            success: false,
            message: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};
