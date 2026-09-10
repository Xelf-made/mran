import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BadgeCheck, LogOut, Menu, MessageCircle, Phone, Search, ShoppingBag, ShieldCheck, Truck, User, X } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/useAuth';

const navLinks = [
  { label: 'All products', path: '/products' },
  { label: 'Medicines', path: '/products?category=Medicines' },
  { label: 'Vitamins', path: '/products?category=Vitamins+%26+Supplements' },
  { label: 'Personal care', path: '/products?category=Personal+Care' },
  { label: 'Mother & baby', path: '/products?category=Mother+%26+Baby' },
  { label: 'Devices', path: '/products?category=Medical+Devices' },
];

export function Navbar() {
  const { count } = useCart();
  const { user, demoUser, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const submit = (event: FormEvent) => { event.preventDefault(); navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`); setOpen(false); };
  const handleSignOut = async () => { await signOut(); navigate('/'); };
  return (
    <>
      <div className="topbar">
        <div className="shell topbar__inner">
          <p><Truck size={14} /> Free delivery in Nairobi on orders above KSh 3,000 · Same-day available</p>
          <p className="topbar__right"><span className="topbar__ppb"><BadgeCheck size={14} /> PPB Lic. 123456</span><span className="topbar__sep" /><a href="tel:+254700123456"><Phone size={13} /> +254 700 123 456</a></p>
        </div>
      </div>
      <header className="header">
        <div className="shell header__inner">
          <button className="header__burger" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
          <Link to="/" className="logo" aria-label="Moran Pharmacy home"><img src="/WhatsApp_Image_2026-08-18_at_08.58.25.jpeg" alt="Moran Pharmacy" className="logo__img" /></Link>
          <form className="header__search" onSubmit={submit}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicines, symptoms or brands" aria-label="Search products" /></form>
          <div className="header__icons">
            <a href="https://wa.me/254700123456" target="_blank" rel="noreferrer" className="icon-btn header__chat"><MessageCircle size={19} /><span className="icon-btn__label">Pharmacist</span></a>
            {user || demoUser ? (<>
              <Link to={isAdmin ? '/admin' : '/account'} className="icon-btn" aria-label={isAdmin ? 'Admin dashboard' : 'My account'}>{isAdmin ? <ShieldCheck size={19} /> : <User size={19} />}<span className="icon-btn__label">{isAdmin ? 'Admin' : 'Account'}</span></Link>
              <button className="icon-btn" onClick={handleSignOut} aria-label="Sign out"><LogOut size={19} /><span className="icon-btn__label">Sign out</span></button>
            </>) : (<Link to="/login" className="icon-btn" aria-label="Sign in"><User size={19} /><span className="icon-btn__label">Sign in</span></Link>)}
            <Link to="/cart" className="icon-btn icon-btn--cart" aria-label="Cart"><ShoppingBag size={19} />{count > 0 && <span>{count}</span>}<span className="icon-btn__label">Cart</span></Link>
          </div>
        </div>
        <nav className={`main-nav ${open ? 'main-nav--open' : ''}`}><div className="shell main-nav__inner">{navLinks.map((link) => <NavLink key={link.path} to={link.path} className={({ isActive }) => `main-nav__link${isActive ? ' main-nav__link--active' : ''}`} onClick={() => setOpen(false)}>{link.label}</NavLink>)}</div></nav>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer__brand">
          <img src="/WhatsApp_Image_2026-08-18_at_08.58.25.jpeg" alt="Moran Pharmacy" className="footer__logo" />
          <p>Genuine. Reliable. Human. Your trusted Nairobi online pharmacy for medicines, wellness and everyday care.</p>
          <span className="footer__ppb"><BadgeCheck size={15} /> PPB Lic. 123456</span>
        </div>
        <div className="footer__cols">
          <div><h4>Shop</h4><Link to="/products">All products</Link><Link to="/products?category=Medicines">Medicines</Link><Link to="/products?category=Vitamins+%26+Supplements">Vitamins</Link><Link to="/products?category=Personal+Care">Personal care</Link></div>
          <div><h4>Account</h4><Link to="/account">My account</Link><Link to="/track">Track orders</Link><Link to="/login">Sign in</Link><Link to="/signup">Create account</Link></div>
          <div><h4>Contact</h4><a href="tel:+254700123456"><Phone size={13} /> +254 700 123 456</a><a href="mailto:info@moranpharmacy.co.ke">info@moranpharmacy.co.ke</a><span>Kilimani, Nairobi</span><span>Open 24/7 online</span></div>
        </div>
      </div>
      <div className="shell footer__bottom"><span>© 2026 Moran Pharmacy. All rights reserved.</span><span>Secure checkout · M-Pesa Express · Guest checkout available · <Link to="/admin-login" className="footer__admin">Admin</Link></span></div>
    </footer>
  );
}
