import { GameApiService } from "../game-api.service";
import { ApiClientService } from "../api-client.service";
import { makeGame } from "../../tests/fixtures/make-game";

const mockGame = makeGame();

describe("GameApiService", () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as ApiClientService;

  const service = new GameApiService(client);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createGame posts to /games", async () => {
    vi.mocked(client.post).mockResolvedValue(mockGame);
    const dto = { username: "test", cardCount: 4, countdownSeconds: 60 };

    const result = await service.createGame(dto);

    expect(client.post).toHaveBeenCalledWith("/games", dto);
    expect(result).toBe(mockGame);
  });

  it("getGame fetches /games/:id", async () => {
    vi.mocked(client.get).mockResolvedValue(mockGame);

    const result = await service.getGame("g1");

    expect(client.get).toHaveBeenCalledWith("/games/g1");
    expect(result).toBe(mockGame);
  });

  it("flipCard posts to /games/:id/flip", async () => {
    vi.mocked(client.post).mockResolvedValue(mockGame);

    const result = await service.flipCard("g1", { cardId: "c1" });

    expect(client.post).toHaveBeenCalledWith("/games/g1/flip", { cardId: "c1" });
    expect(result).toBe(mockGame);
  });

  it("restartGame posts to /games/:id/restart", async () => {
    vi.mocked(client.post).mockResolvedValue(mockGame);

    const result = await service.restartGame("g1");

    expect(client.post).toHaveBeenCalledWith("/games/g1/restart");
    expect(result).toBe(mockGame);
  });
});
