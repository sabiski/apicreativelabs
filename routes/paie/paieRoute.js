const express = require('express');
const router = express.Router();
const paieController = require('../../controllers/paieController');




router.get('/', paieController.getAllPaie);
router.get('/:id', paieController.getPaieById);
router.post('/', paieController.createPaie);
router.put('/:id',paieController.updatePaie)
router.delete('/:id',paieController.deletePaie)


module.exports = router;