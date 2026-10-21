import { useMemo, useState } from 'react';
import { ChevronRight, Clock, MapPin, Navigation, Phone, Search, Stethoscope, Truck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

interface Branch {
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  open247: boolean;
  closingTime: string;
  services: string[];
  image: string;
  mapUrl: string;
  mapsLink: string;
}

const branches: Branch[] = [
  {
    name: 'Kilimani Branch',
    area: 'Kilimani',
    address: 'Argwings Kodhek Road, Yaya Centre, Ground Floor',
    phone: '+254700345678',
    hours: 'Mon–Sat: 7:30 AM – 8:30 PM · Sun: 9:00 AM – 5:00 PM',
    open247: false,
    closingTime: '8:30 PM',
    services: ['In-store Pharmacist Consultation', 'Prescription Pickup', 'Blood Pressure Checks'],
    image: 'https://images.pexels.com/photos/6062808/pexels-photo-6062808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    mapUrl: 'https://maps.google.com/?q=Yaya+Centre+Argwings+Kodhek+Road+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=Yaya+Centre+Argwings+Kodhek+Road+Nairobi',
  },
  {
    name: 'Westlands Branch',
    area: 'Westlands',
    address: 'Ring Road Westlands, Sarit Centre, Ground Floor',
    phone: '+254700234567',
    hours: 'Open 24/7',
    open247: true,
    closingTime: '24/7',
    services: ['24/7 Pickup Locker', 'In-store Pharmacist Consultation', 'Drive-thru Collection'],
    image: 'https://images.pexels.com/photos/30312098/pexels-photo-30312098.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    mapUrl: 'https://maps.google.com/?q=Sarit+Centre+Westlands+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=Sarit+Centre+Westlands+Nairobi',
  },
  {
    name: 'CBD Branch',
    area: 'Nairobi CBD',
    address: 'Moi Avenue, Ground Floor, I&M Bank Building',
    phone: '+254700123456',
    hours: 'Mon–Sat: 7:00 AM – 9:00 PM · Sun: 10:00 AM – 6:00 PM',
    open247: false,
    closingTime: '9:00 PM',
    services: ['In-store Pharmacist Consultation', 'Prescription Pickup', 'M-Pesa Payments'],
    image: 'https://images.pexels.com/photos/27681162/pexels-photo-27681162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    mapUrl: 'https://maps.google.com/?q=I%26M+Bank+Building+Moi+Avenue+Nairobi',
    mapsLink: 'https://www.google.com/maps/dir/?api=1&destination=I%26M+Bank+Building+Moi+Avenue+Nairobi',
  },
];

const serviceIcons: Record<string, typeof Clock> = {
  'In-store Pharmacist Consultation': Stethoscope,
  'Prescription Pickup': Truck,
  '24/7 Pickup Locker': Clock,
  'M-Pesa Payments': Phone,
  'Drive-thru Collection': Truck,
  'Blood Pressure Checks': Stethoscope,
};

const areas = ['All', 'Kilimani', 'Westlands', 'Nairobi CBD'];

export function BranchesPage() {
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [servicesBranch, setServicesBranch] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return branches.filter((b) => {
      const matchesArea = areaFilter === 'All' || b.area === areaFilter;
      const matchesQuery = !q ||
        b.name.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q);
      return matchesArea && matchesQuery;
    });
  }, [query, areaFilter]);

  const activeBranch = branches.find((b) => b.name === servicesBranch);

  return (
    <PageShell>
      <section className="page-hero page-hero--branches">
        <div className="shell">
          <span className="eyebrow">Store locator</span>
          <h1>Find a Moran Pharmacy near you</h1>
          <p>Visit any of our Nairobi branches for in-store pharmacist consultations, prescription pickup, and more.</p>
        </div>
      </section>

      <section className="shell branches">
        {/* Search + neighborhood filter */}
        <div className="branches__filters">
          <label className="branches__search">
            <Search size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by branch, area, or address…"
              aria-label="Search branches"
            />
          </label>
          <div className="branches__areas">
            {areas.map((a) => (
              <button
                key={a}
                className={`branches__area-btn ${areaFilter === a ? 'branches__area-btn--active' : ''}`}
                onClick={() => setAreaFilter(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Branch cards */}
        {filtered.length === 0 ? (
          <div className="rx-history__empty">
            <MapPin size={36} />
            <h3>No branches found</h3>
            <p>Try a different search term or neighborhood.</p>
          </div>
        ) : (
          <div className="branches__grid">
            {filtered.map((branch) => (
              <article className="branch-card" key={branch.name}>
                <div className="branch-card__media">
                  <img src={branch.image} alt={branch.name} loading="lazy" />
                  <span className={`branch-card__status ${branch.open247 ? 'branch-card__status--open' : 'branch-card__status--closed'}`}>
                    <Clock size={13} /> {branch.open247 ? 'Open 24/7' : `Closes ${branch.closingTime}`}
                  </span>
                </div>
                <div className="branch-card__content">
                  <div className="branch-card__head">
                    <h3>{branch.name}</h3>
                    <span className="branch-card__area">{branch.area}</span>
                  </div>
                  <div className="branch-card__body">
                    <div className="branch-card__row"><MapPin size={15} /><span>{branch.address}</span></div>
                    <div className="branch-card__row"><Clock size={15} /><span>{branch.hours}</span></div>
                  </div>
                  <div className="branch-card__services">
                    {branch.services.map((s) => {
                      const Icon = serviceIcons[s] ?? Clock;
                      return <span className="branch-card__service" key={s}><Icon size={12} /> {s}</span>;
                    })}
                  </div>
                  <div className="branch-card__actions">
                    <a href={`tel:${branch.phone}`} className="branch-pill branch-pill--call">
                      <Phone size={15} /> Call branch
                    </a>
                    <a href={branch.mapsLink} target="_blank" rel="noreferrer" className="branch-pill branch-pill--directions">
                      <Navigation size={15} /> Get directions
                    </a>
                    <button className="branch-pill branch-pill--services" onClick={() => setServicesBranch(branch.name)}>
                      <Stethoscope size={15} /> View services <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Services detail modal */}
      {activeBranch && (
        <div className="modal-overlay" onClick={() => setServicesBranch(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3>{activeBranch.name} — In-store services</h3>
              <button className="modal__close" onClick={() => setServicesBranch(null)}>×</button>
            </div>
            <div className="branch-modal">
              <div className="branch-modal__info">
                <MapPin size={16} /> <span>{activeBranch.address}</span>
              </div>
              <div className="branch-modal__hours">
                <Clock size={16} /> <span>{activeBranch.hours}</span>
              </div>
              <div className="branch-modal__services">
                {activeBranch.services.map((s) => {
                  const Icon = serviceIcons[s] ?? Clock;
                  return (
                    <div className="branch-modal__service" key={s}>
                      <div className="branch-modal__service-icon"><Icon size={18} /></div>
                      <div>
                        <strong>{s}</strong>
                        <p>{s === 'In-store Pharmacist Consultation'
                          ? 'Speak privately with a licensed pharmacist about your medications, dosage, and side effects — no appointment needed.'
                          : s === 'Prescription Pickup'
                          ? 'Collect your online orders at the branch counter. Simply present your order number at the pharmacy desk.'
                          : s === '24/7 Pickup Locker'
                          ? 'Collect prescriptions any time, day or night, from our secure self-service pickup lockers.'
                          : s === 'Drive-thru Collection'
                          ? 'Pull up to our drive-thru window and we\'ll bring your order to your car — no parking needed.'
                          : s === 'Blood Pressure Checks'
                          ? 'Free blood pressure screening by our trained pharmacy staff. Walk in any time during business hours.'
                          : 'Pay conveniently with M-Pesa at the counter for any in-store purchase.'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <a href={`tel:${activeBranch.phone}`} className="btn btn--primary branch-modal__call">
                <Phone size={16} /> Call {activeBranch.phone.replace('+254', '+254 ')}
              </a>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
