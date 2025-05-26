import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './CycleTracker.css'
import { useTranslation } from 'react-i18next'

const CycleTracker: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [cycleInfo, setCycleInfo] = useState('')
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleDayClick = (date: Date) => {
        setSelectedDate(date)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedDate(null)
        setCycleInfo('')
    }

    const handleSave = () => {
       
        setShowModal(false)
        setSelectedDate(null)
        setCycleInfo('')
    }

    return (
        <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{t('cycleTracker.title')}</h2>
            <div className="calendar-wrapper">
                <Calendar onClickDay={handleDayClick} className="large-calendar" />
            </div>
            {showModal && selectedDate && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
                        <h3>{t('cycleTracker.day', { date: selectedDate.toLocaleDateString() })}</h3>
                        <div style={{ margin: '16px 0' }}>
                            <label>
                                {t('cycleTracker.noteLabel')}
                                <input
                                    type="text"
                                    value={cycleInfo}
                                    onChange={e => setCycleInfo(e.target.value)}
                                    placeholder={t('cycleTracker.notePlaceholder')}
                                    style={{ width: '100%', marginTop: 8, padding: 14, fontSize: 18 }}
                                />
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={handleCloseModal}>{t('cycleTracker.cancel')}</button>
                            <button onClick={handleSave} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>{t('cycleTracker.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}

export default CycleTracker
