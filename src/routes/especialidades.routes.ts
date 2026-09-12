import { Router } from 'express';
import {
    getEspecialidades,
    getEspecialidadById,
    createEspecialidad,
    deleteEspecialidad
} from '../controllers/especialidades.controller.ts';

const router = Router();

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadById);
router.post('/', createEspecialidad);
router.delete('/:id', deleteEspecialidad);

export default router;
