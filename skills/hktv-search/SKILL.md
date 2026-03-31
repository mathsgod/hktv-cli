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

Each search result contains:

- **Title**: Product name (Chinese or English)
- **Code**: Product code (商品編號) — **required for `price get` command**
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

### Example Output

```
$ hktv search 牛奶

Found 60 results:

1. Meiji 牛乳
   Code: A1234567
   Price: HK$29.9
   Link: https://www.hktvmall.com/...

2. Kowloon Dairy 全脂鮮奶
   Code: B9876543
   Price: HK$25.5
   Link: https://www.hktvmall.com/...
```

## Price

Query historical price data for a specific product.

**Important:** The `<code>` parameter must be obtained from `hktv search` results. Each search result displays a `Code` field — use that value here.

```bash
hktv price get <code> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Output Information

- **Current price**: Latest recorded price in HKD
- **Lowest price**: Historical minimum with date
- **Highest price**: Historical maximum
- **Average price**: Mean price over time
- **Recent changes**: Last 10 price fluctuations with date and direction (↑/↓)

### Examples

```bash
# Get price history for a product (code from search results)
hktv price get A1234567

# Output as JSON
hktv price get A1234567 -j
```

## Agent Workflow

When a user asks about product prices, follow this workflow:

### Step 1: Search for the product

```bash
hktv search <user_query>
```

### Step 2: Extract the product code

From the search output, identify the `Code` field for the target product.

### Step 3: Get price history

```bash
hktv price get <code_from_step_2>
```

### Complete Example

**User request:** "我想知道 Meiji 牛乳 的歷史價格"

```bash
# Step 1: Search
$ hktv search Meiji 牛乳

Found 60 results:

1. Meiji 牛乳
   Code: A1234567        <-- Extract this code
   Price: HK$29.9
   Link: https://www.hktvmall.com/...

# Step 2: Get price history using the code
$ hktv price get A1234567

商品: A1234567
數據點: 150 個

  現價:     HK$29.90
  最低價:   HK$24.90 (2025-12-01)
  最高價:   HK$35.90
  平均價:   HK$28.50

  目前比最低價高 HK$5.00 (+20.1%)

最近價格變動:
  2026-01-15  HK$27.90 ↑ HK$29.90
  2025-12-20  HK$24.90 ↑ HK$27.90
```

### JSON Automation

For scripting or AI agent integration, use JSON output to extract codes programmatically:

```bash
# Get all product codes from search results
hktv search 牛奶 -j | jq '.results[].code'

# Get first product code
hktv search 牛奶 -j | jq -r '.results[0].code'
```

## Technical Details

- Search uses HKTVmall's Algolia search API
- Price data is fetched from `pricechart-api.hktvmall.com`
- All prices are in Hong Kong Dollars (HKD)
- Product codes are unique identifiers for each product on HKTVmall
- Codes can be found in search results (`Code` field) or product page URLs