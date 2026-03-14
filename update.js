const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function main() {
    const url = "https://backend.mydrop.com.ua/vendor/api/export/products/prom/yml?public_api_key=884402fcfe61d5998ba77d3cfd327316bca646f0&price_field=drop_price&stock_sync=true&only_available=true";
    try {
        const res = await fetch(url);
        const xml = await res.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const data = parser.parse(xml);
        const offers = data.yml_catalog.shop.offers.offer;
        
        // ОПТИМІЗАЦІЯ: беремо тільки потрібні поля
        const optimizedProducts = offers.map(p => ({
            name: p.name,
            price: p.price,
            picture: Array.isArray(p.picture) ? p.picture[0] : p.picture
        }));

        fs.writeFileSync('products.json', JSON.stringify(optimizedProducts));
        console.log("Оптимізовано! Нова кількість товарів: " + optimizedProducts.length);
    } catch (err) {
        console.error("Помилка:", err);
        process.exit(1);
    }
}
main();