const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

bcrypt.hash("admin123", 10, (_, hash) => {
  db.run(
    "INSERT INTO users (username, password) VALUES (?,?)",
    ["admin", hash],
    () => {
      console.log("User created");
      db.close();
    }
  );
});
