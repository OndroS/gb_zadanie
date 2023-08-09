import { NextFunction, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import config from '../config/config';

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

const isAxiosError = (error: unknown): error is AxiosError => {
    return (error as AxiosError).isAxiosError === true;
};

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: 'pong'
    });
};

const getProductPositions = async (req: Request, res: Response, next: NextFunction) => {
    const product = req.params.product;

    try {
        const response = await axios.get(`https://dev.aux.boxpi.com/case-study/products/${product}/positions`, {
            headers: {
                'x-api-key': config.server.api_key
            }
        });

        return res.status(200).json(response.data);
    } catch (error: unknown) {
        if (isAxiosError(error)) {
            return res.status(error.response?.status || 500).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'An unexpected error occurred'
        });
    }
};

const getMultipleProductsPositions = async (req: Request, res: Response, next: NextFunction) => {
    const products: string[] = req.body.products;

    const promises = products.map((product) => {
        return axios
            .get(`https://dev.aux.boxpi.com/case-study/products/${product}/positions`, {
                headers: {
                    'x-api-key': config.server.api_key
                }
            })
            .then((response) => response.data)
            .catch((error) => {
                if (isAxiosError(error)) {
                    return { error: error.message, status: error.response?.status };
                }
                return { error: 'An unexpected error occurred', status: 500 };
            });
    });

    Promise.all(promises).then((results) => {
        res.status(200).json(results);
    });
};

const getOptimizedProductsPositions = async (req: Request, res: Response, next: NextFunction) => {
    const products: string[] = req.body.products;
    const workerCoordinates: Coordinates = req.body.coordinates;

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
    let distance = 0;
    const pickingOrder = [];
    let currentCoordinates = workerCoordinates;

    // Flatten the productPositions array to a single array of products
    const products = productPositions.flat();

    // Continue picking products until none are left
    while (products.length > 0) {
        // Find the closest product to the current position
        const closestProduct = products.reduce((closest, current) => {
            const currentDistance = calculateDistance(currentCoordinates, current); 
            const closestDistance = calculateDistance(currentCoordinates, closest);
            return currentDistance < closestDistance ? current : closest;
          });

        // Add the closest product to the picking order
        pickingOrder.push({
            productId: closestProduct.productId,
            positionId: closestProduct.positionId
        });

        // Increment the total distance
        distance += calculateDistance(currentCoordinates, closestProduct);

        // Update the current coordinates
        currentCoordinates = closestProduct;

        // Remove the closest product from the products array
        const index = products.indexOf(closestProduct);
        products.splice(index, 1);
    }

    return {
        pickingOrder,
        distance
    };
}

// Helper function to calculate Euclidean distance in 3D space
function calculateDistance(a: Coordinates, b: Coordinates): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export default {
    serverHealthCheck,
    getProductPositions,
    getMultipleProductsPositions,
    getOptimizedProductsPositions
};
