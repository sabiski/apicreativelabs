const express = require('express');
const router = express.Router();
const blameAbsenceController = require('../../controllers/employerController');




router.get('/', blameAbsenceController.getAllBlames);
router.get('/:id', blameAbsenceController.getBlameById);
router.post('/', blameAbsenceController.createBlame);
router.put('/:id',blameAbsenceController.updatedBlame)
router.delete('/:id',blameAbsenceController.deleteBlame)


module.exports = router;