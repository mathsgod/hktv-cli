---
name: hktv-search
description: "HKTVmall Search: Search products and check prices on HKTVmall."
metadata:
  version: 1.0.0
  openclaw:
    category: "shopping"
    requires:
      bins:
        - hktv
    cliHelp: "hktv --help"
---

# hktv search

> **PREREQUISITE:** Install the CLI globally with `npm install -g .` in the project root.

```bash
hktv <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `search <query>` | Search products on HKTVmall |
| `price get <code>` | Get historical price data for a product |

## Search

Search for products on HKTVmall using Algolia search API.

```bash
hktv search <query> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --page <page>` | Page number (default: `1`) |
| `-n, --hits <number>` | Results per page (default: `60`) |
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Output Fields

- **Title**: Product name (Chinese or English)
- **Code**: Product code (for price lookup)
- **Price**: Current selling price in HKD
- **Link**: Direct URL to product page

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

Query historical price data for a specific product.

```bash
hktv price get <code> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Output Information

- **Current price**: Latest recorded price
- **Lowest price**: Historical minimum with date
- **Highest price**: Historical maximum
- **Average price**: Mean price over time
- **Recent changes**: Last 10 price fluctuations

### Examples

```bash
# Get price history for a product
hktv price get A1234567

# Output as JSON
hktv price get A1234567 -j
```

## Workflow Example

1. Search for a product:
   ```bash
   hktv search 咖啡
   ```

2. Note the product code from results (e.g., `B9876543`)

3. Check price history:
   ```bash
   hktv price get B9876543
   ```

4. Use JSON output for automation:
   ```bash
   hktv search 牛奶 -j | jq '.results[].code'
   ```

## Technical Details

- Search uses HKTVmall's Algolia search API
- Price data is fetched from `pricechart-api.hktvmall.com`
- All prices are in Hong Kong Dollars (HKD)
- Product codes can be found in search results or product URLs