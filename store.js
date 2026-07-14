/**
 * متجر تريندي (Trendify) - ملف التحكم الذكي بسلة المشتريات (store.js)
 * تم التطوير بحرفية لتوفير تجربة تسوق تفاعلية وسلسة (UX/UI)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. قاعدة بيانات المنتجات الافتراضية (Products DB)
    // ==========================================
    const products = [
        {
            id: 101,
            name: "قميص كلاسيك كتان - بيج",
            category: "clothes",
            price: 650,
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80",
            rating: 5
        },
        {
            id: 102,
            name: "تيشيرت أوفرسايز قطن - أسود",
            category: "clothes",
            price: 450,
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
            rating: 4
        },
        {
            id: 103,
            name: "حذاء رياضي مريح - أبيض ناصع",
            category: "shoes",
            price: 950,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
            rating: 5
        },
        {
            id: 104,
            name: "ساعة كلاسيكية بسوار جلدي",
            category: "accessories",
            price: 1200,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
            rating: 4
        },
        {
            id: 105,
            name: "نظارة شمسية عصرية - إطار ذهبي",
            category: "accessories",
            price: 350,
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80",
            rating: 5
        },
        {
            id: 106,
            name: "فستان صيفي مشجر ناعم",
            category: "clothes",
            price: 850,
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
            rating: 4
        },
        {
            id: 107,
            name: "حذاء كلاسيكي جلدي فاخر",
            category: "shoes",
            price: 1100,
            image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80",
            rating: 5
        },
        {
            id: 108,
            name: "حقيبة يد كاجوال مبطنة",
            category: "accessories",
            price: 700,
            image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
            rating: 4
        }
    ];

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

    // ==========================================
    // 6. تأكيد الطلب الفخم وإرساله (Checkout Submit)
    // ==========================================
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();

        // تجميع المنتجات المطلوبة لشكل رسالة نصية فخمة
        let productsSummary = cart.map(item => `- ${item.name} (عدد: ${item.quantity} قطع)`).join('\n');
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let finalTotal = subtotal + 50;

        // صياغة رسالة واتساب رائعة واحترافية تُرسل فوراً لبراند المبيعات!
        const messageText = `مرحباً Trendify ✨\nلقد قمت بطلب أوردر جديد من المتجر الإلكتروني ببيانات الشحن التالية:\n\n👤 *الاسم:* ${name}\n📞 *رقم الهاتف:* ${phone}\n📍 *العنوان:* ${address}\n\n📦 *تفاصيل المنتجات المطلوبة:*\n${productsSummary}\n\n💰 *الحساب الإجمالي:* ${finalTotal.toLocaleString()} ج.م (شامل التوصيل)\n\nيرجى تأكيد الطلب وبدء عملية الشحن في أقرب وقت. شكراً لكم!`;

        // رقم واتساب براند المبيعات (حط رقم المبيعات هنا، مجهز برقم وهمي حالياً)
        const whatsappNumber = "201000000000"; 
        const encodedText = encodeURIComponent(messageText);
        
        // فتح واتساب فوراً بالرسالة المنسقة
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');

        // تنظيف السلة وإعادة تهيئة التطبيق
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckoutModal();
        
        alert("تم تسجيل طلبك بنجاح! سيتم توجيهك الآن للواتساب لتأكيد الشحن الفوري مع خدمة العملاء.");
    });

    // تشغيل المتجر فور تحميل الصفحة
    renderProducts();
    updateCartUI();
});