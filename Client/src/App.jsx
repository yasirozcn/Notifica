/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { postRequest } from './api';
import StationsSelect from './components/StationSelect';
import HourChoices from './components/HourChoices';
import stationsJson from './stations.json';
import './App.css';
import NavBar from './components/NavBar';

const SEFER_URL = "https://api-yebsp.tcddtasimacilik.gov.tr/sefer/seferSorgula";

const App = () => {
    const [stations, setStations] = useState({});
    const [selectedStations, setSelectedStations] = useState({
        binisIstasyonAdi: "",
        inisIstasyonAdi: "",
    });
    const [date, setDate] = useState("");
    const [journeys, setJourneys] = useState([]);
    const [selectedHours, setSelectedHours] = useState([]);
    const [business, setBusiness] = useState(false);

    const toggleHandler = () => {
        setBusiness((prevState) => !prevState);
      };
    // İstasyondan verilerini yükleme
    useEffect(() => {
        setStations(stationsJson);
    },[]);

    function formatDateToTCDDFormat(dateString) {
        const date = new Date(dateString);
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${day}, ${year} 00:00:00 AM`;
    }
    
    
    // Sefer sorgulama
    async function fetchJourneys() {
        if (!selectedStations.binisIstasyonAdi || !selectedStations.inisIstasyonAdi || !date) {
            alert("Lütfen tüm bilgileri doldurun!");
            return;
        }
        const body = {
            kanalKodu: 3,
            dil: 0,
            seferSorgulamaKriterWSDVO: {
                satisKanali: 3,
                binisIstasyonu: selectedStations.binisIstasyonAdi,
                inisIstasyonu: selectedStations.inisIstasyonAdi,
                binisIstasyonId: stationsJson[selectedStations.binisIstasyonAdi],
                inisIstasyonId: stationsJson[selectedStations.inisIstasyonAdi],
                binisIstasyonu_isHaritaGosterimi: false,
                inisIstasyonu_isHaritaGosterimi: false,
                seyahatTuru: 1,
                gidisTarih: date,
                bolgeselGelsin: false,
                islemTipi: 0,
                yolcuSayisi: 1,
                aktarmalarGelsin: true,
            },
        };
        const response = await postRequest(SEFER_URL, body);
        console.log(response);
        if (response && response.cevapBilgileri.cevapKodu === '000') {
            setJourneys(response.seferSorgulamaSonucList);
        } else {
            console.error("No journeys found:", response);
        }
    }

    return (
        <div className='flex flex-col h-screen items-center'>
            <NavBar />
            <div>
            <StationsSelect
                stations={stations}
                selectedStations={selectedStations}
                setSelectedStations={setSelectedStations}
            />
            <input
                type="date"
                onChange={(e) => setDate(formatDateToTCDDFormat(e.target.value))}
            />
            <div className="toggle-container" onClick={toggleHandler}>
                <div className={`toggle-switch ${business ? "active" : ""}`}>
                    <div className="toggle-knob"></div>
                </div>
                <span className="toggle-label">
                    {business ? "Business Class Tickets: ON" : "Business Class Tickets: OFF"}
                </span>
            </div>
            <button onClick={fetchJourneys} className='bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded'>Find Journeys</button>
            <HourChoices
                journeys={journeys}
                selectedHours={selectedHours}
                setSelectedHours={setSelectedHours}
                business={business}
            />
        </div>
        </div>
    );
};

export default App;
