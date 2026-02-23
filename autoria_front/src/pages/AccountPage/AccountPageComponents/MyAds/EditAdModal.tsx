import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditAdModal.css';

const API = 'http://localhost:5174';

interface Option { id: number; name: string; }
interface BrandVm { id: number; name: string; models: Option[]; }
interface RegionVm { id: number; name: string; cities: Option[]; }
interface EngineVolumeVm { id: number; volume: string; }

interface CarFull {
    id: number;
    carBrand?: { name: string };
    carModel?: { name: string };
    transportType?: { name: string };
    bodyType?: { name: string };
    transmissionType?: { name: string };
    fuelTypes?: { name: string };
    engineVolume?: { volume: string };
    city?: { name: string };
    year?: number;
    mileage?: number;
    price?: number;
    vin?: string;
    stage?: string;
    description?: string;
    photos?: { name: string; priority: number }[];
}

interface Props {
    carId: number;
    token: string;
    onClose: () => void;
    onSaved: () => void;
}

const EditAdModal: React.FC<Props> = ({ carId, token, onClose, onSaved }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Dropdown data
    const [transportTypes, setTransportTypes] = useState<Option[]>([]);
    const [brands, setBrands] = useState<BrandVm[]>([]);
    const [models, setModels] = useState<Option[]>([]);
    const [bodyTypes, setBodyTypes] = useState<Option[]>([]);
    const [fuelTypes, setFuelTypes] = useState<Option[]>([]);
    const [transmissions, setTransmissions] = useState<Option[]>([]);
    const [engineVolumes, setEngineVolumes] = useState<EngineVolumeVm[]>([]);
    const [cities, setCities] = useState<Option[]>([]);

    const [form, setForm] = useState({
        transportType: '',
        stage: 'Вживаний',
        carBrand: '',
        carModel: '',
        bodyType: '',
        year: new Date().getFullYear(),
        mileage: 0,
        price: 0,
        fuelTypes: '',
        transmissionType: '',
        engineVolume: '',
        city: '',
        vin: '',
        description: '',
    });

    // Photos
    const [existingPhotos, setExistingPhotos] = useState<{ name: string; priority: number }[]>([]);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
    const [deletedPhotoNames, setDeletedPhotoNames] = useState<string[]>([]);

    // Load dropdowns
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [tt, bm, bt, ft, tr, ev, reg] = await Promise.all([
                    axios.get(`${API}/api/TechnicalSpecifications/transporttypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/brandsandmodels`),
                    axios.get(`${API}/api/TechnicalSpecifications/bodytypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/fueltypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/transmissiontypes`),
                    axios.get(`${API}/api/TechnicalSpecifications/enginevolumes`),
                    axios.get(`${API}/api/RegionalAndPricing`),
                ]);
                setTransportTypes(tt.data || []);
                setBrands(bm.data || []);
                setBodyTypes(bt.data || []);
                setFuelTypes(ft.data || []);
                setTransmissions(tr.data || []);
                setEngineVolumes(ev.data || []);
                const allCities: Option[] = [];
                (reg.data as RegionVm[]).forEach(r => r.cities?.forEach(c => allCities.push(c)));
                setCities(allCities);
            } catch (e) { console.error(e); }
        };
        loadDropdowns();
    }, []);

    // Load car data
    useEffect(() => {
        const loadCar = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/api/Car/${carId}`);
                const car: CarFull = res.data;
                setForm({
                    transportType: car.transportType?.name || '',
                    stage: car.stage || 'Вживаний',
                    carBrand: car.carBrand?.name || '',
                    carModel: car.carModel?.name || '',
                    bodyType: car.bodyType?.name || '',
                    year: car.year || new Date().getFullYear(),
                    mileage: car.mileage || 0,
                    price: car.price || 0,
                    fuelTypes: car.fuelTypes?.name || '',
                    transmissionType: car.transmissionType?.name || '',
                    engineVolume: car.engineVolume?.volume || '',
                    city: car.city?.name || '',
                    vin: car.vin || '',
                    description: car.description || '',
                });
                const sorted = [...(car.photos || [])].sort((a, b) => a.priority - b.priority);
                setExistingPhotos(sorted);
            } catch (e) {
                setError('Не вдалося завантажити дані оголошення');
            } finally {
                setLoading(false);
            }
        };
        loadCar();
    }, [carId]);

    // Оновлюємо моделі коли змінюється бренд
    useEffect(() => {
        const found = brands.find(b => b.name === form.carBrand);
        setModels(found?.models || []);
    }, [form.carBrand, brands]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: value,
            ...(name === 'carBrand' ? { carModel: '' } : {}),
        }));
    };

    const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewPhotos(p => [...p, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => setNewPhotoPreviews(p => [...p, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveExisting = (name: string) => {
        setDeletedPhotoNames(d => [...d, name]);
        setExistingPhotos(p => p.filter(ph => ph.name !== name));
    };

    const handleRemoveNew = (idx: number) => {
        setNewPhotos(p => p.filter((_, i) => i !== idx));
        setNewPhotoPreviews(p => p.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const formData = new FormData();
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
            formData.append('City', form.city);
            formData.append('Vin', form.vin);
            formData.append('Description', form.description);
            deletedPhotoNames.forEach(n => formData.append('DeletedPhotos', n));
            newPhotos.forEach(p => formData.append('Photos', p));

            await axios.put(`${API}/api/Car/${carId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess(true);
            setTimeout(() => { onSaved(); onClose(); }, 1200);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data || 'Помилка збереження';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="edit-modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>

                <div className="edit-modal-header">
                    <h2>✏️ Редагувати оголошення</h2>
                    <button className="edit-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="edit-modal-loading">Завантаження...</div>
                ) : (
                    <div className="edit-modal-body">

                        {/* Фото */}
                        <section className="edit-section">
                            <h3 className="edit-section-title">Фотографії</h3>
                            <div className="edit-photos-grid">
                                {existingPhotos.map(ph => (
                                    <div key={ph.name} className="edit-photo-item">
                                        <img src={`${API}/images/400_${ph.name}`} alt="" />
                                        <button
                                            className="edit-photo-remove"
                                            onClick={() => handleRemoveExisting(ph.name)}
                                            title="Видалити фото"
                                        >✕</button>
                                    </div>
                                ))}
                                {newPhotoPreviews.map((src, i) => (
                                    <div key={`new-${i}`} className="edit-photo-item new">
                                        <img src={src} alt="" />
                                        <button
                                            className="edit-photo-remove"
                                            onClick={() => handleRemoveNew(i)}
                                            title="Видалити фото"
                                        >✕</button>
                                        <span className="edit-photo-new-badge">Нове</span>
                                    </div>
                                ))}
                                <label className="edit-photo-add">
                                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddPhotos} />
                                    <span>+</span>
                                    <span>Додати</span>
                                </label>
                            </div>
                        </section>

                        {/* Основне */}
                        <section className="edit-section">
                            <h3 className="edit-section-title">Основне</h3>
                            <div className="edit-grid">
                                <div className="edit-field">
                                    <label>Стан</label>
                                    <select name="stage" value={form.stage} onChange={handleChange}>
                                        <option value="Новий">Новий</option>
                                        <option value="Вживаний">Вживаний</option>
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Тип транспорту</label>
                                    <select name="transportType" value={form.transportType} onChange={handleChange}>
                                        <option value="">Оберіть</option>
                                        {transportTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Марка</label>
                                    <select name="carBrand" value={form.carBrand} onChange={handleChange}>
                                        <option value="">Оберіть марку</option>
                                        {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Модель</label>
                                    <select name="carModel" value={form.carModel} onChange={handleChange} disabled={!form.carBrand}>
                                        <option value="">Оберіть модель</option>
                                        {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Тип кузова</label>
                                    <select name="bodyType" value={form.bodyType} onChange={handleChange}>
                                        <option value="">Оберіть</option>
                                        {bodyTypes.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Місто</label>
                                    <select name="city" value={form.city} onChange={handleChange}>
                                        <option value="">Оберіть місто</option>
                                        {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Характеристики */}
                        <section className="edit-section">
                            <h3 className="edit-section-title">Характеристики</h3>
                            <div className="edit-grid">
                                <div className="edit-field">
                                    <label>Рік</label>
                                    <input type="number" name="year" value={form.year} onChange={handleChange} min={1900} max={new Date().getFullYear()} />
                                </div>
                                <div className="edit-field">
                                    <label>Пробіг (км)</label>
                                    <input type="number" name="mileage" value={form.mileage} onChange={handleChange} min={0} />
                                </div>
                                <div className="edit-field">
                                    <label>Ціна ($)</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} min={0} />
                                </div>
                                <div className="edit-field">
                                    <label>Тип палива</label>
                                    <select name="fuelTypes" value={form.fuelTypes} onChange={handleChange}>
                                        <option value="">Оберіть</option>
                                        {fuelTypes.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Коробка передач</label>
                                    <select name="transmissionType" value={form.transmissionType} onChange={handleChange}>
                                        <option value="">Оберіть</option>
                                        {transmissions.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>Об'єм двигуна</label>
                                    <select name="engineVolume" value={form.engineVolume} onChange={handleChange}>
                                        <option value="">Оберіть</option>
                                        {engineVolumes.map(e => <option key={e.id} value={e.volume}>{e.volume}</option>)}
                                    </select>
                                </div>
                                <div className="edit-field">
                                    <label>VIN-код</label>
                                    <input type="text" name="vin" value={form.vin} onChange={handleChange} placeholder="VIN" />
                                </div>
                            </div>
                        </section>

                        {/* Опис */}
                        <section className="edit-section">
                            <h3 className="edit-section-title">Опис</h3>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Опишіть автомобіль..."
                                className="edit-textarea"
                            />
                        </section>

                        {error && <div className="edit-error">⚠ {error}</div>}
                        {success && <div className="edit-success">✓ Збережено!</div>}
                    </div>
                )}

                {!loading && (
                    <div className="edit-modal-footer">
                        <button className="edit-cancel-btn" onClick={onClose} disabled={saving}>
                            Скасувати
                        </button>
                        <button className="edit-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Збереження...' : '✓ Зберегти зміни'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditAdModal;
