import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostAdPage.css';
import Avtobusu from '../../images/avtobusu.png'
import Lehkovi from '../../images/lehkovi.png';
import Vantashni from '../../images/vantashni.png';
import Komertsini from '../../images/komertsini.png';
import Moto from '../../images/moto.png';
import Spestehnika from '../../images/spestehnika.png';
import Pruchepu from '../../images/pruchepu.png';
import Vodnui from '../../images/vodnui.png';

const API = 'http://localhost:5174/api';

const decodeToken = (token: string) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

type Step = 'type' | 'form' | 'photos' | 'success';

const STAGES = ['Новий', 'Вживаний'];

interface Option { id: number; name: string; }
interface BrandVm { id: number; name: string; models: Option[]; }
interface RegionVm { id: number; name: string; cities: Option[]; }
interface EngineVolumeVm { id: number; volume: string; }
interface NumberOfSeatsVm { id: number; number: number; seatType: string; }

const defaultForm = {
    transportType: '',
    stage: STAGES[1],
    carBrand: '',
    carModel: '',
    bodyType: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    fuelTypes: '',
    transmissionType: '',
    engineVolume: '',
    numberOfSeats: '',
    color: '',
    city: '',
    vin: '',
    description: '',
};

const PostAdPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = token ? decodeToken(token)?.id : null;

    // ── Redirect to auth if not logged in ──
    useEffect(() => {
        if (!userId) {
            navigate('/auth');
        }
    }, [userId, navigate]);

    const [step, setStep] = useState<Step>('type');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ ...defaultForm });
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const [transportTypes, setTransportTypes] = useState<Option[]>([]);
    const [brands, setBrands] = useState<BrandVm[]>([]);
    const [models, setModels] = useState<Option[]>([]);
    const [bodyTypes, setBodyTypes] = useState<Option[]>([]);
    const [fuelTypes, setFuelTypes] = useState<Option[]>([]);
    const [transmissions, setTransmissions] = useState<Option[]>([]);
    const [engineVolumes, setEngineVolumes] = useState<EngineVolumeVm[]>([]);
    const [numberOfSeats, setNumberOfSeats] = useState<NumberOfSeatsVm[]>([]);
    const [cities, setCities] = useState<Option[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [tt, bm, bt, ft, tr, ev, ns, reg] = await Promise.all([
                    axios.get(`${API}/TechnicalSpecifications/transporttypes`),
                    axios.get(`${API}/TechnicalSpecifications/brandsandmodels`),
                    axios.get(`${API}/TechnicalSpecifications/bodytypes`),
                    axios.get(`${API}/TechnicalSpecifications/fueltypes`),
                    axios.get(`${API}/TechnicalSpecifications/transmissiontypes`),
                    axios.get(`${API}/TechnicalSpecifications/enginevolumes`),
                    axios.get(`${API}/TechnicalSpecifications/numberofseats`),
                    axios.get(`${API}/RegionalAndPricing`),
                ]);
                setTransportTypes(tt.data || []);
                setBrands(bm.data || []);
                setBodyTypes(bt.data || []);
                setFuelTypes(ft.data || []);
                setTransmissions(tr.data || []);
                setEngineVolumes(ev.data || []);
                setNumberOfSeats(ns.data || []);
                const allCities: Option[] = [];
                (reg.data as RegionVm[]).forEach(r =>
                    r.cities?.forEach(c => allCities.push(c))
                );
                setCities(allCities);
            } catch (e) {
                console.error('Error fetching dropdowns', e);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        const found = brands.find(b => b.name === form.carBrand);
        setModels(found?.models || []);
        setForm(f => ({ ...f, carModel: '' }));
    }, [form.carBrand, brands]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target;
        setForm(f => ({ ...f, [target.name]: target.value }));
    };

    const handleClear = () => {
        setForm({ ...defaultForm, transportType: form.transportType });
    };

    const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPhotos(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => setPhotoPreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (idx: number) => {
        setPhotos(p => p.filter((_, i) => i !== idx));
        setPhotoPreviews(p => p.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!userId) { navigate('/auth'); return; }
        if (photos.length === 0) { setError('Додайте хоча б одне фото'); return; }

        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('UserId', userId);
            formData.append('TransportType', form.transportType);
            formData.append('Stage', form.stage);
            formData.append('CarBrand', form.carBrand);
            formData.append('CarModel', form.carModel);
            formData.append('BodyType', form.bodyType);
            formData.append('Year', String(form.year));
            formData.append('Mileage', String(form.mileage));
            formData.append('Price', String(form.price));
            formData.append('FuelTypes', form.fuelTypes);
            formData.append('TransmissionType', form.transmissionType);
            formData.append('EngineVolume', form.engineVolume);
            formData.append('NumberOfSeats', form.numberOfSeats || '5');
            formData.append('Color', form.color);
            formData.append('City', form.city);
            formData.append('Vin', form.vin);
            formData.append('Description', form.description);
            formData.append('HasAirConditioning', 'false');
            formData.append('HasHeatedSeats', 'false');
            formData.append('HasPowerWindows', 'false');
            formData.append('HasPowerSteering', 'false');
            formData.append('HasLeatherInterior', 'false');
            formData.append('Metallic', 'false');
            formData.append('IsBargainAvailable', 'false');
            formData.append('IsExchangeAvailable', 'false');
            formData.append('AccidentParticipation', 'false');
            formData.append('HasHeadlights', 'false');
            formData.append('HasHeightAdjustableSeats', 'false');
            formData.append('HasPremiumInteriorColor', 'false');
            formData.append('HasSeatMemory', 'false');
            formData.append('HasSeatVentilation', 'false');
            formData.append('HasSpareWheel', 'false');
            formData.append('IsInstallmentAvailable', 'false');
            formData.append('IsNotCustomsCleared', 'false');
            photos.forEach(p => formData.append('Photos', p));

            await axios.post(`${API}/Car/add`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStep('success');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data || 'Помилка при додаванні оголошення';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    // Якщо не авторизований — нічого не рендеримо (useEffect вже перекинув)
    if (!userId) return null;

    // ── STEP: type ──
    // SVG іконки транспорту — точно за дизайном
    const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
        'Легковий': <img src={Lehkovi} width={38} height={15} alt="car" />,
        'Легкові':  <img src={Lehkovi} width={38} height={15} alt="car" />,
        'Вантажний': <img src={Vantashni} width={38} height={18} alt="car" />,
        'Вантажні':  <img src={Vantashni} width={38} height={18} alt="car" />,
        'Комерційний': <img src={Komertsini} width={36} height={16} alt="car" />,
        'Комерційні':  <img src={Komertsini} width={36} height={16} alt="car" />,
        'Автобус':  <img src={Avtobusu} width={36} height={15} alt="car" />,
        'Автобуси': <img src={Avtobusu} width={36} height={15} alt="car" />,
        'Мото': <img src={Moto} width={36} height={18} alt="car" />,
        'Спецтехніка': <img src={Spestehnika} width={36} height={18} alt="car" />,
        'Причіп':  <img src={Pruchepu} width={36} height={18} alt="car" />,
        'Причепи': <img src={Pruchepu} width={36} height={18} alt="car" />,
        'Водний': <img src={Vodnui} width={36} height={18} alt="car" />,
        'Водні':  <img src={Vodnui} width={36} height={18} alt="car" />,
    };

    const getTransportIcon = (name: string): React.ReactNode => {
        if (TRANSPORT_ICONS[name]) return TRANSPORT_ICONS[name];
        const key = Object.keys(TRANSPORT_ICONS).find(k =>
            k.toLowerCase().startsWith(name.toLowerCase().slice(0, 4)) ||
            name.toLowerCase().startsWith(k.toLowerCase().slice(0, 4))
        );
        return key ? TRANSPORT_ICONS[key] : TRANSPORT_ICONS['Легкові'];
    };

    if (step === 'type') return (
        <div className="post-ad-page">
            <div className="post-ad-card">
                <h2 className="post-ad-title">Продати</h2>
                <p className="post-ad-sub">Оберіть тип транспортного засобу</p>
                <div className="transport-grid">
                    {transportTypes.map(t => (
                        <button
                            key={t.id}
                            className={`transport-btn ${form.transportType === t.name ? 'active' : ''}`}
                            onClick={() => setForm(f => ({ ...f, transportType: t.name }))}
                        >
                            <span className="transport-icon">{getTransportIcon(t.name)}</span>
                            <span>{t.name}</span>
                        </button>
                    ))}
                </div>
                <div className="post-ad-footer">
                    <button
                        className="post-ad-next"
                        disabled={!form.transportType}
                        onClick={() => setStep('form')}
                    >
                        Далі →
                    </button>
                </div>
            </div>
        </div>
    );

    // ── STEP: photos ──
    if (step === 'photos') return (
        <div className="post-ad-page">
            <div className="post-ad-card">
                <button className="post-ad-back" onClick={() => setStep('form')}>← Назад</button>
                <h2 className="post-ad-title">Фото автомобіля</h2>
                <p className="post-ad-sub">Завантажте фото (JPEG, PNG, WEBP). Максимальний розмір: 25 МБ</p>

                <div className="photo-upload-area">
                    <label className="photo-upload-label">
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
                        <div className="photo-upload-placeholder">
                            <span style={{ fontSize: 32 }}>⬆</span>
                            <p>Завантажте фото або перетягніть сюди</p>
                            <p style={{ fontSize: 12, color: '#aaa' }}>JPEG, PNG, WEBP · до 25 МБ</p>
                        </div>
                    </label>
                </div>

                {photoPreviews.length > 0 && (
                    <div className="photo-previews">
                        {photoPreviews.map((src, i) => (
                            <div key={i} className="photo-preview-item">
                                <img src={src} alt={`photo-${i}`} />
                                <button className="photo-remove" onClick={() => removePhoto(i)}>×</button>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div className="post-ad-error">{error}</div>}

                <div className="post-ad-footer">
                    <button className="post-ad-next" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Публікація...' : 'Опублікувати оголошення'}
                    </button>
                </div>
            </div>
        </div>
    );

    // ── STEP: success ──
    if (step === 'success') return (
        <div className="post-ad-page">
            <div className="post-ad-card post-ad-success">
                <div style={{ fontSize: 56 }}>✅</div>
                <h2>Ваше оголошення було успішно додано!</h2>
                <p>Ви можете переглянути та відредагувати його у вашому профілі.</p>
                <div className="post-ad-footer" style={{ justifyContent: 'center', gap: 12 }}>
                    <button className="post-ad-next" onClick={() => navigate('/account/ads')}>Перейти до профілю</button>
                    <button className="post-ad-outline" onClick={() => {
                        setForm({ ...defaultForm });
                        setPhotos([]);
                        setPhotoPreviews([]);
                        setStep('type');
                    }}>
                        Додати ще одне
                    </button>
                </div>
            </div>
        </div>
    );

    // ── STEP: form ──
    return (
        <div className="post-ad-page">
            <div className="post-ad-card">
                <div className="post-ad-header-row">
                    <button className="post-ad-back" onClick={() => setStep('type')}>← Назад</button>
                    <h2 className="post-ad-title">Введіть параметри</h2>
                    <button className="post-ad-clear" onClick={handleClear}>Очистити все ×</button>
                </div>

                <section className="form-section">
                    <h3 className="form-section-title">Основне</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Стан</label>
                            <select name="stage" value={form.stage} onChange={handleChange}>
                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Тип кузова</label>
                            <select name="bodyType" value={form.bodyType} onChange={handleChange}>
                                <option value="">Оберіть</option>
                                {bodyTypes.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Марка</label>
                            <select name="carBrand" value={form.carBrand} onChange={handleChange}>
                                <option value="">Оберіть марку</option>
                                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Модель</label>
                            <select name="carModel" value={form.carModel} onChange={handleChange} disabled={!form.carBrand}>
                                <option value="">Оберіть модель</option>
                                {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title">Модифікація</h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Рік</label>
                            <input type="number" name="year" value={form.year} onChange={handleChange} min={1900} max={new Date().getFullYear()} />
                        </div>
                        <div className="form-field">
                            <label>Пробіг (км)</label>
                            <input type="number" name="mileage" value={form.mileage} onChange={handleChange} min={0} />
                        </div>
                        <div className="form-field">
                            <label>Ціна ($)</label>
                            <input type="number" name="price" value={form.price} onChange={handleChange} min={0} />
                        </div>
                        <div className="form-field">
                            <label>Тип палива</label>
                            <select name="fuelTypes" value={form.fuelTypes} onChange={handleChange}>
                                <option value="">Оберіть</option>
                                {fuelTypes.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Коробка передач</label>
                            <select name="transmissionType" value={form.transmissionType} onChange={handleChange}>
                                <option value="">Оберіть</option>
                                {transmissions.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Об'єм двигуна</label>
                            <select name="engineVolume" value={form.engineVolume} onChange={handleChange}>
                                <option value="">Оберіть</option>
                                {engineVolumes.map(e => <option key={e.id} value={e.volume}>{e.volume}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Кількість місць</label>
                            <select name="numberOfSeats" value={form.numberOfSeats} onChange={handleChange}>
                                <option value="">Оберіть</option>
                                {numberOfSeats.map(n => (
                                    <option key={n.id} value={String(n.number)}>
                                        {n.number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Місто</label>
                            <select name="city" value={form.city} onChange={handleChange}>
                                <option value="">Оберіть місто</option>
                                {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Колір</label>
                            <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="Колір" />
                        </div>
                        <div className="form-field">
                            <label>VIN-код</label>
                            <input type="text" name="vin" value={form.vin} onChange={handleChange} placeholder="VIN" />
                        </div>
                    </div>

                    <div className="form-field" style={{ marginTop: 12 }}>
                        <label>Опис</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Опишіть автомобіль..." />
                    </div>
                </section>

                {error && <div className="post-ad-error">{error}</div>}

                <div className="post-ad-footer">
                    <button className="post-ad-next" onClick={() => setStep('photos')}>
                        Далі: Додати фото →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostAdPage;
