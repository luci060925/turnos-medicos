import { Router } from 'express';
import {
    getProfesionales,
    getProfesionalById,
    createProfesional,
    updateProfesional,
    deleteProfesional
} from '../controllers/profesionales.controller.ts';

const router = Router();

router.get('/', getProfesionales);
router.get('/:id', getProfesionalById);
router.post('/', createProfesional);
router.put('/:id', updateProfesional);
router.delete('/:id', deleteProfesional);

export default router;
