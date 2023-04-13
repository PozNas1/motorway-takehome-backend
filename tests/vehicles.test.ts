import request from "supertest";
import { app } from "../src/app";

describe("GET /vehicles/:id/:timestamp", () => {
  it("Should return all fields from vehicles, stateLogs tables for the given id and timestamp", async () => {
    const id = 3;
    const timestamp = "2022-09-12 10:00:00+00";
    const response = await request(app).get(`/vehicle/${id}/${timestamp}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 3,
      state: "selling",
      make: "VW",
      model: "GOLF",
      timestamp: "2022-09-11T23:21:38.000Z",
    });
  });

  it("Should cache the response for subsequent requests", async () => {
    const id = 2;
    const timestamp = "2022-09-11 10:00:00+00";

    const response1 = await request(app).get(`/vehicle/${id}/${timestamp}`);
    expect(response1.status).toBe(200);
    expect(response1.body).toEqual({
      id: 2,
      state: "quoted",
      model: "A4",
      make: "AUDI",
      timestamp: "2022-09-10T14:59:01.000Z",
    });

    // Hit the endpoint again with the same parameters after a short delay
    // The response should be cached, so the server should not be hit again

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response2 = await request(app).get(`/vehicle/${id}/${timestamp}`);
    expect(response2.status).toBe(200);
    expect(response2.body).toEqual({
      id: 2,
      state: "quoted",
      model: "A4",
      make: "AUDI",
      timestamp: "2022-09-10T14:59:01.000Z",
    });

    // Hit the endpoint with different parameters
    // The response should not be cached, so the server should be hit again

    const id2 = 1;
    const timestamp2 = "2022-09-11 10:00:00+00";

    const response3 = await request(app).get(`/vehicle/${id2}/${timestamp2}`);
    expect(response3.status).toBe(200);
    expect(response3.body).toEqual({
      id: 1,
      state: "quoted",
      model: "X1",
      make: "BMW",
      timestamp: "2022-09-10T10:23:54.000Z",
    });
  });
});
