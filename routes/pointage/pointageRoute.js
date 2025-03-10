const express = require('express');
const router = express.Router();
const pointageController = require('../../controllers/pointageController');

router.get('/', pointageController.getAllPointages);
router.get('/:id', pointageController.getPointageById);
router.post('/', pointageController.createPointage);
router.put('/:id', pointageController.updatedPointage);
router.delete('/:id', pointageController.deletePointage);

module.exports = router;