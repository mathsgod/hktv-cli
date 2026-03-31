# hktv

A command-line tool for searching products and checking prices on [HKTVmall](https://www.hktvmall.com).

## Installation

```bash
npm install -g .
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
| `search <query>` | Search products |
| `price get <code>` | Get product price history |

## Search

Search for products on HKTVmall.

```bash
hktv search <query>
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --page <page>` | Page number (default: `1`) |
| `-j, --json` | Output as JSON |
| `-h, --help` | Display help information |

### Examples

```bash
# Basic search
hktv search 牛奶

# Search page 2
hktv search 牛奶 -p 2

# Output as JSON
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

## License

ISC
