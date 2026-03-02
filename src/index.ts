import express from "express";
import cors from "cors";
import { pool } from "./database";

const app = express();

app.use(cors());
app.use(express.json());

interface TesttableRow {
  test: number;
  field2: boolean;
}

app.listen(process.env.PORT || 5000, async () => {
  try {
    const result = await pool.query<TesttableRow>(
      "SELECT * FROM testtable"
    );

    const row = result.rows[0];

    console.log("Database Connection Test:", row.field2); //should return field2's value which is 'true'

    console.log(
      `kanbangpt listening at http://localhost:${process.env.PORT || 5000}`
    );
  } catch (err) {
    console.error(err);
  }
});