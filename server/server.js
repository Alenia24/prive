import express from "express";
import { config } from "dotenv";
config();

const app = express();

const PORT = process.env.PORT || 5000;

// Enable to use req.body when forms are submitted
app.use(express.urlencoded({ extended: true }));
// Enable to use req.body without a form, eg. from reqbin, postman, etc
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Prive API.");
});

//Error Handling Middleware
app.use((req, res) => {
  res.status(404).send("Resource Not found.");
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
