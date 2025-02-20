const express = require('express');
const router = express.Router();
const historiqueStatutController = require('../../controllers/employerController');

router.get('/', historiqueStatutController.getAllHistoriqueStatuts);
router.get('/:id', historiqueStatutController.getHistoriqueStatutById);
router.post('/', historiqueStatutController.createHistoriqueStatut);
router.put('/:id', historiqueStatutController.updatedHistoriqueStatut);
router.delete('/:id', historiqueStatutController.deleteHistoriqueStatut);

module.exports = router;