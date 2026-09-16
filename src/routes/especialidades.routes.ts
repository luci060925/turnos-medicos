import { Router } from 'express';
import { EspecialidadesController } from '../controllers/especialidades.controller.ts';

const router = Router();

router.get('/', EspecialidadesController.getEspecialidades);
router.get('/:id', EspecialidadesController.getEspecialidadById);
router.post('/', EspecialidadesController.createEspecialidad);
router.delete('/:id', EspecialidadesController.deleteEspecialidad);

export default router;
