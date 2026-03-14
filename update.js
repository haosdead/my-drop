const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function main() {
    // Ваше нове посилання
    const url = "https://backend.mydrop.com.ua/vendor/api/export/products/prom/yml?public_api_key=eb5ce830b3a54f0afeeb4967e807800e3c6c2ab2&price_field=price&param_name=Размер&stock_sync=true";
    
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
            // Фільтруємо дублікати за назвою
            if (!seen.has(p.name)) {
                seen.add(p.name);
                
                // Націнка 25% та заокруглення вгору до цілого
                const basePrice = parseFloat(p.price);
                const finalPrice = Math.ceil(basePrice * 1.25);

                uniqueProducts.push({
                    n: p.name,
                    p: finalPrice,
                    c: catMap[p.categoryId] || "Спорядження",
                    i: Array.isArray(p.picture) ? p.picture : [p.picture],
                    d: p.description || "Опис готується...",
                    v: p.vendorCode || p.id
                });
            }
        });

        fs.writeFileSync('products.json', JSON.stringify(uniqueProducts));
        console.log("Базу оновлено! Унікальних товарів: " + uniqueProducts.length);
    } catch (err) {
        console.error("Помилка:", err);
        process.exit(1);
    }
}
main();