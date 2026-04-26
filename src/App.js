import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './App.css';

// ── EmailJS credentials ──────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_r7v3mrl';
const EMAILJS_TEMPLATE_ID = 'template_sy7huwf';
const EMAILJS_PUBLIC_KEY  = 'IYox-nxXdgyRWFc_t';

// ── Menu data ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { name: 'Bacsilog',      price: 129, img: '/images/bacsilog.webp',      desc: 'Bacon, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Cornsilog',     price: 89,  img: '/images/cornsilog.webp',     desc: 'Corned beef, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Longsilog',     price: 89,  img: '/images/longsilog.webp',     desc: 'Longganisa, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Lumsilog',      price: 79,  img: '/images/lumsilog.webp',      desc: 'Lumpia, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Porksilog',     price: 129, img: '/images/porksilog.webp',     desc: 'Fried pork, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Tosilog',       price: 119, img: '/images/tosilog.webp',       desc: 'Tocino, garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Sisig',         price: 149, img: '/images/image1.webp',        desc: 'A sizzling, savory dish of chopped pork seasoned with calamansi, onions, and chili — crispy on the edges and perfect for sharing.' },
  { name: 'Bangsilog',     price: 139, img: '/images/bangsilog.webp',     desc: 'Milkfish (bangus), garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Tapsilog',      price: 129, img: '/images/tapsilog.webp',      desc: 'Tapa (dried salted meat), garlic fried rice (sinangag), and a fried egg (itlog) — a beloved Filipino breakfast classic.' },
  { name: 'Kapeng Barako', price: 55,  img: '/images/kapeng barako.jpg',  desc: 'Strong and aromatic Filipino coffee. A traditional favorite to start your morning right.' },
];

