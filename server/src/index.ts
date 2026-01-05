import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const allowedOrigins = ['http://localhost:3000'];

app.use(
   cors({
      origin: allowedOrigins,
      credentials: true,
   }),
);

app.use(express.json());

app.get('/', (req, res) => {
   const baseUrl = `${req.protocol}://${req.get('host')}`;

   res.status(200).json({
      message: 'Welcome to the Tratics API',
      docs: `${baseUrl}/docs`,
   });
});

app.get('/docs', (req, res) => {
   const baseUrl = `${req.protocol}://${req.get('host')}`;

   res.status(200).json({
     message: "Hello World"
   });
});


const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
