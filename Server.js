import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import logger from 'morgan';
import errorHandler from './middleware/errorHandler.js';

import taskRoutes from './routers/taskRoutes.js';
import userRoutes from './routers/userRoutes.js';
import verifyJWT from './middleware/veriryJWT.js';

dotenv.config();

const app = express();

app.use(logger('div'));
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.status(200).send({message:'Welcome to the Server'});
});

app.use(express.static('uploads'));
app.use('/', userRoutes);
app.use('/', verifyJWT);
app.use('/', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_HOST, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => console.log('Connected to MongoDB')).catch(error => {
    console.log('Error connecting to MongoDB', error);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});