// ── Reviews data ─────────────────────────────────────────────────────────────
const REVIEWS = [
  { name: 'Jhon Jeremie', stars: 5, text: '"The food was amazing! Highly recommend the sizzling sisig. Napakasarap!"' },
  { name: 'Dylan',        stars: 4, text: '"Great atmosphere and friendly staff. I\'ll be back soon!"' },
  { name: 'Mitch',        stars: 4, text: '"Best Filipino breakfast in town! The longsilog is absolutely delicious and authentic."' },
  { name: 'Kurt',         stars: 5, text: '"Perfect place to start the day! Fresh ingredients and generous portions. Highly recommended!"' },
  { name: 'Christian',    stars: 4, text: '"The sisig is incredible! I bring my friends here all the time. Never disappoints!"' },
  { name: 'Lemset',       stars: 4, text: '"Authentic flavors that remind me of home. Staff is friendly and food arrives quickly."' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function starRow(count) {
  return '⭐'.repeat(count);
}

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart]                   = useState([]);
  const [cartOpen, setCartOpen]           = useState(false);
  const [checkoutOpen, setCheckoutOpen]   = useState(false);
  const [successOpen, setSuccessOpen]     = useState(false);
  const [loginOpen, setLoginOpen]         = useState(false);
  const [toasts, setToasts]               = useState([]);

  // User state
  const [user, setUser] = useState(null);

  // form fields
  const [custName,    setCustName]    = useState('');
  const [custPhone,   setCustPhone]   = useState('');
  const [custEmail,   setCustEmail]   = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes,   setCustNotes]   = useState('');
  const [orderType,   setOrderType]   = useState('Delivery');
  const [payMethod,   setPayMethod]   = useState('Cash on Delivery');

  // success / email status
  const [successMsg,   setSuccessMsg]   = useState('');
  const [emailStatus,  setEmailStatus]  = useState({ type: '', text: '' }); // type: sending|sent|error
  const [btnBusy,      setBtnBusy]      = useState(false);

  // ── Load EmailJS once ──────────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    document.head.appendChild(script);
  }, []);

  // ── Smooth scroll for hash links ──────────────────────────────────────────
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Cart helpers ───────────────────────────────────────────────────────────
  function cartTotal(items = cart) {
    return items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function addToCart(name, price) {
    setCart(prev => {
      const existing = prev.find(i => i.name === name);
      const next = existing
        ? prev.map(i => i.name === name ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { name, price, qty: 1 }];
      // auto-open cart on first add
      if (!existing) setCartOpen(true);
      return next;
    });
    showToast(name);
  }

  function removeFromCart(name) {
    setCart(prev => prev.filter(i => i.name !== name));
  }

  function changeQty(name, delta) {
    setCart(prev => {
      const item = prev.find(i => i.name === name);
      if (!item) return prev;
      if (item.qty + delta <= 0) return prev.filter(i => i.name !== name);
      return prev.map(i => i.name === name ? { ...i, qty: i.qty + delta } : i);
    });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(name) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text: `✅ ${name} added to cart!` }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }

  // ── Checkout ───────────────────────────────────────────────────────────────
  function openCheckout() {
    if (cart.length === 0) return;
    setCartOpen(false);
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setCheckoutOpen(true);
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  function handleLoginSuccess(credentialResponse) {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    setCustName(decoded.name || '');
    setCustEmail(decoded.email || '');
    setLoginOpen(false);
    setCheckoutOpen(true);
  }

  function handleLogout() {
    setUser(null);
    setCustName('');
    setCustEmail('');
  }

  // ── Place order ────────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!custName || !custPhone || !custEmail || !custAddress) {
      alert('Please fill in your Name, Phone Number, Email, and Address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    const orderNum  = 'PBY-' + Date.now().toString().slice(-6);
    const total     = cartTotal();
    const itemLines = cart.map(i => `${i.name} x${i.qty}  —  ₱${(i.price * i.qty).toFixed(2)}`).join('\n');

    setBtnBusy(true);
    setCheckoutOpen(false);
    setSuccessMsg(
      `Thank you, <strong>${custName}</strong>! 🎉<br/><br/>
       Order # <strong>${orderNum}</strong><br/>
       ${orderType} · ${payMethod}<br/>
       <strong>Total: ₱${total.toFixed(2)}</strong><br/><br/>
       We'll contact you at <strong>${custPhone}</strong> to confirm.`
    );
    setEmailStatus({ type: 'sending', text: '✉️ Sending confirmation email…' });
    setSuccessOpen(true);

    // Reset cart & form
    setCart([]);
    setCustName(''); setCustPhone(''); setCustEmail('');
    setCustAddress(''); setCustNotes('');
    setOrderType('Delivery'); setPayMethod('Cash on Delivery');
    setBtnBusy(false);

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:      custEmail,
        customer_name: custName,
        order_number:  orderNum,
        order_items:   itemLines,
        order_total:   '₱' + total.toFixed(2),
        order_type:    orderType,
        pay_method:    payMethod,
        address:       custAddress,
        phone:         custPhone,
        notes:         custNotes || 'None',
      });
      setEmailStatus({ type: 'sent', text: `✅ Confirmation email sent to <strong>${custEmail}</strong>` });
    } catch (err) {
      console.error('EmailJS error:', err);
      setEmailStatus({ type: 'error', text: `⚠️ Could not send email — please check your EmailJS keys.<br/><small>${err.text || err.message || JSON.stringify(err)}</small>` });
    }
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Navigation ── */}
      <nav>
        <ul>
          {['home','menu','about','reviews','contact'].map(sec => (
            <li key={sec}>
              <a href={`#${sec}`} onClick={e => { e.preventDefault(); scrollTo(sec); }}>
                {sec.charAt(0).toUpperCase() + sec.slice(1).replace('reviews','Reviews').replace('contact','Contact')}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Hi, {user.given_name || user.name}!</span>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ff6b35', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer' }}>Logout</button>
            </div>
          )}
          <button className="cart-nav-btn" onClick={() => setCartOpen(o => !o)} style={{ position: 'relative', right: 'auto', top: 'auto', transform: 'none' }}>
            🛒 Cart <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="hero" style={{ backgroundImage: "url('/images/image1.webp')" }}>
        <div className="hero-content">
          <h1>PARES BE WITH YOU</h1>
          <p>Experience Authentic Filipino Breakfast</p>
          <div className="hero-buttons">
            <a href="#menu" className="cta-button" onClick={e => { e.preventDefault(); scrollTo('menu'); }}>Explore Our Menu</a>
            <a href="#menu" className="cta-button cta-order" onClick={e => { e.preventDefault(); scrollTo('menu'); }}>Order Now</a>
          </div>
        </div>
      </section>

      {/* ── Menu ── */}
      <section id="menu">
        <video autoPlay muted loop className="menu-video">
          <source src="/images/menu-bg.mp4" type="video/mp4" />
        </video>
        <h2 className="section-title">Our Menu</h2>
        <div className="menu-grid">
          {MENU_ITEMS.map(item => (
            <div className="menu-card" key={item.name}>
              <img src={item.img} alt={item.name} />
              <div className="menu-info">
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <div className="price-row">
                  <span className="price">₱{item.price}.00</span>
                  <button className="order-btn" onClick={() => addToCart(item.name, item.price)}>+ Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about">
        <div className="about-container">
          <h2 className="section-title" style={{ color: '#333' }}>About Us</h2>
          <div className="about-grid">
            <img src="/images/LOGO.png" alt="Restaurant" className="about-img" />
            <div className="about-text">
              <p>"Start your day the Filipino way! Our restaurant brings you the comforting flavors of home with classic and authentic breakfast favorites like silogs—perfectly paired garlic rice, eggs, and your choice of tapa, longganisa, or tocino. Craving something savory? Indulge in our sizzling sisig, bursting with flavor and crunch. Every dish is made with love, using traditional recipes that celebrate the true taste of the Philippines."</p>
            </div>
          </div>
          <div className="mission-vision-grid">
            <div className="mission-vision-text">
              <p><strong>Mission:</strong> To promote and keep the Filipino culture by serving the classic Filipino breakfast, creating a menu that carry outs our tradition to welcome the future generations. We prioritize the comfort of our guests while delivering exceptional dining experiences.</p>
              <p><strong>Vision:</strong> To maintain and grow cooking excellence by showing the value of careful preparation and traditional techniques in creating outstanding dining experiences.</p>
            </div>
          </div>
          <h3 className="owners-title">Meet Our Owners</h3>
          <div className="owners-grid">
            <div className="owner-card">
              <img src="/images/Dwayne.webp" alt="Dwayne Lagamayo" className="owner-img" />
              <h4>Dwayne Lagamayo</h4>
              <p>With a passion for authentic Filipino cuisine and a deep commitment to preserving our culinary heritage, our co-founder brings years of experience in restaurant management and a love for traditional cooking methods.</p>
            </div>
            <div className="owner-card">
              <img src="/images/Darwin.png" alt="Darwin Villanueva" className="owner-img" />
              <h4>Darwin Villanueva</h4>
              <p>A culinary enthusiast dedicated to sourcing the finest ingredients and perfecting time-honored recipes, our co-founder ensures that every dish maintains the highest quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews">
        <div className="reviews-container">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="average-rating">
            <div className="rating-display">
              <span className="rating-stars">
                <span style={{ position:'relative', display:'inline-block', fontSize:'1.2rem', lineHeight:'1' }}>
                  <span style={{ color:'#ccc' }}>★★★★★</span>
                  <span style={{ position:'absolute', left:0, top:0, overflow:'hidden', whiteSpace:'nowrap', width:'86%', color:'#ffc107' }}>★★★★★</span>
                </span>
              </span>
              <span className="rating-score">4.3/5</span>
            </div>
            <p className="rating-text">Based on several customer reviews</p>
          </div>
          {REVIEWS.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="review-stars">{starRow(r.stars)}</div>
              <p><strong>{r.name}:</strong> {r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact">
        <div className="contact-container">
          <h2 className="section-title" style={{ color: '#333' }}>Contact Us</h2>
          <address>
            <p><strong>Address:</strong> 2 President Laurel Highway, Darasa, Tanauan City, Batangas 4232, Philippines</p>
            <p><strong>Phone:</strong> 09123456789</p>
            <p><strong>Email:</strong> <a href="mailto:s2023101530@firstasia.edu.ph">s2023101530@firstasia.edu.ph</a></p>
            <p><strong>Email:</strong> <a href="mailto:s2023102048@firstasia.edu.ph">s2023102048@firstasia.edu.ph</a></p>
            <p><strong>Hours of Operation:</strong></p>
            <ul>
              <li>Monday - Friday: 6:00 AM - 9:00 PM</li>
              <li>Saturday - Sunday: 6:00 AM - 10:00 PM</li>
            </ul>
          </address>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <p>&copy; 2025 PARES BE WITH YOU. All rights reserved.</p>
      </footer>

      {/* ── Cart overlay + sidebar ── */}
      {cartOpen && <div className="cart-overlay overlay-show" onClick={() => setCartOpen(false)} />}
      <div className={`cart-sidebar${cartOpen ? ' cart-open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Your Order</h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0
            ? <p className="cart-empty">Your cart is empty.<br />Add some delicious items!</p>
            : cart.map(item => (
              <div className="cart-item" key={item.name}>
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">₱{(item.price * item.qty).toFixed(2)}</span>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => changeQty(item.name, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.name, +1)}>+</button>
                  <button className="remove-btn" onClick={() => removeFromCart(item.name)}>🗑</button>
                </div>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>₱{cartTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={openCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>

      {/* ── Checkout modal ── */}
      <div className={`modal-overlay${checkoutOpen ? ' modal-show' : ''}`}>
        <div className="checkout-modal">
          <button className="modal-close" onClick={() => setCheckoutOpen(false)}>✕</button>
          <h2>📋 Checkout</h2>
          <p className="checkout-subtitle">Fill in your details — we'll email your order confirmation!</p>
          <div className="checkout-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="e.g. Juan dela Cruz" value={custName} onChange={e => setCustName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" placeholder="e.g. 09XXXXXXXXX" value={custPhone} onChange={e => setCustPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address * <span className="email-hint">📧 Your confirmation will be sent here</span></label>
              <input type="email" placeholder="e.g. juan@email.com" value={custEmail} onChange={e => setCustEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea placeholder="House No., Street, Barangay, City" value={custAddress} onChange={e => setCustAddress(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Order Type</label>
              <div className="order-type-group">
                <label className="radio-label"><input type="radio" name="orderType" value="Delivery" checked={orderType === 'Delivery'} onChange={() => setOrderType('Delivery')} /> 🛵 Delivery</label>
                <label className="radio-label"><input type="radio" name="orderType" value="Pickup"   checked={orderType === 'Pickup'}   onChange={() => setOrderType('Pickup')}   /> 🏃 Pickup</label>
              </div>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <div className="order-type-group">
                <label className="radio-label"><input type="radio" name="payMethod" value="Cash on Delivery" checked={payMethod === 'Cash on Delivery'} onChange={() => setPayMethod('Cash on Delivery')} /> 💵 Cash on Delivery</label>
                <label className="radio-label"><input type="radio" name="payMethod" value="GCash"            checked={payMethod === 'GCash'}            onChange={() => setPayMethod('GCash')}            /> 📱 GCash</label>
              </div>
            </div>
            <div className="form-group">
              <label>Special Instructions (optional)</label>
              <textarea placeholder="e.g. Extra rice, no spice, less oil..." value={custNotes} onChange={e => setCustNotes(e.target.value)} />
            </div>

            {/* Mini order summary */}
            <div className="order-summary-mini">
              <h4>📋 Order Summary</h4>
              {cart.map(i => (
                <div className="summary-row" key={i.name}>
                  <span>{i.name} × {i.qty}</span>
                  <span>₱{(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>Total</span>
                <span>₱{cartTotal().toFixed(2)}</span>
              </div>
            </div>

            <button className="place-order-btn" disabled={btnBusy} onClick={placeOrder}>
              🍽️ Place Order &amp; Send Confirmation
            </button>
            <p className="email-notice">✉️ A confirmation email will be sent to your inbox right away.</p>
          </div>
        </div>
      </div>

      {/* ── Success modal ── */}
      <div className={`modal-overlay${successOpen ? ' modal-show' : ''}`}>
        <div className="success-modal">
          <div className="success-icon">✅</div>
          <h2>Order Placed!</h2>
          <p dangerouslySetInnerHTML={{ __html: successMsg }} />
          <p className="success-eta">⏱️ Estimated time: <strong>30–45 minutes</strong></p>
          <div className="email-status">
            {emailStatus.type === 'sending' && <span className="sending-badge" dangerouslySetInnerHTML={{ __html: emailStatus.text }} />}
            {emailStatus.type === 'sent'    && <span className="sent-badge"    dangerouslySetInnerHTML={{ __html: emailStatus.text }} />}
            {emailStatus.type === 'error'   && <span className="error-badge"   dangerouslySetInnerHTML={{ __html: emailStatus.text }} />}
          </div>
          <button className="place-order-btn" onClick={() => setSuccessOpen(false)}>Back to Menu</button>
        </div>
      </div>

      {/* ── Login modal ── */}
      <div className={`modal-overlay${loginOpen ? ' modal-show' : ''}`}>
        <div className="login-modal">
          <button className="modal-close" onClick={() => setLoginOpen(false)}>✕</button>
          <h2>Sign In Required</h2>
          <p className="login-subtitle">Please sign in with Google to proceed with your checkout.</p>
          <div className="login-button-container">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => {
                console.error('Login Failed');
                alert('Google Sign-In failed. Please try again.');
              }}
              useOneTap
            />
          </div>
        </div>
      </div>

      {/* ── Toasts ── */}
      {toasts.map(t => (
        <div key={t.id} className="toast toast-show">{t.text}</div>
      ))}
    </>
  );
}
