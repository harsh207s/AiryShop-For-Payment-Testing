// JavaScript Example: Reading Entities
// Filterable fields: title, category, brand, price, discount_percentage, final_price, description, specifications, sku, stock_quantity, image_url, additional_images, offer_text, featured
async function fetchProductEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/68e3c53923b86a77a0af07f0/entities/Product`, {
        headers: {
            'api_key': '98d375f492f64b9e85a048e4489f307c', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: title, category, brand, price, discount_percentage, final_price, description, specifications, sku, stock_quantity, image_url, additional_images, offer_text, featured
async function updateProductEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/68e3c53923b86a77a0af07f0/entities/Product/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': '98d375f492f64b9e85a048e4489f307c', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}