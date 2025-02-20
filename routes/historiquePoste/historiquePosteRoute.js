const express = require('express');
const router = express.Router();
const historiquePosteController = require('../../controllers/employerController');

router.get('/', historiquePosteController.getAllHistoriquePostes);
router.get('/:id', historiquePosteController.getHistoriquePosteById);
router.post('/', historiquePosteController.createHistoriquePoste);
router.put('/:id', historiquePosteController.updatedHistoriquePoste);
router.delete('/:id', historiquePosteController.deleteHistoriquePoste);

module.exports = router;