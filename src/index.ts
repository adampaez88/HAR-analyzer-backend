import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes";
import { config } from "./config";

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(cors());


// ✅ Health route
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// mount routes
app.use("/", uploadRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});