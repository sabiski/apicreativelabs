const express = require('express');
const router = express.Router();
const contratController = require('../../controllers/employerController');




router.get('/', contratController.getAllContrats);
router.get('/:id', contratController.getContratById);
router.post('/', contratController.createContrat);
router.put('/:id',contratController.updateContrat)
router.delete('/:id',contratController.deleteContrat)


module.exports = router;