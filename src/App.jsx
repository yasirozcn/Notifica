/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { postRequest } from './api';
import StationsSelect from './StationSelect';
import HourChoices from './HourChoices';
import stationsJson from './stations.json';

const STATIONS_URL = "https://api-yebsp.tcddtasimacilik.gov.tr/istasyon/istasyonYukle";
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
    console.log( "test",stationsJson.Arifiye );
    // İstasyondan verilerini yükleme
    useEffect(() => {
        async function fetchStations() {
            const body = {
                kanalKodu: "3",
                dil: 1,
                tarih: "Dec 10, 2011 12:00:00 AM",
                satisSorgu: true,
            };
            const response = await postRequest(STATIONS_URL, body);
            if (response && response.istasyonBilgileriList) {
                const stationsData = response.istasyonBilgileriList.reduce((acc, station) => {
                    acc[station.istasyonAdi] = station.istasyonId;
                    return acc;
                }, {});
                setStations(stationsData);
            } else {
                console.error("Failed to fetch station data:", response);
            }
        }
        fetchStations();
    }, []);
    console.log("istasyon", selectedStations.binisIstasyonAdi);
    console.log("istasyon2", selectedStations.inisIstasyonAdi);

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
                gidisTarih: "Dec 12, 2024 00:00:00 AM",
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
        <div>
            <StationsSelect
                stations={stations}
                selectedStations={selectedStations}
                setSelectedStations={setSelectedStations}
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={fetchJourneys}>Find Journeys</button>
            <HourChoices
                journeys={journeys}
                selectedHours={selectedHours}
                setSelectedHours={setSelectedHours}
            />
        </div>
    );
};

export default App;
