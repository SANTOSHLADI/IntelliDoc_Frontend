export default function AadhaarCardView({ data }) {
  const formatAddress = (addr) => {
    if (!addr) return ''
    if (typeof addr === 'string') return addr
    return Object.values(addr).filter(Boolean).join(', ')
  }

  const fields = [
    { label: 'Name', value: data.name },
    { label: 'Enrollment No.', value: data.enrollment_no || 'XXXX/XXXXX/XXXXX' },
    { label: 'Address', value: formatAddress(data.address) },
    { label: 'Aadhaar No.', value: data.aadhaar_number },
  ].filter((f) => f.value)

  return (
    <div className="my-4 max-w-2xl space-y-6">
      {/* Card Details */}
      <div className="rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Aadhaar Card</h2>
          <p className="mt-1 text-sm font-semibold text-[#214aa6]">Government of India</p>
          <p className="mt-0.5 text-sm font-bold text-[#214aa6]">Unique Identification Authority of India</p>
          <p className="mt-1 text-xs text-slate-500">This is an Aadhaar card issued by the Government of India.</p>
        </div>
        <div className="divide-y divide-slate-100 px-5 py-2">
          {fields.map(({ label, value }) => (
            <div key={label} className="py-3">
              <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
              <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section — English */}
      <div className="rounded border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
        <p className="mb-3 text-xs text-slate-500">
          Aadhaar is a proof of identity, not of citizenship. Verify identity using Secure QR Code / Offline XML / Online
          Authentication. This is electronically generated letter.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Aadhaar is valid throughout the country.</li>
          <li>Aadhaar helps you avail various Government and non-Government services easily.</li>
          <li>Keep your mobile number &amp; email ID updated in Aadhaar.</li>
          <li>Carry Aadhaar in your smart phone - use mAadhaar App.</li>
        </ul>
      </div>

      {/* Info Section — Telugu */}
      <div className="rounded border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
        <p className="mb-1 font-semibold text-slate-700">Aadhaar card details in Telugu:</p>
        <p className="mb-3 text-xs text-slate-500">
          ఆధార్ ఒక గుర్తింపు మాత్రమే గుర్తిస్తుంది కాదు సురక్షితమైన క్యూఆర్ కోడ్ / ఆఫ్‌లైన్ ఎక్స్‌ఎమ్‌ఎల్ / ఆన్‌లైన్
          ప్రామాణీకరణను ఉపయోగించి గుర్తింపును ధృవీకరించండి. ఇది ఎలక్ట్రానికా జనరేట్ చేయబడిన లేఖ.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>ఆధార్ దేశవ్యాప్తంగా చెల్లుబాటు అవుతుంది.</li>
          <li>వివిధ ప్రభుత్వ మరియు ప్రభుత్వేతర సేవలను సులభంగా పొందడానికి ఆధార్ మీకు సహాయపడుతుంది.</li>
          <li>ఆధార్‌లో మీ మొబైల్ నంబర్ మరియు ఇమెయిల్ ఐడీని అప్‌డేట్ చేయండి.</li>
          <li>మీ స్మార్ట్‌ఫోన్‌లో ఆధారను మోసుకెళ్ళండి - mAadhaar యాప్‌ను ఉపయోగించండి.</li>
        </ul>
      </div>
    </div>
  )
}
