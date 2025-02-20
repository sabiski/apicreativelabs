const express = require('express');
const router = express.Router();
const presenceAbsenceController = require('../../controllers/employerController');




router.get('/', presenceAbsenceController.getAllPresenceAbsences);
router.get('/:id', presenceAbsenceController.getPresenceAbsenceById);
router.post('/', presenceAbsenceController.createPresenceAbsence);
router.put('/:id',presenceAbsenceController.updatedPresenceAbsence)
router.delete('/:id',presenceAbsenceController.deletePresenceAbsence)


module.exports = router;