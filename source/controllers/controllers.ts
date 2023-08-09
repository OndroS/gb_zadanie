import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import config from '../config/config';
import helper from '../utils/helpers';

interface Position {
    positionId: string;
    x: number;
    y: number;
    z: number;
    productId: string;
    quantity: number;
}

interface Coordinates {
    x: number;
    y: number;
    z: number;
}

interface OptimizationResult {
    pickingOrder: {
        productId: string;
        positionId: string;
    }[];
    distance: number;
}

interface OptimizationResult {
    pickingOrder: {
        productId: string;
        positionId: string;
    }[];
    distance: number;
}

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: 'pong'
    });
};

const getOptimizedProductsPositions = async (req: Request, res: Response, next: NextFunction) => {
    const products: string[] = req.body.products;
    const workerCoordinates: Coordinates = req.body.workerStartingCoordinates;

    const productPositions = await fetchProductPositions(products);

    const result = optimizePickingOrder(productPositions, workerCoordinates);

    res.status(200).json(result);
};

async function fetchProductPositions(products: string[]): Promise<Position[]> {
    // Use Promise.all to fetch all the positions for all products simultaneously
    const requests = products.map((productId) => {
        const url = `https://dev.aux.boxpi.com/case-study/products/${productId}/positions`;
        return axios.get(url, {
            headers: { 'x-api-key': config.server.api_key }
        });
    });

    // Await all requests to complete
    const responses = await Promise.all(requests);

    // Extract the data from the responses
    return responses.map((response) => response.data);
}

function optimizePickingOrder(productPositions: Position[], workerCoordinates: Coordinates): OptimizationResult {
    // console.time('Execution Time');
    let distance = 0;
    const pickingOrder = [];
    let currentCoordinates = workerCoordinates;

    // Flatten the productPositions array to a single array of products
    const products = productPositions.flat();

    // Continue picking products until none are left
    while (products.length > 0) {
        // Find the closest product to the current position
        const closestProduct = products.reduce((closest, current) => {
            const currentDistance = helper.calculateDistance(currentCoordinates, current);
            const closestDistance = helper.calculateDistance(currentCoordinates, closest);
            return currentDistance < closestDistance ? current : closest;
          });

        // Add the closest product to the picking order
        pickingOrder.push({
            productId: closestProduct.productId,
            positionId: closestProduct.positionId,
            // x: closestProduct.x,
            // y: closestProduct.y,
            // z: closestProduct.z
        });

        // Increment the total distance
        distance += helper.calculateDistance(currentCoordinates, closestProduct);

        // Update the current coordinates
        currentCoordinates = closestProduct;

        // Remove the closest product from the products array
        const index = products.indexOf(closestProduct);
        products.splice(index, 1);
    }
    // console.timeEnd('Execution Time');
    return {
        pickingOrder,
        distance
    };
}

export default {
    serverHealthCheck,
    getOptimizedProductsPositions
};
