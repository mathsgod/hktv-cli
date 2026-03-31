#!/usr/bin/env node
const { Command } = require('commander');
const https = require('https');
const { URL: NodeURL } = require('url');

const URL = 'https://8rn1y79f02-dsn.algolia.net/1/indexes/*/queries';
const HEADERS = {
  'X-Algolia-API-Key': 'a4a336abc62ab842842a81de642b484a',
  'X-Algolia-Application-Id': '8RN1Y79F02',
  'Content-Type': 'application/json'
};

function buildParamsStr(q, page = 0, hitsPerPage = 60) {
  const params = {
    query: q,
    hitsPerPage: hitsPerPage,
    page: page,
    attributesToRetrieve: JSON.stringify(["*"]),
    facets: JSON.stringify(["categoryStructureLevel1Display"]),
    maxValuesPerFacet: 1000
  };
  const parts = [];
  for (const k of Object.keys(params)) {
    parts.push(`${k}=${encodeURIComponent(params[k])}`);
  }
  return parts.join('&');
}

async function fetchAlgolia(query, page, hitsPerPage = 60, retry = 3) {
  const paramsStr = buildParamsStr(query, page, hitsPerPage);
  const payload = JSON.stringify({ requests: [{ indexName: 'hktvProduct', params: paramsStr }] });

  return new Promise((resolve, reject) => {
    const parsedUrl = new NodeURL(URL);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: { ...HEADERS, 'Content-Length': Buffer.byteLength(payload) }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve((json.results && json.results[0] && json.results[0].hits) || []);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

const searchCmd = new Command('search')
  .description('搜索貨物')
  .argument('<query>')
  .option('-p, --page <page>', '指定頁面 (1-N)', '1')
  .option('-n, --hits <number>', '每頁顯示數量 (default: 60)', '60')
  .option('-j, --json', '輸出 JSON')
  .action(async (query, options) => {
    try {
      const page = parseInt(options.page, 10) || 1;
      const hitsPerPage = parseInt(options.hits, 10) || 60;
      const apiPage = page - 1; // 用戶輸入 1=N, API 用 0-indexed
      console.log(`Searching for: ${query} (page=${page}, hits=${hitsPerPage})`);
      const results = await fetchAlgolia(query, apiPage, hitsPerPage);

      if (options.json) {
        console.log(JSON.stringify({ query, page, count: results.length, results }, null, 2));
      } else {
        console.log(`Found ${results.length} results:`);
        results.forEach((item, idx) => {
          const title = item.title || item.nameZh || item.nameEn || item.nameZhCN || item.productSearchCode || item.name || '（無標題）';
          const price = (item.sellingPrice && `HK$${item.sellingPrice}`) ||
                        (item.price && `HK$${item.price}`) ||
                        (item.priceList && item.priceList[0] && item.priceList[0].formattedValue) ||
                        null;
          const link = item.link || item.urlEn || item.urlZh || item.urlZhCN || null;

          console.log(`\n${idx + 1}. ${title}`);
          if (item.code) {
            console.log(`   Code: ${item.code}`);
          }
          if (price) {
            console.log(`   Price: ${price}`);
          }
          if (link) {
            console.log(`   Link: https://www.hktvmall.com/${link}`);
          }
        });
      }
    } catch (err) {
      console.error('Search failed:', err.message || err);
      process.exit(1);
    }
  });

module.exports = searchCmd;
