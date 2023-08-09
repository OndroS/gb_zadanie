import { NextFunction, Request, Response } from 'express';
import axios, {AxiosError} from 'axios';
import config from '../config/config';

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

    const promises = products.map(product => {
        return axios.get(`https://dev.aux.boxpi.com/case-study/products/${product}/positions`, {
            headers: {
                'x-api-key': config.server.api_key
            }
        }).then(response => response.data)
          .catch(error => {
            if (isAxiosError(error)) {
                return { error: error.message, status: error.response?.status };
            }
            return { error: 'An unexpected error occurred', status: 500 };
        });
    });

    Promise.all(promises).then(results => {
        res.status(200).json(results);
    });
};

export default { serverHealthCheck, getProductPositions, getMultipleProductsPositions };
