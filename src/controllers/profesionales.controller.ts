import type { Request, Response } from 'express';
import { profesionales, especialidades } from '../resources.ts';
import type { Profesional } from '../resources.ts';

// GET /profesionales — solo activos
export const getProfesionales = (req: Request, res: Response) => {
    try {
        const activos = profesionales.filter((p: Profesional) => p.activo);
        res.status(200).json({ success: true, data: activos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// GET /profesionales/:id
export const getProfesionalById = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profesional = profesionales.find((p: Profesional) => p.medicoId === id);

        if (!profesional) {
            return res.status(404).json({ success: false, message: 'No existe un profesional con ese id' });
        }

        res.status(200).json({ success: true, data: profesional });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// POST /profesionales
export const createProfesional = (req: Request, res: Response) => {
    try {
        const { nombre, especialidad, activo } = req.body;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
        }

        const especialidadExiste = especialidades.some(e => e.nombreEspecialidad === especialidad);
        if (!especialidadExiste) {
            return res.status(400).json({ success: false, message: 'La especialidad indicada no existe en el listado' });
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

        res.status(201).json({ success: true, data: nuevo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// PUT /profesionales/:id
export const updateProfesional = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const index = profesionales.findIndex((p: Profesional) => p.medicoId === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
        }

        const { nombre, especialidad, activo } = req.body;

        if (especialidad) {
            const especialidadExiste = especialidades.some(e => e.nombreEspecialidad === especialidad);
            if (!especialidadExiste) {
                return res.status(400).json({ success: false, message: 'La especialidad indicada no existe' });
            }
        }

        profesionales[index] = {
            ...profesionales[index],
            nombre:       nombre       ?? profesionales[index].nombre,
            especialidad: especialidad ?? profesionales[index].especialidad,
            activo:       activo       ?? profesionales[index].activo,
        };

        console.clear();
        console.table(profesionales[index]);

        res.status(200).json({ success: true, data: profesionales[index] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// DELETE /profesionales/:id — borrado lógico
export const deleteProfesional = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profesional = profesionales.find((p: Profesional) => p.medicoId === id);

        if (!profesional) {
            return res.status(404).json({ success: false, message: 'No existe un profesional con ese id' });
        }

        profesional.activo = false;

        console.clear();
        console.table(profesional);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
