const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function main() {
    const url = "https://backend.mydrop.com.ua/vendor/api/export/products/prom/yml?public_api_key=884402fcfe61d5998ba77d3cfd327316bca646f0&price_field=drop_price&stock_sync=true&only_available=true";
    try {
        const res = await fetch(url);
        const xml = await res.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const data = parser.parse(xml);
        
        const categories = data.yml_catalog.shop.categories.category;
        const offers = data.yml_catalog.shop.offers.offer;
        
        const catMap = {};
        if (Array.isArray(categories)) {
            categories.forEach(c => { catMap[c.id] = c["#text"] || c; });
        }

        const seen = new Set();
        const uniqueProducts = [];

        offers.forEach(p => {
            if (!seen.has(p.name)) {
                seen.add(p.name);
                
                // Націнка 25% та заокруглення вгору
                const originalPrice = parseFloat(p.price);
                const finalPrice = Math.ceil(originalPrice * 1.25);

                uniqueProducts.push({
                    n: p.name,
                    p: finalPrice,
                    c: catMap[p.categoryId] || "Інше",
                    i: Array.isArray(p.picture) ? p.picture : [p.picture],
                    d: p.description || "",
                    v: p.vendorCode || p.id // Артикул
                });
            }
        });

        fs.writeFileSync('products.json', JSON.stringify(uniqueProducts));
        console.log("Дані оновлено з націнкою 25%");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();