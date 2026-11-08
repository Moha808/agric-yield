import React, { useState } from 'react';
import { Mail, Send, MapPin, Phone, CheckCircle, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('Vom');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      village,
      message,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'contactMessages'), payload);
      setSubmitted(true);
      toast.success('Your message has been sent to the extension team!');
    } catch (err) {
      toast.error('Could not submit inquiry. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Contact Jos South Extension Support
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Have questions about potato blight outbreaks, soil testing, or IoT sensor setup in your village? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info Col */}
        <div className="bg-emerald-900 text-emerald-100 p-6 rounded-3xl space-y-5">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
            Field Offices
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> NRCRI Vom Station
              </p>
              <p className="text-emerald-300/90 mt-0.5">National Root Crops Research Institute, Vom, Jos South</p>
            </div>

            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> PADP Bukuru Office
              </p>
              <p className="text-emerald-300/90 mt-0.5">Plateau Agricultural Development Programme, Bukuru</p>
            </div>

            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" /> Farmer Helpline
              </p>
              <p className="text-emerald-300/90 font-mono mt-0.5">+234 803 000 JOS (567)</p>
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900">Thank You!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Your message has been safely received. An agricultural extension officer will respond to your village inquiry shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setMessage(''); }}
                className="mt-2 text-xs font-bold text-emerald-700 underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bitrus Pam"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Village in Jos South
                </label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                >
                  <option value="Vom">Vom</option>
                  <option value="Bukuru">Bukuru</option>
                  <option value="Du">Du</option>
                  <option value="Gyel">Gyel</option>
                  <option value="Tudun Wada">Tudun Wada</option>
                  <option value="Zawan">Zawan</option>
                  <option value="Kwata">Kwata</option>
                  <option value="Shen">Shen</option>
                  <option value="Kuru">Kuru</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Message / Inquiry
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your query, blight observation, or cooperative request..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer touch-target"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Message...' : 'Send Message to Extension Team'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
