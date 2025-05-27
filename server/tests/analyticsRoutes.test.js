// Set up test environment variables
process.env.JWT_SECRET = "test_jwt_secret";

const request = require("supertest");
const express = require("express");
const analyticsRoutes = require("../routes/analyticsRoutes");

// Set global timeout for all tests
jest.setTimeout(30000);

// Mock the database pool
jest.mock("../config/db", () => ({
  query: jest.fn().mockImplementation((query, params = []) => {
    // Return different mock data based on query patterns
    if (query.includes("revenue")) {
      return Promise.resolve({ rows: [{ totalRevenue: 5000 }] });
    }
    if (query.includes("enrollment")) {
      return Promise.resolve({ rows: [{ totalEnrollments: 100 }] });
    }
    // Default response
    return Promise.resolve({
      rows: [
        {
          totalRevenue: 5000,
          totalEnrollments: 100,
          activeClasses: 5,
          totalUsers: 50,
        },
      ],
    });
  }),
}));

// Mock the analytics controller with synchronous mocks
jest.mock("../controllers/analyticsController", () => {
  const mockData = {
    dashboardSummary: {
      totalRevenue: 5000,
      totalEnrollments: 100,
      activeClasses: 5,
      totalUsers: 50,
    },
    revenueAnalytics: {
      totalRevenue: 5000,
      revenueByMonth: {
        "2024-01": 1000,
        "2024-02": 2000,
        "2024-03": 2000,
      },
    },
    revenueByClass: {
      "Class A": 2000,
      "Class B": 3000,
    },
    enrollmentTrends: {
      monthlyEnrollments: {
        "2024-01": 10,
        "2024-02": 15,
        "2024-03": 20,
      },
      totalEnrollments: 45,
    },
    classEnrollmentStats: {
      "Class A": { enrolled: 15, capacity: 20 },
      "Class B": { enrolled: 10, capacity: 15 },
    },
    userEngagementMetrics: {
      activeUsers: 30,
      averageSessionDuration: 45,
      mostActiveHours: {
        "9:00": 10,
        "10:00": 15,
        "11:00": 12,
      },
    },
    userActivityTrends: {
      dailyActiveUsers: {
        "2024-03-01": 25,
        "2024-03-02": 30,
        "2024-03-03": 28,
      },
      averageDailyActiveUsers: 27.7,
    },
  };

  return {
    getDashboardSummary: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.dashboardSummary)),
    getRevenueAnalytics: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.revenueAnalytics)),
    getRevenueByClass: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.revenueByClass)),
    getEnrollmentTrends: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.enrollmentTrends)),
    getClassEnrollmentStats: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.classEnrollmentStats)),
    getUserEngagementMetrics: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(mockData.userEngagementMetrics)
      ),
    getUserActivityTrends: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockData.userActivityTrends)),
  };
});

// Mock the authentication middleware
jest.mock("../middleware/authMiddleware", () => ({
  requireAuth: jest.fn().mockImplementation((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (token === "admin-token") {
      req.user = { id: 1, role: "admin" };
    } else if (token === "user-token") {
      req.user = { id: 2, role: "student" };
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
    next();
  }),
  requireAdmin: jest.fn().mockImplementation((req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Admin access required" });
    }
  }),
}));

describe("Analytics Routes", () => {
  const adminToken = "admin-token";
  const userToken = "user-token";
  let app;

  // Test date range
  const startDate = "2024-01-01";
  const endDate = "2024-03-31";

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin/analytics", analyticsRoutes);
    jest.clearAllMocks();
  });

  // Use supertest(app) directly without creating a server
  const makeRequest = (method, path, token = adminToken, query = {}) => {
    return request(app)
      [method.toLowerCase()]("/api/admin/analytics" + path)
      .query(query)
      .set("Authorization", `Bearer ${token}`)
      .timeout(10000); // Increase timeout to 10 seconds
  };

  describe("GET /api/admin/analytics/summary", () => {
    it("should get dashboard summary when admin", async () => {
      const res = await makeRequest("get", "/summary");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalRevenue: 5000,
        totalEnrollments: 100,
        activeClasses: 5,
        totalUsers: 50,
      });
    }, 15000); // Increased timeout to 15 seconds

    it("should fail when non-admin tries to access", async () => {
      const res = await makeRequest("get", "/summary", userToken);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Admin access required");
    }, 15000);
  });

  describe("GET /api/admin/analytics/revenue", () => {
    it("should get revenue analytics when admin with valid dates", async () => {
      const res = await makeRequest("get", "/revenue", adminToken, {
        startDate,
        endDate,
        groupBy: "month",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalRevenue: 5000,
        revenueByMonth: {
          "2024-01": 1000,
          "2024-02": 2000,
          "2024-03": 2000,
        },
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/revenue");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);

    it("should fail with invalid date format", async () => {
      const res = await makeRequest("get", "/revenue", adminToken, {
        startDate: "not-a-date",
        endDate: "2024-03-31",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    }, 15000);

    it("should fail when startDate is after endDate", async () => {
      const res = await makeRequest("get", "/revenue", adminToken, {
        startDate: "2024-04-01",
        endDate: "2024-03-31",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    }, 15000);

    it("should fail when authorization header is missing", async () => {
      const res = await request(app)
        .get("/api/admin/analytics/revenue")
        .query({ startDate, endDate, groupBy: "month" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Authentication required");
    }, 15000);
  });

  describe("GET /api/admin/analytics/revenue/classes", () => {
    it("should get revenue by class when admin with valid dates", async () => {
      const res = await makeRequest("get", "/revenue/classes", adminToken, {
        startDate,
        endDate,
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        "Class A": 2000,
        "Class B": 3000,
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/revenue/classes");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);
  });

  describe("GET /api/admin/analytics/enrollments/trends", () => {
    it("should get enrollment trends when admin with valid dates", async () => {
      const res = await makeRequest("get", "/enrollments/trends", adminToken, {
        startDate,
        endDate,
        groupBy: "month",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        monthlyEnrollments: {
          "2024-01": 10,
          "2024-02": 15,
          "2024-03": 20,
        },
        totalEnrollments: 45,
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/enrollments/trends");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);
  });

  describe("GET /api/admin/analytics/enrollments/classes", () => {
    it("should get class enrollment stats when admin with valid dates", async () => {
      const res = await makeRequest("get", "/enrollments/classes", adminToken, {
        startDate,
        endDate,
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        "Class A": { enrolled: 15, capacity: 20 },
        "Class B": { enrolled: 10, capacity: 15 },
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/enrollments/classes");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);
  });

  describe("GET /api/admin/analytics/users/engagement", () => {
    it("should get user engagement metrics when admin with valid dates", async () => {
      const res = await makeRequest("get", "/users/engagement", adminToken, {
        startDate,
        endDate,
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        activeUsers: 30,
        averageSessionDuration: 45,
        mostActiveHours: {
          "9:00": 10,
          "10:00": 15,
          "11:00": 12,
        },
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/users/engagement");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);
  });

  describe("GET /api/admin/analytics/users/activity", () => {
    it("should get user activity trends when admin with valid dates", async () => {
      const res = await makeRequest("get", "/users/activity", adminToken, {
        startDate,
        endDate,
        groupBy: "day",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        dailyActiveUsers: {
          "2024-03-01": 25,
          "2024-03-02": 30,
          "2024-03-03": 28,
        },
        averageDailyActiveUsers: 27.7,
      });
    }, 15000);

    it("should fail when dates are missing", async () => {
      const res = await makeRequest("get", "/users/activity");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Start date and end date are required"
      );
    }, 15000);
  });
});
