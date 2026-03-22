import { Clock, Mail, MapPin, Phone, User } from "lucide-react";

export default function SchoolInfo() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Lord's International School Group
        </h2>
        <p className="text-blue-200">
          Established 1985 &bull; Excellence in Education
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-3">About the School</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Lord's International School Group is one of the premier educational
          institutions, committed to providing quality education and holistic
          development of students. With state-of-the-art facilities, experienced
          faculty, and a focus on both academics and extracurricular activities,
          Lord's International School Group has been shaping young minds for
          over four decades.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Principal's Message
        </h3>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
            SK
          </div>
          <div>
            <p className="font-medium text-gray-800">Dr. Sunita Kapoor</p>
            <p className="text-xs text-gray-400 mb-3">
              Principal, Lord's International School Group
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              "Education is not just about academic excellence but about
              building character, fostering creativity, and developing a love
              for learning. At Lord's International School Group, we strive to
              create an environment where every student can discover their
              potential and grow into responsible citizens."
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Contact Information
        </h3>
        <div className="space-y-3">
          {[
            {
              icon: MapPin,
              label: "Address",
              value: "Sector 12, Dwarka, New Delhi - 110075",
            },
            { icon: Phone, label: "Phone", value: "+91 11 2589 3456" },
            { icon: Mail, label: "Email", value: "info@lordsgroup.edu.in" },
            {
              icon: Clock,
              label: "School Hours",
              value: "Mon-Sat: 8:00 AM - 2:30 PM",
            },
            { icon: User, label: "Principal", value: "Dr. Sunita Kapoor" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
