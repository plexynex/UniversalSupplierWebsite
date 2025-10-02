        // Format Rupiah
        function formatRupiah(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }
        
        // Cart functionality
        let cart = [];
        
        // Load cart from localStorage
        function loadCartFromStorage() {
            const savedCart = localStorage.getItem('plexyStoreCart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                updateCartCount();
            }
        }
        
        // Save cart to localStorage
        function saveCartToStorage() {
            localStorage.setItem('plexyStoreCart', JSON.stringify(cart));
        }
        
        // DOM Elements
        const productsContainer = document.getElementById('products-container');
        const cartIcon = document.getElementById('cart-icon');
        const cartCount = document.getElementById('cart-count');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCart = document.getElementById('close-cart');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const searchInput = document.getElementById('search-input');
        const notification = document.getElementById('notification');
        
        // Event Listeners
        cartIcon.addEventListener('click', toggleCart);
        closeCart.addEventListener('click', toggleCart);
        
        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterProducts(searchTerm);
        });
        
        // Filter products based on search term
        function filterProducts(searchTerm) {
            const filteredProducts = products.filter(product => {
                return (
                    product.title.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                    // product.category.toLowerCase().includes(searchTerm)
                );
            });
            
            displayProducts(filteredProducts);
        }
        
        // Toggle Cart
        function toggleCart() {
            cartOverlay.classList.toggle('active');
            if (cartOverlay.classList.contains('active')) {
                renderCartItems();
            }
        }
        
        // Display Products
        function displayProducts(productsToDisplay = products) {
            productsContainer.innerHTML = '';
            
            productsToDisplay.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.style.animationDelay = `${index * 0.1}s`;
                
                let badgeHTML = '';
                if (product.badge) {
                    const badgeClass = product.badge === "Diskon" ? "discount-badge" : "";
                    badgeHTML = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
                }
                
                let priceHTML = '';
                if (product.originalPrice) {
                    priceHTML = `
                        <div class="price-container">
                            <span class="original-price">${formatRupiah(product.originalPrice)}</span>
                            <span class="product-price">${formatRupiah(product.price)}</span>
                        </div>
                    `;
                } else {
                    priceHTML = `
                        <div class="price-container">
                            <span class="product-price">${formatRupiah(product.price)}</span>
                        </div>
                    `;
                }
                
                const stockText = product.stock > 0 ? 
                    `<div class="product-stock"><i class="fas fa-check-circle"></i> Tersisa ${product.stock} unit</div>` : 
                    '<div class="product-stock" style="color: var(--discount);"><i class="fas fa-times-circle"></i> Stok habis</div>';
                
                productCard.innerHTML = `
                    ${badgeHTML}
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>

                        <p class="product-description">${product.description}</p>
                        ${priceHTML}
                        ${stockText}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        ${product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                    </button>
                    `;
                    // Pindahkan keatas satu baris jika ingin menambahkan kembali fitur lihat detail
                    // <a href="${product.detailUrl}" class="view-details" data-id="${product.id}">
                    //     <i class="fas fa-info-circle"></i> Lihat Deskripsi
                    // </a>
                
                productsContainer.appendChild(productCard);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    addToCart(productId);
                });
            });
        }
        
        // Add to Cart
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            
            // Check if product already in cart
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                // Check stock availability
                const productInStore = products.find(p => p.id === productId);
                if (existingItem.quantity >= productInStore.stock) {
                    showNotification(`Stok ${product.title} hanya tersisa ${productInStore.stock} unit`, 'error');
                    return;
                }
                existingItem.quantity += 1;
            } else {
                cart.push({
                    ...product,
                    quantity: 1
                });
            }
            
            updateCartCount();
            saveCartToStorage();
            showNotification(`${product.title} ditambahkan ke keranjang`, 'success');
        }
        
        // Update Cart Count
        function updateCartCount() {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = count;
        }
        
        // Render Cart Items
        function renderCartItems() {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Keranjang belanja kosong</p>
                    </div>
                `;
                cartSummary.style.display = 'none';
                return;
            }
            
            cartItemsContainer.innerHTML = '';
            
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">${formatRupiah(item.price)}</div>
                        <div class="cart-item-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                cartItemsContainer.appendChild(cartItem);
            });
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    updateQuantity(productId, -1);
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    updateQuantity(productId, 1);
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const newQuantity = parseInt(this.value);
                    
                    if (newQuantity < 1) {
                        this.value = 1;
                        return;
                    }
                    
                    // Check stock availability
                    const productInStore = products.find(p => p.id === productId);
                    if (newQuantity > productInStore.stock) {
                        this.value = productInStore.stock;
                        showNotification(`Stok hanya tersisa ${productInStore.stock} unit`, 'error');
                        return;
                    }
                    
                    const item = cart.find(item => item.id === productId);
                    if (item) {
                        item.quantity = newQuantity;
                        updateCartTotal();
                        saveCartToStorage();
                    }
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    removeFromCart(productId);
                });
            });
            
            // Show summary
            cartSummary.style.display = 'block';
            updateCartTotal();
        }
        
        // Update Quantity
        function updateQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            
            if (item) {
                const newQuantity = item.quantity + change;
                
                // Check if decreasing below 1
                if (newQuantity < 1) {
                    removeFromCart(productId);
                    return;
                }
                
                // Check stock availability
                const productInStore = products.find(p => p.id === productId);
                if (newQuantity > productInStore.stock) {
                    showNotification(`Stok hanya tersisa ${productInStore.stock} unit`, 'error');
                    return;
                }
                
                item.quantity = newQuantity;
                renderCartItems();
                updateCartCount();
                saveCartToStorage();
            }
        }
        
        // Remove from Cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            renderCartItems();
            updateCartCount();
            saveCartToStorage();
            showNotification('Produk dihapus dari keranjang', 'info');
        }
        
        // Update Cart Total
        function updateCartTotal() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalPrice.textContent = formatRupiah(total);
        }
        
        // Show notification message
        function showNotification(message, type) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('active');
            
            setTimeout(() => {
                notification.classList.remove('active');
            }, 3000);
        }
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Load cart from localStorage
            loadCartFromStorage();
            
            // Display products
            displayProducts();
            
            // Modal functionality
            const checkoutModal = document.getElementById('checkout-modal');
            const closeModalBtn = document.getElementById('close-modal');
            const checkoutForm = document.getElementById('checkout-form');
            
            // Event listener untuk tombol checkout di cart
            document.querySelector('.checkout-btn').addEventListener('click', function() {
                if (cart.length > 0) {
                    checkoutModal.classList.add('active');
                }
            });
            
            // Tutup modal
            closeModalBtn.addEventListener('click', function() {
                checkoutModal.classList.remove('active');
            });
            
            // Submit form checkout
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                generateWhatsAppMessage();
            });
        });
        
        // Fungsi untuk menghasilkan pesan WhatsApp yang rapi
        function generateWhatsAppMessage() {
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const address = document.getElementById('customer-address').value;
            const notes = document.getElementById('customer-notes').value;
            
            // Format pesan dengan template string yang rapi
            const message = `Halo, saya ingin memesan produk dari Plexy Store:

*Daftar Produk:*
${cart.map((item, index) => `${index + 1}. ${item.title} - ${formatRupiah(item.price)} x ${item.quantity}`).join('\n')}

*Informasi Pemesan:*
Nama: ${name}
WhatsApp: ${phone}
Alamat: ${address}
${notes ? `Catatan: ${notes}\n` : ''}
*Total: ${formatRupiah(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}*

Terima kasih!`;
            
            // Encode message untuk URL dengan format yang lebih rapi
            const encodedMessage = encodeURIComponent(message)
                .replace(/%20/g, ' ') // Ganti %20 dengan spasi
                .replace(/%2A/g, '*') // Ganti %2A dengan * (untuk bold)
                .replace(/%0A/g, '%0A'); // Biarkan %0A untuk new line
            
            // Redirect ke WhatsApp
            window.open(`https://wa.me/6289677663242?text=${encodedMessage}`, '_blank');
            
            // Tutup modal
            document.getElementById('checkout-modal').classList.remove('active');
            
            // Kosongkan keranjang
            cart = [];
            updateCartCount();
            saveCartToStorage();
            toggleCart();
            
            // Reset form
            document.getElementById('checkout-form').reset();
        }