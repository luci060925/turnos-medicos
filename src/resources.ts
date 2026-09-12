import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface Especialidad {
    especialidadId: string;
    nombreEspecialidad: string;
    activa: boolean;
}

export interface Profesional {
    medicoId: string;
    nombre: string;
    especialidad: string;
    activo: boolean;
}

export interface Parametria {
    fechaMaxima: string;
    horaMinima: string;
    horaMaxima: string;
}

export const configuracionAgenda: Parametria = {
    fechaMaxima: '2026-12-30',
    horaMinima: '07:00',
    horaMaxima: '13:00'
};

const readJSON = async <T>(filename: string): Promise<T> => {
    const content = await readFile(path.resolve('src', 'data', filename), 'utf-8');
    return JSON.parse(content) as T;
};

export const especialidades: Especialidad[] = await readJSON<Especialidad[]>('especialidades.json');
export const profesionales: Profesional[] = await readJSON<Profesional[]>('profesionales.json');
