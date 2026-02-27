import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3007;

app.use(
    cors({
        origin: 'http://localhost:4200',
        methods: 'GET,POST,PUT',
        allowedHeaders: 'Content-Type',
    }),
);

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
