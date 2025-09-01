import express from "express";
import path from "path";

// Import routes
import generateRoutes from "./routes/generate.js";

const app = express();
app.use(express.json());

// Serve static files dari folder temp
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

// Route untuk generate image
app.use('/generate', generateRoutes);

app.listen(3001, () =>
  console.log("Automation server on http://localhost:3001")
);
