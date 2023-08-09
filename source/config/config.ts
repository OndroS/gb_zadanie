import dotenv from 'dotenv';

dotenv.config();

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const API_KEY = process.env.API_KEY 

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    api_key: API_KEY
};

const config = {
    server: SERVER
};

export default config;
