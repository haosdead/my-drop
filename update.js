const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

async function main() {
    // Ваше актуальне посилання
    const url = "https://backend.mydrop.com.ua/vendor/api/export/products/prom/yml?public_api_key=eb5ce830b3a54f0afeeb4967e807800e3c6c2ab2&price_field=drop_price&param_name=а&stock_sync=true";
    
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
                
                // Націнка 25% від drop_price та заокруглення
                const basePrice = parseFloat(p.price); 
                const finalPrice = Math.ceil(basePrice * 1.25);

                uniqueProducts.push({
                    n: p.name,
                    p: finalPrice,
                    c: catMap[p.categoryId] || "Тактичне спорядження",
                    i: Array.isArray(p.picture) ? p.picture : [p.picture],
                    d: p.description || "",
                    v: p.vendorCode || p.id // Артикул для пошуку та замовлення
                });
            }
        });

        fs.writeFileSync('products.json', JSON.stringify(uniqueProducts));
        console.log("Оновлено! База готова. Товарів: " + uniqueProducts.length);
    } catch (err) {
        console.error("Помилка оновлення:", err);
        process.exit(1);
    }
}
main();