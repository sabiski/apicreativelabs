const express = require('express');
const router = express.Router();
const congeController = require('../../controllers/congeController');


router.get('/', congeController.getAllConges);
router.get('/:id', congeController.getCongeById);
router.post('/', congeController.createConge);
router.put('/:id', congeController.updateConge);
router.delete('/:id', congeController.deleteConge);
router.get('/employe/:employeId', congeController.getCongesByEmploye);


module.exports = router;