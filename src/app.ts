import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import NodeCache from "node-cache";

interface VehicleDetails {
  id: number;
  make: string;
  model: string;
  state: string;
  timestamp: string;
}

dotenv.config();

//Express
const app = express();
const port = process.env.PORT || 3000;

//Cache, where all keys will expire after 1 min
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

//DB
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
});

const connectToDB = async () => {
  try {
    await pool.connect();
    console.log("DB connected");
  } catch (err) {
    console.log(err);
  }
};
connectToDB();

app.get("/vehicle/:id/:timestamp", async (req, res) => {
  const { id, timestamp } = req.params;
  const cacheKey = `vehicle-${id}-${timestamp}`;
  const query = {
    text: `SELECT V."id", V."make", V."model", S."state", S."timestamp"
    FROM "vehicles" V
    INNER JOIN "stateLogs" S ON V."id" = S."vehicleId"
    WHERE V."id" = $1
        AND S."timestamp" = (SELECT MAX(S."timestamp") 
                                FROM "vehicles" V, "stateLogs" S
                                WHERE V."id" = S."vehicleId" 
                                    AND V."id" = $1 
                                    AND S."timestamp" <= $2)
    `,
    values: [id, timestamp],
  };

  // if the data is not in the cache, then we get it from the database and add it to the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    res.json(cachedData);
    console.log(`data received from cache`);
  } else {
    pool
      .query(query)
      .then((db_res) => {
        if (db_res.rows.length > 0) {
          const data: VehicleDetails = {
            id: db_res.rows[0].id,
            state: db_res.rows[0].state,
            make: db_res.rows[0].make,
            model: db_res.rows[0].model,
            timestamp: db_res.rows[0].timestamp,
          };
          cache.set(cacheKey, data, 60);
          res.status(200).json(data);
        } else {
          res.status(404).json({
            error:
              "Vehicle not found or no state logs available for the given id and timestamp",
          });
        }
      })
      .catch((err) =>
        setImmediate(() => {
          throw err;
        })
      );
  }
});

//Main page
app.get("/", (req, res) => {
  res.send("Hello MotorWay's collegues");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

export { app };
