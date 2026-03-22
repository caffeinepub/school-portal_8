import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";

const branches = [
  {
    name: "Lords International School, Alwar (Chikani)",
    description:
      "A prominent CBSE-affiliated day-cum-residential school located on the Alwar-Bhiwadi Highway.",
    details: [
      {
        icon: MapPin,
        label: "Address",
        value: "Alwar-Bhiwadi Highway, Chikani, Alwar, Rajasthan - 301028",
      },
      {
        icon: Building2,
        label: "City Office",
        value: "1st Floor, Signature Tower, Scheme 10, Alwar",
      },
      {
        icon: Phone,
        label: "Main School",
        value: "+91 9929011007 / +91 9509891624",
      },
      {
        icon: Phone,
        label: "Admission/Counseling",
        value: "+91 6350322874",
      },
      {
        icon: Mail,
        label: "Email",
        value: "info@lordsschool.edu.in / principallis2005@gmail.com",
      },
      {
        icon: Globe,
        label: "Website",
        value: "www.lordsschool.edu.in",
        href: "https://www.lordsschool.edu.in",
      },
    ],
  },
  {
    name: "Lords International School, Churu (Main City)",
    description:
      "A CBSE-affiliated senior secondary school serving the Churu district.",
    details: [
      {
        icon: MapPin,
        label: "Address",
        value: "Bhaleri Road, Churu, Rajasthan - 331001",
      },
      {
        icon: Phone,
        label: "Phone",
        value: "01562-2219328 / +91 9414423066",
      },
      {
        icon: Mail,
        label: "Email",
        value: "lis.churu@rediffmail.com / svermalords@gmail.com",
      },
      {
        icon: Globe,
        label: "Website",
        value: "www.lischuru.in / www.lordschuru.in",
        href: "https://www.lischuru.in",
      },
    ],
  },
  {
    name: "Lords International School, Sadulpur (Rajgarh)",
    description:
      "Located in the Rajgarh tehsil of Churu, this CBSE-affiliated branch is co-educational, offering classes from Primary to Senior Secondary.",
    details: [
      {
        icon: MapPin,
        label: "Address",
        value:
          "Hisar Road, Rajgarh (Sadulpur), Dist. Churu, Rajasthan - 331023",
      },
      {
        icon: Phone,
        label: "Phone",
        value: "+91 9414423066 / +91 9413204098",
      },
    ],
  },
];

export default function SchoolInfo() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Lord's International School Group
        </h2>
        <p className="text-blue-200">
          CBSE Affiliated &bull; Excellence in Education
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-3">About the Group</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Lord's International School Group is a group of CBSE-affiliated
          institutions spread across Rajasthan, committed to providing quality
          education and holistic development of students. With experienced
          faculty and a focus on both academics and extracurricular activities,
          Lord's International School Group has been shaping young minds across
          multiple campuses.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 text-lg px-1">
          Our Branches
        </h3>
        {branches.map((branch, idx) => (
          <div
            key={branch.name}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{branch.name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  {branch.description}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 pl-11">
              {branch.details.map(({ icon: Icon, label, value, href }: any) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
