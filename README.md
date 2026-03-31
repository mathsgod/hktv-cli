# hktv-cli

**CLI for [HKTVmall](https://www.hktvmall.com) — built for humans and AI agents.**

A command-line tool for searching products and checking prices on HKTVmall, Hong Kong's leading e-commerce platform.

## Installation

```bash
npm install -g .
```

## AI Agent Skills

This repo ships Agent Skills (`SKILL.md` files) for every command — ready to use with GitHub Copilot, Cursor, and any MCP-compatible AI agent.

```bash
# Install all hktv skills at once
npx skills add https://github.com/mathsgod/hktv-cli

# Or pick only what you need
npx skills add https://github.com/mathsgod/hktv-cli/tree/main/skills/hktv-search
```

## Usage

```
hktv [options] [command]
```

### Options

| Option | Description |
|--------|-------------|
| `-V, --version` | Display version number |
| `-h, --help` | Display help information |

### Commands

| Command | Description |
|---------|-------------|
| `search <query>` | Search products on HKTVmall |
| `price get <code>` | Get product price history |

## Search

Search for products on HKTVmall using Algolia search API.

```bash
hktv search <query>
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --page <page>` | Page number (default: `1`) |
| `-n, --hits <number>` | Results per page (default: `60`) |
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Examples

```bash
# Basic search
hktv search 牛奶

# Search page 2 with 20 results per page
hktv search 牛奶 -p 2 -n 20

# Output as JSON for scripting
hktv search 牛奶 -j
```

## Price

Query historical price data for a product.

```bash
hktv price get <code>
```

### Options

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Examples

```bash
# Get price history
hktv price get A1234567

# Output as JSON
hktv price get A1234567 -j
```

### Output Fields

- **Current price**: Latest recorded price in HKD
- **Lowest price**: Historical minimum with date
- **Highest price**: Historical maximum
- **Average price**: Mean price over time
- **Recent changes**: Last 10 price fluctuations

## Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

## License

ISC
