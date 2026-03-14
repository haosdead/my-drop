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
        
        // Зберігаємо файл
        fs.writeFileSync('products.json', JSON.stringify(offers, null, 2));
        console.log("Дані оновлено успішно!");
    } catch (err) {
        console.error("Помилка:", err);
        process.exit(1);
    }
}
main();