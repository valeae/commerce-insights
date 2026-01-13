import 'dotenv/config';

interface Config {
  mongoUri: string;
  mongoUser?: string;
  mongoPassword?: string;
  environment: string;
}

const config: Config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/commerce_db',
  mongoUser: process.env.MONGO_USER,
  mongoPassword: process.env.MONGO_PASSWORD,
  environment: process.env.NODE_ENV || 'development'
};

export default config;
