import { Router } from 'express';
import { ProfesionalesController } from '../controllers/profesionales.controller.ts';

const router = Router();

router.get('/', ProfesionalesController.getProfesionales);
router.get('/:id', ProfesionalesController.getProfesionalById);
router.post('/', ProfesionalesController.createProfesional);
router.put('/:id', ProfesionalesController.updateProfesional);
router.delete('/:id', ProfesionalesController.deleteProfesional);

export default router;
