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
        
        // Створюємо словник категорій для швидкого пошуку
        const catMap = {};
        categories.forEach(c => { catMap[c.id] = c["#text"] || c; });

        const seen = new Set();
        const uniqueProducts = [];

        offers.forEach(p => {
            // Групуємо за назвою, щоб не було дублів розмірів
            if (!seen.has(p.name)) {
                seen.add(p.name);
                uniqueProducts.push({
                    name: p.name,
                    price: p.price,
                    category: catMap[p.categoryId] || "Загальне",
                    pictures: Array.isArray(p.picture) ? p.picture : [p.picture],
                    desc: p.description ? p.description.substring(0, 1000) : "Опис відсутній"
                });
            }
        });

        fs.writeFileSync('products.json', JSON.stringify(uniqueProducts));
        console.log("Готово! Товарів після фільтрації: " + uniqueProducts.length);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();