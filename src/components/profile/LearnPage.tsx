import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LearnPageProps {
  onBack: () => void;
}

const LearnPage: React.FC<LearnPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Emergency Learning</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Intro Video - First Aid Basics */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📚 Emergency First Aid Basics</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/BLEPakj1YTY"
              title="First Aid Training"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* 1. Health Emergencies */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-4">1. Health Emergencies</h2>
          
          <div className="space-y-4">
            {/* Fainting */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">• Fainting</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Lay the person flat, raise their legs slightly, and loosen tight clothing. 
                If they don't regain consciousness within a minute, call for medical help.
              </p>
            </div>

            {/* Bleeding */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">• Bleeding</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Apply firm pressure with a clean cloth on the wound. Do not remove the cloth 
                if blood soaks through — add another layer on top. Keep the injured part raised 
                above heart level if possible.
              </p>
            </div>

            {/* Burns */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">• Burns (Minor)</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Cool the area with clean running water for at least 10 minutes. Do not apply 
                toothpaste, oil, or butter. Cover lightly with a sterile gauze.
              </p>
            </div>

            {/* Fractures */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">• Fractures</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Don't move the injured part unnecessarily. Immobilize it with a cloth or board 
                as a temporary splint. Call for an ambulance.
              </p>
            </div>

            {/* CPR */}
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">• CPR (Cardiopulmonary Resuscitation)</h3>
              <ul className="text-gray-700 text-sm leading-relaxed space-y-1 ml-4">
                <li>→ Check responsiveness and breathing</li>
                <li>→ Place hands at the center of the chest</li>
                <li>→ Push hard and fast (about 100–120 compressions per minute)</li>
                <li>→ Continue until the person breathes or help arrives</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CPR Video */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">❤️ How to Perform CPR</h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/5VcSwejU2D0"
              title="CPR Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* 2. Fire Emergencies */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-orange-600 mb-4">2. Fire Emergencies</h2>
          
          <div className="space-y-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Steps to Remember:</h3>
              <ol className="text-gray-700 text-sm space-y-2 ml-4">
                <li>1. Raise an alarm immediately and help people evacuate</li>
                <li>2. Call the fire department (101) without delay</li>
                <li>3. If a person's clothes catch fire: <strong>Stop, Drop, and Roll</strong></li>
                <li>4. For small fires:
                  <ul className="ml-4 mt-1">
                    <li>• Use a fire extinguisher if trained</li>
                    <li>• Aim at the base of the flames, not the top</li>
                  </ul>
                </li>
                <li>5. Never use water on electrical or oil fires</li>
                <li>6. Close doors behind you while leaving to prevent fire spread</li>
                <li>7. Move to a safe distance and wait for responders</li>
                <li>8. If trapped, cover your nose with cloth and stay low to avoid smoke</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Fire Safety Video */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">🔥 Fire Safety & Prevention</h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/5VcSwejU2D0"
              title="Fire Safety"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* 3. Threat Situations */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-purple-600 mb-4">3. Threat Situations</h2>
          <p className="text-sm text-gray-600 mb-3">(Violence, Suspicious Activity, or Security Threats)</p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-purple-400 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">How to Respond:</h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li>• Stay calm — panic spreads confusion</li>
                <li>• Do not confront armed or aggressive persons</li>
                <li>• Immediately report through the RRR app and to local authorities</li>
                <li>• Avoid rumors or unverified alerts; share only confirmed information</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">If you hear explosions or gunshots:</h3>
              <ul className="text-gray-700 text-sm space-y-1 ml-4">
                <li>→ <strong>Run</strong> to safety if possible</li>
                <li>→ <strong>Hide</strong> behind solid objects (walls, concrete)</li>
                <li>→ Silence your phone and stay quiet until it's safe</li>
              </ul>
            </div>

            <div className="text-gray-700 text-sm space-y-2">
              <p>• Help others evacuate only if it doesn't put your life at risk</p>
              <p>• After threat clearance, assist with first aid and reporting</p>
            </div>
          </div>
        </div>

        {/* Active Shooter Video */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">⚠️ Run, Hide, Fight - Active Threat Response</h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/5VcSwejU2D0"
              title="Run Hide Fight"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* 4. Natural Disasters & Accidents */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-blue-600 mb-4">4. Natural Disasters & Accidents</h2>
          
          {/* Floods */}
          <div className="mb-4 border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-gray-800 mb-2">Floods</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Move to higher ground immediately</li>
              <li>• Avoid walking or driving through floodwaters</li>
              <li>• Disconnect electrical appliances</li>
              <li>• Help elderly and children to safety</li>
            </ul>
          </div>

          {/* Earthquakes */}
          <div className="mb-4 border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-gray-800 mb-2">Earthquakes</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• <strong>Drop, Cover, and Hold On</strong> under a sturdy table</li>
              <li>• Stay away from windows and heavy objects</li>
              <li>• Once shaking stops, move to an open area</li>
              <li>• Check for injuries and hazards before helping others</li>
            </ul>
          </div>

          {/* Storms */}
          <div className="mb-4 border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-gray-800 mb-2">Storms or Strong Winds</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Stay indoors; keep away from windows</li>
              <li>• Unplug electrical items</li>
              <li>• Avoid using mobile phones plugged into chargers</li>
            </ul>
          </div>

          {/* Road Accidents */}
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-semibold text-gray-800 mb-2">Road Accidents</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Check surroundings for safety before approaching</li>
              <li>• Do not move the injured unless there's fire or danger</li>
              <li>• Call emergency services</li>
              <li>• Provide first aid (stop bleeding, maintain airway)</li>
              <li>• Note vehicle numbers and report to authorities</li>
            </ul>
          </div>
        </div>

        {/* Earthquake Safety Video */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">🌍 Earthquake Safety</h3>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/BLEPakj1YTY"
              title="Earthquake Safety"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="bg-red-600 text-white rounded-xl p-5 shadow-lg">
          <h2 className="text-xl font-bold mb-3">Emergency Contact Numbers</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="font-semibold">Police</p>
              <p className="text-2xl font-bold">100</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="font-semibold">Fire</p>
              <p className="text-2xl font-bold">101</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="font-semibold">Ambulance</p>
              <p className="text-2xl font-bold">108</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="font-semibold">Disaster</p>
              <p className="text-2xl font-bold">112</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LearnPage;  // ← ADD THIS LINE

