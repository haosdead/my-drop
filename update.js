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
                // Зберігаємо ТІЛЬКИ те, що треба для карток
                uniqueProducts.push({
                    n: p.name,          // назва (скорочено 'n')
                    p: p.price,         // ціна ('p')
                    c: catMap[p.categoryId] || "Інше", // категорія ('c')
                    i: Array.isArray(p.picture) ? p.picture : [p.picture],// одна картинка ('i')
                    d: p.description ? p.description.substring(0, 1500) : "" // опис ('d')
                });
            }
        });

        // Сортуємо, щоб нові були зверху
        fs.writeFileSync('products.json', JSON.stringify(uniqueProducts));
        console.log("Успішно! Файл став легшим.");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();