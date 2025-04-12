import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
app.use(express.json());

app.listen(3001, () => {
    console.log("server ON.");
})