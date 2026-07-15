/**
 * متجر تريندي (Trendify) - ملف التحكم الذكي بسلة المشتريات (store.js)
 * تم التطوير بحرفية لتوفير تجربة تسوق تفاعلية وسلسة (UX/UI)
 */

document.addEventListener('DOMContentLoaded', () => {
// حط هنا رابط الـ CSV اللي أخدته من جوجل شيت
const googleSheetCSVURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRG16QORrPZSdLum8uWso1E5rsdqVA1vG79XtJvlais9ksPGaze8mL8eJv7Nw1kytmwOlFy2OMue58/pub?output=csv";

async function fetchProductsFromSheet() {
    try {
        const response = await fetch(googleSheetCSVURL);
        const data = await response.text();
        
        // تحويل نص الـ CSV إلى مصفوفة جافا سكريبت
        const rows = data.split("\n").slice(1); 
        
        const products = rows.map(row => {
            const columns = row.split(",");
            return {
                id: columns[0]?.trim(),
                name: columns[1]?.trim(),
                price: Number(columns[2]?.trim()),
                originalPrice: Number(columns[3]?.trim()),
                image: columns[4]?.trim(),
                category: columns[5]?.trim()
            };
        }).filter(p => p.name); 

        // 🔥 هنا السحر: هنخزن المنتجات الجديدة في الـ Local Storage مكان القديمة
        localStorage.setItem('store_products', JSON.stringify(products));
        
        // إعادة تحميل الصفحة مرة واحدة فقط لتحديث المنتجات تلقائياً بأمان
        if (!sessionStorage.getItem('reloaded')) {
            sessionStorage.setItem('reloaded', 'true');
            window.location.reload();
        }

    } catch (error) {
        console.error("فشل في جلب المنتجات من جوجل شيت:", error);
    }
}

// تشغيل الجلب التلقائي أول ما الصفحة تفتح
document.addEventListener('DOMContentLoaded', fetchProductsFromSheet);

// قراءة المنتجات من الـ Local Storage (عشان لو العميل ضاف حاجة تظهر)
const products = JSON.parse(localStorage.getItem('store_products')) || defaultProducts;

    // ==========================================
    // 2. استدعاء عناصر الواجهة (DOM Elements)
    // ==========================================
    const productsGrid = document.getElementById('products-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // عناصر السلة الجانبية
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // عناصر المودال والـ Checkout
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalTotal = document.getElementById('modal-total');

    // سلة المشتريات (تُجلب من ذاكرة المتصفح لو موجودة)
    let cart = JSON.parse(localStorage.getItem('trendify_cart')) || [];

    // ==========================================
    // 3. عرض المنتجات والفلترة (Rendering & Filtering)
    // ==========================================
    
    function renderProducts(categoryFilter = 'all') {
        productsGrid.innerHTML = '';
        
        // تصفية المنتجات بناءً على التصنيف المختار
        const filtered = categoryFilter === 'all' 
            ? products 
            : products.filter(p => p.category === categoryFilter);

        filtered.forEach(product => {
            // توليد نجوم التقييم بناءً على الرقم
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += i <= product.rating 
                    ? '<i class="fa-solid fa-star text-amber-400 text-xs"></i>' 
                    : '<i class="fa-regular fa-star text-neutral-300 text-xs"></i>';
            }

            const card = document.createElement('div');
            card.className = "group bg-white border border-neutral-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative";
            card.innerHTML = `
                <div class="relative overflow-hidden aspect-[3/4] bg-neutral-100">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 tracking-wider uppercase">NEW</span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div class="space-y-2">
                        <div class="flex gap-1">${starsHTML}</div>
                        <h4 class="text-sm font-bold text-neutral-900 group-hover:text-brandGold transition-colors">${product.name}</h4>
                    </div>
                    <div class="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center">
                        <span class="text-sm font-black text-neutral-950">${product.price} ج.م</span>
                        <button class="add-to-cart-btn bg-neutral-950 hover:bg-brandGold text-white hover:text-neutral-950 px-3 py-2 text-xs font-bold tracking-wide transition-colors duration-300 flex items-center gap-2" data-id="${product.id}">
                            <i class="fa-solid fa-cart-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        // تفعيل أزرار "أضف للسلة"
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prodId = parseInt(e.currentTarget.getAttribute('data-id'));
                addToCart(prodId);
            });
        });
    }

    // تفعيل ضغطات أزرار الفلترة
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active', 'bg-accent', 'text-white'));
            filterButtons.forEach(b => b.classList.add('bg-white', 'text-neutral-800', 'border-neutral-200'));
            
            e.currentTarget.classList.add('active', 'bg-accent', 'text-white');
            e.currentTarget.classList.remove('bg-white', 'text-neutral-800', 'border-neutral-200');

            const category = e.currentTarget.getAttribute('data-category');
            renderProducts(category);
        });
    });

    // ==========================================
    // 4. منطق سلة المشتريات الذكية (Cart Logic)
    // ==========================================

    function saveCart() {
        localStorage.setItem('trendify_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // تحديث عداد السلة العلوي
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItemsCount;

        // تحديث محتوى قائمة السلة
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-neutral-400 space-y-4">
                    <i class="fa-solid fa-bag-shopping text-5xl text-neutral-200"></i>
                    <p class="text-sm font-medium">سلتك فارغة تماماً حالياً</p>
                </div>`;
            cartSubtotal.textContent = "0 ج.م";
            cartTotal.textContent = "0 ج.م";
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;

            const cartRow = document.createElement('div');
            cartRow.className = "flex gap-4 p-3 border border-neutral-100 hover:border-neutral-200 transition-colors duration-200 relative";
            cartRow.innerHTML = `
                <div class="w-20 h-24 bg-neutral-100 overflow-hidden flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <h5 class="text-xs font-bold text-neutral-900 leading-tight">${item.name}</h5>
                        <p class="text-xs text-brandGold font-bold mt-1">${item.price} ج.م</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center border border-neutral-200">
                            <button class="qty-minus px-2.5 py-0.5 text-xs hover:bg-neutral-100 text-neutral-600 focus:outline-none" data-index="${index}">-</button>
                            <span class="px-3 text-xs font-bold text-neutral-900 select-none">${item.quantity}</span>
                            <button class="qty-plus px-2.5 py-0.5 text-xs hover:bg-neutral-100 text-neutral-600 focus:outline-none" data-index="${index}">+</button>
                        </div>
                        <button class="remove-item-btn text-red-500 hover:text-red-700 text-xs font-semibold focus:outline-none" data-index="${index}">حذف</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartRow);
        });

        const shippingCost = 50; // تكلفة الشحن الثابتة
        const totalCost = subtotal + shippingCost;

        cartSubtotal.textContent = `${subtotal.toLocaleString()} ج.م`;
        cartTotal.textContent = `${totalCost.toLocaleString()} ج.م`;

        // تفعيل أزرار تغيير كميات السلة
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cart[idx].quantity += 1;
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1); // لو الكمية بقت 0 يتم حذف المنتج نهائياً
                }
                saveCart();
                updateCartUI();
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
                updateCartUI();
            });
        });
    }

    // إضافة منتج للسلة
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        saveCart();
        updateCartUI();
        
        // فتح السلة تلقائياً عند إضافة منتج لتنبيه العميل
        openCartDrawer();
    }

    // ==========================================
    // 5. فتح وإغلاق النوافذ (Drawers & Modals)
    // ==========================================

    function openCartDrawer() {
        cartDrawer.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }

    function closeCartDrawer() {
        cartDrawer.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    cartIconBtn.addEventListener('click', openCartDrawer);
    closeCartBtn.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);

    // الانتقال للمودال النهائي لإتمام الدفع
    checkoutBtn.addEventListener('click', () => {
        closeCartDrawer();
        
        // حساب الفواتير ونقلها لشاشة المودال
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        modalSubtotal.textContent = `${subtotal.toLocaleString()} ج.م`;
        modalTotal.textContent = `${(subtotal + 50).toLocaleString()} ج.م`;

        checkoutModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    });

    function closeCheckoutModal() {
        checkoutModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    closeModalBtn.addEventListener('click', closeCheckoutModal); 

   function checkout() {
    // جلب البيانات بالـ IDs المتوقعة في كودك القديم (الاسم، الهاتف، العنوان)
    const name = document.getElementById('customer-name')?.value || document.getElementById('name')?.value;
    const phone = document.getElementById('customer-phone')?.value || document.getElementById('phone')?.value;
    const address = document.getElementById('customer-address')?.value || document.getElementById('address')?.value;
    
    if (!name || !address) {
        alert("برجاء ملء بيانات الاسم والعنوان أولاً!");
        return;
    }

    // تجهيز نص الرسالة لتليجرام
    let orderDetails = `🛒 *أوردر جديد يا إسلام!*\n\n`;
    orderDetails += `👤 *العميل:* ${name}\n`;
    orderDetails += `📞 *الهاتف:* ${phone}\n`;
    orderDetails += `📍 *العنوان:* ${address}\n\n`;
    orderDetails += `📦 *المنتجات المطلوبة:*\n`;
    
    cart.forEach(item => {
        orderDetails += `- ${item.name} (العدد: ${item.quantity})\n`;
    });
    
    // حساب الإجمالي مع الشحن (50 جنيه)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 50; 
    
    orderDetails += `\n💰 *الحساب الإجمالي:* ${total} ج.م`;

    const botToken = "8707402221:AAExZ5C1Qx7LzkKECNL-WzH8eSX0uHioVPM";
    // تأكد انك كتبت الـ Chat ID بتاعك هنا مكان الرقم اللي تحت ده
    const chatId = "5758140937"; 
    const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // إرسال الطلب
    fetch(telegramURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: orderDetails,
            parse_mode: "Markdown"
        })
    })
    .then(response => {
        if (response.ok) {
            alert("تم تسجيل طلبك بنجاح! سيتم التواصل معك لتأكيد الشحن الفوري.");
            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
            if (typeof closeCheckoutModal === "function") {
                closeCheckoutModal(); // قفل النافذة لو الدالة موجودة
            }
        } else {
            alert("حدثت مشكلة أثناء إرسال الطلب للتليجرام.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("عفواً، حدث خطأ في الاتصال.");
    });
}
    });