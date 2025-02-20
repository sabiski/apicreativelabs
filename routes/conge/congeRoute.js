const express = require('express');
const router = express.Router();
const congeController = require('../../controllers/employerController');


router.get('/', congeController.getAllConges);
router.get('/:id', congeController.getCongeById);
router.post('/', congeController.createConge);
router.put('/:id',congeController.updateConge)
router.delete('/:id',congeController.deleteConge)


module.exports = router;