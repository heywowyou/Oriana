import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Oriana backend is online");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
