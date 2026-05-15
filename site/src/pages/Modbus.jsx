import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import GifCard from '../components/GifCard'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Modbus() {
  const analogy = ANALOGIES.modbus

  return (
    <ChapterLayout chapterId="modbus" title="Analyzing Modbus on the Wire" prev="dissectors" next="dnp3">
      <p className="text-lg text-slate-300 leading-relaxed">
        Modbus TCP is the easiest OT protocol to analyze in Wireshark because it's also the most transparent: no authentication, no encryption, no sequence number validation. Every function code, every register address, every data value is in plaintext. The wire tells you exactly what happened. This is either a dream for analysis or a nightmare for security, depending on which side of an incident you're on.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Modbus TCP Frame Structure</h2>

      <p>
        Modbus TCP wraps the Modbus Application Data Unit (ADU) in a Modbus Application Protocol (MBAP) header. The MBAP header is 6 bytes. The PDU follows immediately.
      </p>

      <div className="font-mono text-xs rounded-xl overflow-hidden my-5" style={{ border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="px-4 py-2 text-center" style={{ background: 'rgba(14,165,233,0.08)', borderBottom: '1px solid rgba(14,165,233,0.15)', color: '#38bdf8', fontSize: '11px', fontFamily: 'sans-serif', letterSpacing: '0.1em', fontWeight: 'bold' }}>
          MODBUS TCP FRAME (Request: Read Holding Registers)
        </div>
        <div className="flex divide-x overflow-x-auto" style={{ borderColor: 'rgba(14,165,233,0.15)', background: 'rgba(2,8,20,0.95)' }}>
          {[
            { bytes: '00 01', label: 'Transaction ID', color: '#7dd3fc' },
            { bytes: '00 00', label: 'Protocol ID (0)', color: '#a5f3fc' },
            { bytes: '00 06', label: 'Length', color: '#67e8f9' },
            { bytes: '01', label: 'Unit ID', color: '#fbbf24' },
            { bytes: '03', label: 'FC (Read HR)', color: '#34d399' },
            { bytes: '00 00', label: 'Start Addr', color: '#f87171' },
            { bytes: '00 0A', label: 'Quantity (10)', color: '#c084fc' },
          ].map(({ bytes, label, color }) => (
            <div key={label} className="flex-1 min-w-0 p-3 text-center">
              <div className="font-mono text-xs mb-1" style={{ color }}>{bytes}</div>
              <div className="text-xs leading-tight" style={{ color: '#64748b', fontFamily: 'sans-serif' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Critical Function Codes</h2>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Function Codes</span>
        </div>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { fc: '01', hex: '0x01', name: 'Read Coils', risk: 'read', desc: 'Read discrete output status (on/off)' },
            { fc: '02', hex: '0x02', name: 'Read Discrete Inputs', risk: 'read', desc: 'Read discrete input status' },
            { fc: '03', hex: '0x03', name: 'Read Holding Registers', risk: 'read', desc: 'Most common — reads 16-bit registers' },
            { fc: '04', hex: '0x04', name: 'Read Input Registers', risk: 'read', desc: 'Read-only 16-bit registers' },
            { fc: '05', hex: '0x05', name: 'Write Single Coil', risk: 'write', desc: 'Set one coil ON or OFF' },
            { fc: '06', hex: '0x06', name: 'Write Single Register', risk: 'write', desc: 'Write one 16-bit holding register' },
            { fc: '0F', hex: '0x0F', name: 'Write Multiple Coils', risk: 'write', desc: 'Set multiple coils at once' },
            { fc: '10', hex: '0x10', name: 'Write Multiple Registers', risk: 'write', desc: 'Write multiple holding registers' },
          ].map(({ fc, hex, name, risk, desc }) => (
            <div key={fc} className="px-5 py-2.5 flex items-center gap-4">
              <code className="w-8 flex-shrink-0" style={{ color: '#7dd3fc' }}>{hex}</code>
              <span className="font-medium text-white flex-shrink-0 w-52">{name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 ${risk === 'write' ? 'bg-red-500/15 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>{risk}</span>
              <span className="text-slate-500 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Callout type="key" title="The Security Implication">
        Function codes 05, 06, 0F, and 10 are write operations. In Wireshark, filtering for <code>mbtcp.func_code in {"{5, 6, 15, 16}"}</code> shows every write command sent to your PLCs. In a healthy OT network, writes come from one or two known HMI IP addresses during specific operational modes. An unexpected write from an unknown IP at 2 AM is an incident.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Reading a Modbus Capture</h2>

      <p>
        A normal Modbus polling cycle looks like this in Wireshark:
      </p>

      <pre>{`No.   Time       Source         Destination    Protocol Info
1     0.000      192.168.1.10   192.168.1.100  Modbus/TCP  Query: Read Holding Registers (3), Unit: 1, Addr: 40001, Count: 10
2     0.003      192.168.1.100  192.168.1.10   Modbus/TCP  Response: Read Holding Registers (3), 10 words
3     5.000      192.168.1.10   192.168.1.100  Modbus/TCP  Query: Read Holding Registers (3), Unit: 1, Addr: 40001, Count: 10
4     5.003      192.168.1.100  192.168.1.10   Modbus/TCP  Response: Read Holding Registers (3), 10 words`}</pre>

      <p>
        Regular 5-second polling. Same address range. Same source IP. This is baseline behavior. Now compare an anomaly:
      </p>

      <pre>{`No.   Time       Source         Destination    Protocol Info
1     0.000      192.168.1.10   192.168.1.100  Modbus/TCP  Query: Read Holding Registers (3), Unit: 1, Addr: 40001, Count: 10
2     0.003      192.168.1.100  192.168.1.10   Modbus/TCP  Response: Read Holding Registers (3), 10 words
3     0.015      10.0.0.99      192.168.1.100  Modbus/TCP  Query: Write Multiple Registers (16), Unit: 1, Addr: 40100, Count: 50
4     0.018      192.168.1.100  10.0.0.99      Modbus/TCP  Response: Write Multiple Registers (16), Success`}</pre>

      <p>
        Line 3 is the anomaly: an unknown host (10.0.0.99) sent a Write Multiple Registers command to a different address range, 15 milliseconds after the normal poll. That's not baseline. That's worth investigating.
      </p>

      <GifCard gifKey="wire" caption="No encryption. No authentication. Wireshark sees all." side="right" />

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Modbus Exception Codes</h2>

      <p>
        When a slave rejects a request, it responds with a function code that has the high bit set (FC + 0x80). FC 3 becomes 0x83. The response includes an exception code byte:
      </p>

      <pre>{`# Exception response in display filter
mbtcp.func_code >= 128

# Common exception codes (in mbtcp.exceptcode field):
# 01 = Illegal Function     — FC not supported by this slave
# 02 = Illegal Data Address — Address doesn't exist
# 03 = Illegal Data Value   — Value out of allowed range
# 04 = Slave Device Failure — Device internal error`}</pre>

      <Callout type="field" title="Field Gotcha: Exception Code 02 Reveals Register Map">
        If you see an attacker (or a misconfigured HMI) probing a PLC with sequential Read Holding Register requests and getting Exception Code 02 (Illegal Data Address) responses, they're mapping the device's register space. Legitimate polling doesn't do this — it reads known addresses. A sweep of addresses looking for what responds is reconnaissance. Wireshark makes this visible with a simple filter.
      </Callout>

      <FunFact index={4} />

      <QuizLevels chapterId="modbus" />
    </ChapterLayout>
  )
}
