const app = require("./app.js");

const port = process.env.PORT || 8000;

console.log(port)

app.listen(port, () => {
  console.log(
    "server running at http://127.0.0.1/:%d",
    port
  );
  console.log(" Press CTRL-C to stop\n")
});
