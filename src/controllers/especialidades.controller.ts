import type { Request, Response } from 'express';
import { especialidades } from '../resources.ts';
import type { Especialidad } from '../resources.ts';

// GET /especialidades
export const getEspecialidades = (req: Request, res: Response) => {
    try {
        res.status(200).json({ success: true, data: especialidades });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// GET /especialidades/:id
export const getEspecialidadById = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

        if (!especialidad) {
            return res.status(404).json({ success: false, message: 'No existe una especialidad con ese id' });
        }

        res.status(200).json({ success: true, data: especialidad });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// POST /especialidades
export const createEspecialidad = (req: Request, res: Response) => {
    try {
        const { nombreEspecialidad, activa } = req.body;

        if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string') {
            return res.status(400).json({ success: false, message: 'El campo nombreEspecialidad es obligatorio' });
        }

        const duplicada = especialidades.some((e: Especialidad) => e.nombreEspecialidad === nombreEspecialidad);
        if (duplicada) {
            return res.status(400).json({ success: false, message: 'Ya existe una especialidad con ese nombre' });
        }

        const nueva: Especialidad = {
            especialidadId: crypto.randomUUID(),
            nombreEspecialidad,
            activa: Boolean(activa)
        };

        especialidades.push(nueva);

        console.clear();
        console.table(nueva);

        res.status(201).json({ success: true, data: nueva });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// DELETE /especialidades/:id — borrado lógico
export const deleteEspecialidad = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

        if (!especialidad) {
            return res.status(404).json({ success: false, message: 'No existe una especialidad con ese id' });
        }

        especialidad.activa = false;

        console.clear();
        console.table(especialidad);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
