const express = require('express');
const router = express.Router();
const documentsEmployeController = require('../../controllers/employerController');


router.get('/', documentsEmployeController.getAllDocumentsEmployes);
router.get('/:id', documentsEmployeController.getDocumentsEmployeById);
router.post('/', documentsEmployeController.createDocumentsEmploye);
router.put('/:id', documentsEmployeController.updatedDocumentsEmploye);
router.delete('/:id', documentsEmployeController.deleteDocumentsEmploye);


module.exports = router;