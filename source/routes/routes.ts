import express from 'express';
import controller from '../controllers/controllers';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);
router.post('/products/optimized-positions', controller.getOptimizedProductsPositions); 

export = router;
