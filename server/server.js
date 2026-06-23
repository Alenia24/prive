import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
config();

const app = express();

const PORT = process.env.PORT || 5000;

// Import the database
connectDB();

// Import routers
import authRouter from "./routes/auth-routes.js";
import productRouter from "./routes/product-routes.js";

// Enable to use req.body when forms are submitted
app.use(express.urlencoded({ extended: true }));
// Enable to use req.body without a form, eg. from reqbin, postman, etc
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Prive API.");
});

// Enable routes
app.use("/auth", authRouter);
app.use("/products", productRouter);

//Error Handling Middleware
app.use((req, res) => {
  res.status(404).send("Resource Not found.");
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
