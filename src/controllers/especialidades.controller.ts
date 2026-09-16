import type { Request, Response } from 'express';
import { especialidades } from '../resources.ts';
import type { Especialidad } from '../resources.ts';

// Formato UUID (8-4-4-4-12 caracteres hexadecimales)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class EspecialidadesController {
    static statusCode = 200;

    // GET /especialidades
    static getEspecialidades = async (req: Request, res: Response) => {
        this.statusCode = 200;
        try {
            return res.status(this.statusCode).json({ success: true, data: especialidades });
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500;
            return res.status(this.statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    };

    // GET /especialidades/:id
    static getEspecialidadById = async (req: Request, res: Response) => {
        this.statusCode = 200;
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
                this.statusCode = 400;
                throw new Error('El id de la especialidad debe ser un UUID válido');
            }

            const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

            if (!especialidad) {
                this.statusCode = 404;
                throw new Error('No existe una especialidad con ese id');
            }

            return res.status(this.statusCode).json({ success: true, data: especialidad });
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500;
            return res.status(this.statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    };

    // POST /especialidades
    static createEspecialidad = async (req: Request, res: Response) => {
        this.statusCode = 201; // El camino feliz es 201 (Creado)
        try {
            if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                this.statusCode = 400;
                throw new Error('El cuerpo de la petición debe ser un objeto JSON');
            }

            const { nombreEspecialidad, activa } = req.body;

            if (!nombreEspecialidad || typeof nombreEspecialidad !== 'string' || !nombreEspecialidad.trim()) {
                this.statusCode = 400;
                throw new Error('El campo nombreEspecialidad es obligatorio');
            }

            if (activa !== undefined && typeof activa !== 'boolean') {
                this.statusCode = 400;
                throw new Error('El campo activa debe ser true o false');
            }

            const duplicada = especialidades.some((e: Especialidad) => e.nombreEspecialidad === nombreEspecialidad);
            if (duplicada) {
                this.statusCode = 400;
                throw new Error('Ya existe una especialidad con ese nombre');
            }

            const nueva: Especialidad = {
                especialidadId: crypto.randomUUID(),
                nombreEspecialidad,
                activa: Boolean(activa)
            };

            especialidades.push(nueva);

            return res.status(this.statusCode).json({ success: true, data: nueva });
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500;
            return res.status(this.statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    };

    // DELETE /especialidades/:id — borrado lógico
    static deleteEspecialidad = async (req: Request, res: Response) => {
        this.statusCode = 204; // Sin contenido
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
                this.statusCode = 400;
                throw new Error('El id de la especialidad debe ser un UUID válido');
            }

            const especialidad = especialidades.find((e: Especialidad) => e.especialidadId === id);

            if (!especialidad) {
                this.statusCode = 404;
                throw new Error('No existe una especialidad con ese id');
            }

            especialidad.activa = false;

            return res.status(this.statusCode).send();
        } catch (error: any) {
            if (this.statusCode < 400) this.statusCode = 500;
            return res.status(this.statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    };
}
