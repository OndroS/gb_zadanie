import express from 'express';
import controller from '../controllers/sample';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);
router.get('/products/:product/positions', controller.getProductPositions);
router.post('/products/positions', controller.getMultipleProductsPositions); 
router.post('/products/optimized-positions', controller.getOptimizedProductsPositions); 

export = router;
