const { Command } = require('commander');
const https = require('https');
const { URL: NodeURL } = require('url');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new NodeURL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        const redirectUrl = loc.startsWith('http') ? loc : `${parsedUrl.protocol}//${parsedUrl.hostname}${loc}`;
        return fetchUrl(redirectUrl).then(resolve, reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function getPriceApiToken(code) {
  const url = `https://www.hktvmall.com/hktv/zh/main/p/${encodeURIComponent(code)}`;
  const html = await fetchUrl(url);
  const match = html.match(/var\s+priceApiToken\s*=\s*'([^']+)'/);
  if (!match) {
    throw new Error('找不到 priceApiToken，產品可能不存在');
  }
  return match[1];
}

async function fetchPriceChart(code, token) {
  const url = `https://pricechart-api.hktvmall.com/ajax/sku/priceChart?skuCode=${encodeURIComponent(code)}&lang=ZH&userMembershipLevel=NORMAL&s=${encodeURIComponent(token)}`;
  const raw = await fetchUrl(url);
  const json = JSON.parse(raw);
  if (json.message !== 'Success') {
    throw new Error(json.message || 'API 請求失敗');
  }
  return json.data || [];
}

function analyzePriceData(data) {
  if (data.length === 0) return null;

  let min = Infinity, max = -Infinity;
  let minDate = '', maxDate = '';

  for (const entry of data) {
    if (entry.price < min) { min = entry.price; minDate = entry.time; }
    if (entry.price > max) { max = entry.price; maxDate = entry.time; }
  }

  const current = data[data.length - 1].price;
  const lowest = min;
  const highest = max;
  const avg = data.reduce((s, e) => s + e.price, 0) / data.length;

  return { current, lowest, minDate, highest, maxDate, avg, count: data.length };
}

const program = new Command('price').description('價格相關查詢');

program
  .command('get <code>')
  .description('查詢商品歷史價格')
  .option('-j, --json', '輸出 JSON')
  .action(async (code, options) => {
    try {
      console.log(`正在查詢商品: ${code}`);
      console.log('正在獲取價格令牌...');
      const token = await getPriceApiToken(code);
      console.log('正在查詢歷史價格...');
      const data = await fetchPriceChart(code, token);

      if (options.json) {
        console.log(JSON.stringify({ code, count: data.length, data }, null, 2));
        return;
      }

      if (data.length === 0) {
        console.log('此商品暫無歷史價格數據');
        return;
      }

      const stats = analyzePriceData(data);
      console.log(`\n商品: ${code}`);
      console.log(`數據點: ${stats.count} 個`);
      console.log(`\n  現價:     HK$${stats.current.toFixed(2)}`);
      console.log(`  最低價:   HK$${stats.lowest.toFixed(2)} (${stats.minDate.substring(0, 10)})`);
      console.log(`  最高價:   HK$${stats.highest.toFixed(2)}`);
      console.log(`  平均價:   HK$${stats.avg.toFixed(2)}`);

      if (stats.current > stats.lowest) {
        const diff = stats.current - stats.lowest;
        const pct = (diff / stats.lowest * 100).toFixed(1);
        console.log(`\n  目前比最低價高 HK$${diff.toFixed(2)} (+${pct}%)`);
      } else if (stats.current === stats.lowest) {
        console.log(`\n  目前為歷史最低價!`);
      }

      // Show recent price changes
      const changes = [];
      for (let i = 1; i < data.length; i++) {
        if (data[i].price !== data[i - 1].price) {
          changes.push({
            date: data[i].time.substring(0, 10),
            from: data[i - 1].price,
            to: data[i].price
          });
        }
      }

      if (changes.length > 0) {
        console.log(`\n最近價格變動:`);
        const recent = changes.slice(-10);
        for (const c of recent) {
          const arrow = c.to > c.from ? '↑' : '↓';
          console.log(`  ${c.date}  HK$${c.from.toFixed(2)} ${arrow} HK$${c.to.toFixed(2)}`);
        }
      }
    } catch (err) {
      console.error('查詢失敗:', err.message || err);
      process.exit(1);
    }
  });

module.exports = program;
