import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Sparkles, Check, Heart, Clock, Compass } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Teknologi',
  'Bisnis',
  'Akademik',
  'Seni',
  'Musik',
  'Olahraga',
  'Sosial',
  'Kerohanian',
  'Kepemimpinan',
  'Lingkungan',
];

const HOBBY_SUGGESTIONS = [
  'Coding',
  'Bermain Musik',
  'Bernyanyi',
  'Membaca',
  'Fotografi',
  'Public Speaking',
  'Olahraga',
  'Desain',
];

const PREFERRED_TYPE_OPTIONS = [
  { id: 'seminar', label: 'Seminar & Workshop' },
  { id: 'organisasi', label: 'Kegiatan Organisasi' },
  { id: 'choir', label: 'Konser & Pelayanan Choir' },
  { id: 'ibadah', label: 'Ibadah Kampus & Asrama' },
  { id: 'asrama', label: 'Aktivitas Asrama' },
  { id: 'kompetisi', label: 'Lomba & Kompetisi' },
];

const TIME_SLOT_OPTIONS = [
  { id: 'weekday-morning', label: 'Senin - Kamis Pagi (08:00 - 12:00)' },
  { id: 'weekday-afternoon', label: 'Senin - Kamis Sore (15:00 - 18:00)' },
  { id: 'weekday-evening', label: 'Malam Hari (18:30 - 21:00)' },
  { id: 'sabbath', label: 'Sabbath / Sabtu (Ibadah & Fellowship)' },
  { id: 'weekend', label: 'Minggu (Olahraga & Kegiatan Luar)' },
];

export const OnboardingModal: React.FC = () => {
  const { currentUser, showOnboarding, setShowOnboarding, updateProfile } = useApp();

  const [interests, setInterests] = useState<string[]>(currentUser?.interests || ['teknologi', 'kerohanian']);
  const [hobbies, setHobbies] = useState<string[]>(currentUser?.hobbies || ['coding', 'membaca']);
  const [hobbyInput, setHobbyInput] = useState('');
  const [preferredEventTypes, setPreferredEventTypes] = useState<string[]>(
    currentUser?.preferredEventTypes || ['seminar', 'ibadah']
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>(
    currentUser?.availableSlots || ['weekday-afternoon', 'sabbath']
  );
  const [faculty, setFaculty] = useState(currentUser?.faculty || 'Fakultas Ilmu Komputer');
  const [studyProgram, setStudyProgram] = useState(currentUser?.studyProgram || 'Informatika');

  if (!showOnboarding) return null;

  const toggleInterest = (val: string) => {
    const lower = val.toLowerCase();
    setInterests(prev =>
      prev.includes(lower) ? prev.filter(x => x !== lower) : [...prev, lower]
    );
  };

  const togglePreferredType = (id: string) => {
    setPreferredEventTypes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSlot = (id: string) => {
    setAvailableSlots(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addHobby = () => {
    if (hobbyInput.trim()) {
      const lower = hobbyInput.trim().toLowerCase();
      if (!hobbies.includes(lower)) {
        setHobbies(prev => [...prev, lower]);
      }
      setHobbyInput('');
    }
  };

  const removeHobby = (h: string) => {
    setHobbies(prev => prev.filter(x => x !== h));
  };

  const handleSave = async () => {
    await updateProfile({
      interests,
      hobbies,
      preferredEventTypes,
      availableSlots,
      faculty,
      studyProgram,
      profileCompleted: true,
    });
    setShowOnboarding(false);
  };

  const handleSkip = async () => {
    await updateProfile({ profileCompleted: true });
    setShowOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E9E4EC] p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F1EBF5] text-[#402155] mx-auto border border-purple-200">
            <Sparkles className="w-6 h-6 text-[#D9B85F]" />
          </div>
          <h2 className="text-xl font-bold text-[#29242E]">Personalisasi Dashboard Anda</h2>
          <p className="text-xs text-[#706A75] max-w-md mx-auto">
            Bantu UNKLAB HUB merekomendasikan kegiatan kampus, ibadah, seminar, dan komunitas yang paling relevan dengan minat dan waktu Anda.
          </p>
        </div>

        {/* Section 1: Minat */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#29242E] flex items-center gap-1.5 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#80639A]" />
            1. Bidang Minat yang Anda Sukai (Pilih beberapa)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map(opt => {
              const selected = interests.includes(opt.toLowerCase());
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInterest(opt)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                    selected
                      ? 'bg-[#402155] text-white border-[#402155] font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-[#F1EBF5]'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-[#D9B85F]" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Hobi */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#29242E] flex items-center gap-1.5 uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-[#80639A]" />
            2. Hobi Anda (Ketik atau pilih saran)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hobbyInput}
              onChange={e => setHobbyInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHobby();
                }
              }}
              placeholder="Contoh: menyanyi, coding, basket..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#80639A]"
            />
            <button
              type="button"
              onClick={addHobby}
              className="px-3 py-1.5 bg-[#F1EBF5] text-[#402155] text-xs font-semibold rounded-lg hover:bg-purple-200"
            >
              Tambah
            </button>
          </div>

          {/* Existing tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hobbies.map(h => (
              <span
                key={h}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 text-[#402155] border border-purple-200 rounded-md"
              >
                <span>{h}</span>
                <button
                  type="button"
                  onClick={() => removeHobby(h)}
                  className="text-gray-400 hover:text-rose-600 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 items-center text-[11px] text-gray-500 pt-1">
            <span>Saran:</span>
            {HOBBY_SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const lower = s.toLowerCase();
                  if (!hobbies.includes(lower)) setHobbies(prev => [...prev, lower]);
                }}
                className="hover:underline text-[#402155] cursor-pointer"
              >
                +{s}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Jenis Kegiatan */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#29242E] flex items-center gap-1.5 uppercase tracking-wider">
            3. Format Kegiatan yang Paling Menarik Bagi Anda
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREFERRED_TYPE_OPTIONS.map(opt => {
              const selected = preferredEventTypes.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => togglePreferredType(opt.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selected
                      ? 'bg-[#F1EBF5] border-[#80639A] text-[#402155] font-semibold'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selected && <Check className="w-4 h-4 text-[#402155]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Waktu Luang */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#29242E] flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#80639A]" />
            4. Kapan Biasanya Anda Memiliki Waktu Luang? (Opsional)
          </label>
          <div className="space-y-1.5">
            {TIME_SLOT_OPTIONS.map(slot => {
              const selected = availableSlots.includes(slot.id);
              return (
                <div
                  key={slot.id}
                  onClick={() => toggleSlot(slot.id)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selected
                      ? 'bg-[#F1EBF5] border-[#80639A] text-[#402155] font-semibold'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{slot.label}</span>
                  {selected && <Check className="w-4 h-4 text-[#402155]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Fakultas & Prodi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
              Fakultas:
            </label>
            <input
              type="text"
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
              Program Studi / Unit:
            </label>
            <input
              type="text"
              value={studyProgram}
              onChange={e => setStudyProgram(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E9E4EC]">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 cursor-pointer"
          >
            Lewati untuk Sekarang
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#402155] text-white text-xs font-bold rounded-lg hover:bg-[#56366F] transition-all shadow-xs cursor-pointer"
          >
            Simpan Preferensi
          </button>
        </div>
      </div>
    </div>
  );
};
