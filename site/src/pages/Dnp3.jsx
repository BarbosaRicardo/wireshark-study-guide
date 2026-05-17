import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Dnp3() {
  const analogy = ANALOGIES.dnp3

  return (
    <ChapterLayout chapterId="dnp3" title="Analyzing DNP3 Traffic" prev="modbus" next="opcua">
      <p className="text-lg text-slate-300 leading-relaxed">
        DNP3 was designed for SCADA systems communicating with substations and remote field devices over unreliable serial links. It's layered (data link, transport, application), supports time-stamped data, and handles the reality that a remote RTU 50 miles away might not respond to every message. Understanding this architecture is what makes DNP3 captures readable.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">DNP3 Layer Architecture</h2>

      <p>
        DNP3 is a three-layer protocol stack compressed into what looks like two layers when running over TCP. Understanding each layer is essential for reading Wireshark's DNP3 dissector output correctly.
      </p>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { layer: 'Application Layer', field: 'dnp3.al.*', desc: 'Contains the function code (READ, WRITE, DIRECT OPERATE), object groups, and data. This is where the operational content lives.' },
            { layer: 'Transport Layer', field: 'dnp3.tr.*', desc: 'Fragments large application messages across multiple data link frames. Contains FIR (first) and FIN (final) bits to reassemble.' },
            { layer: 'Data Link Layer', field: 'dnp3.ctl.*', desc: 'Handles addressing (source/destination 16-bit addresses) and framing. Contains the start bytes 0x0564.' },
          ].map(({ layer, field, desc }) => (
            <div key={layer} className="px-5 py-3.5 flex gap-4 items-start">
              <div className="flex-shrink-0 w-40">
                <div className="font-bold text-sm text-white">{layer}</div>
                <code className="text-xs mt-0.5 block" style={{ color: '#7dd3fc' }}>{field}</code>
              </div>
              <div className="text-sm text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="key" title="DNP3 Addressing">
        DNP3 uses 16-bit source and destination addresses (0–65534). Address 0xFFFF is broadcast. In a typical SCADA system, the master (SCADA server) has a fixed address (e.g., 1) and each outstation (RTU) has a unique address (e.g., 10, 11, 12…). Wireshark shows these as <code>dnp3.src</code> and <code>dnp3.dst</code> — distinct from IP addresses. Both levels of addressing are visible simultaneously.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Critical DNP3 Function Codes</h2>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { fc: '0x01', name: 'Read', risk: 'read', desc: 'Read data objects from outstation' },
            { fc: '0x02', name: 'Write', risk: 'write', desc: 'Write data objects to outstation' },
            { fc: '0x03', name: 'Direct Operate', risk: 'critical', desc: 'Immediately execute a control action (open/close breaker, etc.)' },
            { fc: '0x04', name: 'Direct Operate No Ack', risk: 'critical', desc: 'Execute control with no confirmation — fire and forget' },
            { fc: '0x81', name: 'Response', risk: 'read', desc: 'Solicited response from outstation' },
            { fc: '0x82', name: 'Unsolicited Response', risk: 'monitor', desc: 'Outstation-initiated report — event data without a poll' },
          ].map(({ fc, name, risk, desc }) => (
            <div key={fc} className="px-5 py-2.5 flex items-center gap-4">
              <code className="w-10 flex-shrink-0" style={{ color: '#7dd3fc' }}>{fc}</code>
              <span className="font-medium text-white flex-shrink-0 w-48">{name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 w-16 text-center ${
                risk === 'critical' ? 'bg-red-500/100/20 text-red-400' :
                risk === 'write' ? 'bg-orange-500/100/15 text-orange-400' :
                risk === 'monitor' ? 'bg-purple-500/100/100/15 text-purple-400' :
                'bg-slate-700/50 text-slate-400'
              }`}>{risk}</span>
              <span className="text-slate-500 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <Callout type="warning" title="Direct Operate Is the High-Risk Function Code">
        Function code 0x03 (Direct Operate) is the command that opens and closes breakers, actuates relays, and controls field equipment. In the 2015 Ukraine power grid attack, attackers sent Direct Operate commands through a compromised SCADA workstation to open 30 substation breakers. Wireshark's filter <code>dnp3.ctl.func_code == 3</code> shows every Direct Operate command in a capture. In normal operations, these should come exclusively from your SCADA master, at expected times.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Unsolicited Responses</h2>

      <p>
        A unique and powerful DNP3 feature: outstations can send data to the master without being polled. This is <strong>Unsolicited Response</strong> (function code 0x82). The outstation has been configured with event thresholds — if a value changes by more than X, it reports immediately without waiting for the next poll cycle.
      </p>

      <p>
        In Wireshark, unsolicited responses appear as packets from the outstation IP to the master IP, without a prior request packet. The master acknowledges with a Confirm (FC 0x00). If you're seeing a flood of unsolicited responses, something in the field is changing rapidly — alarm condition, oscillating input, or a failing sensor.
      </p>

      <pre>{`# Display filters for DNP3 security analysis

# All control commands (Direct Operate and variations)
dnp3.ctl.func_code == 3 or dnp3.ctl.func_code == 4

# Unsolicited responses only
dnp3.ctl.func_code == 130

# From any outstation (typical outstations > address 5)
dnp3.src > 5

# Authentication challenge messages (SAv5)
dnp3.al.obj == "Group 120"

# Communication errors — function code 0x81 with IIN error bits
dnp3.al.iin.no_func_code_support == 1`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">DNP3 Secure Authentication (SAv5)</h2>

      <p>
        DNP3 Secure Authentication version 5 (SAv5), standardized in IEEE 1815-2012, adds cryptographic authentication to DNP3 messages. It uses HMAC (keyed-hash message authentication code) to prove message authenticity. This is the protocol's response to the demonstrated man-in-the-middle vulnerability.
      </p>

      <p>
        In Wireshark, SAv5 traffic appears as Object Group 120 messages — challenge, reply, and error objects. A proper SAv5 exchange shows: Challenge (master → outstation), Challenge Reply (outstation → master), then the actual operation. If you see operations without preceding challenges, or challenges without valid replies, the authentication is either disabled or being bypassed.
      </p>

      <Callout type="field" title="Field Gotcha: SAv5 Is Rarely Deployed">
        Despite being in the standard since 2012, DNP3 SAv5 is rarely deployed in production OT systems. The reasons: retrofitting requires firmware updates on outstations, key management infrastructure is complex, and many legacy RTUs don't support it. NERC CIP-005 and CIP-007 require cryptographic protection for interactive remote access, but local SCADA-to-outstation DNP3 traffic often falls outside that scope. Wireshark will quickly tell you whether SAv5 is running — or whether it's plaintext all the way to the substation.
      </Callout>

      <FunFact index={5} />

      <QuizLevels chapterId="dnp3" />
    </ChapterLayout>
  )
}
