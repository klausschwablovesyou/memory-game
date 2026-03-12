import { ApiClientService } from "../api-client.service";

const mockResponse = (body: unknown, ok = true, statusText = "OK") =>
  Promise.resolve({
    ok,
    statusText,
    json: () => Promise.resolve(body),
  } as Response);

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ApiClientService", () => {
  const client = new ApiClientService("http://test");

  describe("get", () => {
    it("calls fetch with GET and returns parsed JSON", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ id: 1 }));

      const result = await client.get<{ id: number }>("/items");

      expect(fetch).toHaveBeenCalledWith("http://test/items");
      expect(result).toEqual({ id: 1 });
    });
  });

  describe("post", () => {
    it("sends JSON body with correct headers", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ ok: true }));

      await client.post("/items", { name: "test" });

      expect(fetch).toHaveBeenCalledWith("http://test/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test" }),
      });
    });

    it("sends no body or headers when body is undefined", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ ok: true }));

      await client.post("/items");

      expect(fetch).toHaveBeenCalledWith("http://test/items", {
        method: "POST",
        headers: undefined,
        body: undefined,
      });
    });
  });

  describe("put", () => {
    it("sends PUT request with JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({ ok: true }));

      await client.put("/items/1", { name: "updated" });

      expect(fetch).toHaveBeenCalledWith("http://test/items/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "updated" }),
      });
    });
  });

  describe("delete", () => {
    it("sends DELETE request", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(mockResponse({}));

      await client.delete("/items/1");

      expect(fetch).toHaveBeenCalledWith("http://test/items/1", {
        method: "DELETE",
      });
    });
  });

  describe("error handling", () => {
    it("throws error with message from response body", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(
        mockResponse({ message: "Not found" }, false, "Not Found"),
      );

      await expect(client.get("/missing")).rejects.toThrow("Not found");
    });

    it("falls back to statusText when body has no message", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(
        mockResponse({}, false, "Internal Server Error"),
      );

      await expect(client.get("/fail")).rejects.toThrow("Internal Server Error");
    });

    it("falls back to statusText when body is not valid JSON", async () => {
      vi.spyOn(globalThis, "fetch").mockReturnValue(
        Promise.resolve({
          ok: false,
          statusText: "Bad Gateway",
          json: () => Promise.reject(new Error("parse error")),
        } as Response),
      );

      await expect(client.get("/fail")).rejects.toThrow("Bad Gateway");
    });
  });
});
