# percolator-devnet-mm

Market-making and keeper bots for Percolator **devnet**. They keep a devnet deployment active: one bot cranks markets and pushes oracle prices, one posts two-sided quotes, and a few simulated traders trade against them. Devnet only, test funds only.

## Bots

| Mode (`BOT_MODE`) | What runs |
|---|---|
| `filler` | Cranks all discovered markets (funding, liquidations, settlement) and pushes prices for admin-oracle markets (Binance, CoinGecko fallback). |
| `maker` | Posts bid/ask quotes around the oracle price with a configurable spread, position skew and size jitter. |
| `trader` | Simulated traders (aggressive, passive, trend-following) that place small trades. |
| `both` (default) | filler + maker |
| `all` | filler + maker + traders |

A health/metrics server also runs: `GET /health` (JSON) and `GET /metrics` (Prometheus text) on `HEALTH_PORT` (default 18820).

## Run

Requires Node 20+ and pnpm or npm.

```bash
pnpm install
pnpm test          # vitest
pnpm dry           # DRY_RUN=true, sends no transactions
```

Generate wallets and fund them (devnet airdrop for SOL; minting test USDC needs the mint authority key for your devnet test mint, supplied via `MINT_AUTHORITY_KEYPAIR_JSON` or a local file, never committed):

```bash
pnpm keygen        # writes keypairs to /tmp/percolator-bots/
pnpm fund          # mints test USDC to the bot wallets
```

Start the bots (see `src/config.ts` for every variable):

```bash
PROGRAM_ID=<wrapper program id> \
MATCHER_PROGRAM_ID=<matcher program id> \
TEST_USDC_MINT=<devnet test collateral mint> \
FILLER_KEYPAIR=/tmp/percolator-bots/filler.json \
MAKER_KEYPAIR=/tmp/percolator-bots/maker.json \
BOT_MODE=both \
pnpm start
```

Set `PROGRAM_ID`, `MATCHER_PROGRAM_ID` and `TEST_USDC_MINT` explicitly. The defaults compiled into `src/config.ts`, `src/keygen.ts` and `src/fund-devnet-bots.ts` point at older devnet deployments. Use the IDs of the devnet deployment you are targeting.

For `BOT_MODE=all`, provide trader keys as `TRADER_KEYPAIR_JSON_0`, `TRADER_KEYPAIR_JSON_1`, ... (JSON secret-key arrays); missing ones are generated at start.

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `BOT_MODE` | `both` | `filler`, `maker`, `trader`, `both`, `all` |
| `RPC_URL` | devnet RPC | Or set `HELIUS_API_KEY` / `HELIUS_DEVNET_API_KEY` to build a Helius devnet URL |
| `PROGRAM_ID`, `MATCHER_PROGRAM_ID` | see above | Set explicitly |
| `DRY_RUN` | `false` | No transactions sent |
| `HEALTH_PORT`, `HEALTH_HOST` | `18820`, `127.0.0.1` | |
| `FILLER_KEYPAIR`, `MAKER_KEYPAIR`, `BOOTSTRAP_KEYPAIR` | `/tmp/percolator-bots/*.json` | Per-role keypair paths; `BOOTSTRAP_KEYPAIR` is a shared fallback |
| `CRANK_INTERVAL_MS`, `CRANK_BATCH_SIZE`, `MAX_CRANK_STALENESS` | `5000`, `3`, `200` | Filler |
| `PUSH_ORACLE` | `true` | Push prices for admin-oracle markets |
| `SPREAD_BPS`, `SPREAD_NOISE_BPS`, `SKEW_MAX_MULTIPLIER` | `25`, `4`, `3.0` | Maker pricing |
| `MAX_QUOTE_SIZE_USDC`, `MAX_POSITION_PCT`, `QUOTE_INTERVAL_MS`, `SIZE_JITTER`, `INITIAL_COLLATERAL` | `500`, `10`, `5000`, `0.25`, `10000000000` | Maker sizing (collateral in 6-decimal units) |
| `MARKETS_FILTER` | all | Comma-separated symbols, e.g. `SOL,BTC` |

Keep `MINT_AUTHORITY_KEYPAIR_JSON` out of any long-running deployment; it is only needed for the one-off funding step.

## Docker

The `Dockerfile` was written for a monorepo layout (it copies `packages/core/` and `bots/devnet-mm/`) and does not build from this repository root as-is. Adjust the `COPY` paths before using it.

## Layout

- `src/` bot code: `index.ts` (entry), `filler.ts`, `maker.ts`, `trader-fleet.ts`, `market.ts`, `prices.ts`, `health.ts`, `config.ts`
- `tests/` vitest unit tests
- `fund-mm-wallets.mjs`, `setup-trader-keypairs.mjs` one-off helper scripts

Uses [`@percolator/sdk`](https://github.com/dcccrypto/percolator-sdk). Structure is loosely modelled on Drift's [keeper-bots-v2](https://github.com/drift-labs/keeper-bots-v2).
