import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from port 3000");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
