import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Dissectors() {
  const analogy = ANALOGIES.dissectors

  return (
    <ChapterLayout chapterId="dissectors" title="Protocol Dissectors & Decode As" prev="filters" next="modbus">
      <p className="text-lg text-slate-300 leading-relaxed">
        Wireshark doesn't read minds. When it captures a packet, it sees a stream of bytes. The protocol dissector is what turns those bytes into field names and values. Without the right dissector, Wireshark shows you hexadecimal. With it, you see "Modbus Function Code: 3 (Read Holding Registers), Starting Address: 40001, Quantity: 10."
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">How Dissectors Work</h2>

      <p>
        Each Wireshark dissector registers to handle specific protocol identifiers — typically TCP/UDP port numbers, Ethernet type codes, or IP protocol numbers. When Wireshark processes a packet, it works layer by layer: the Ethernet dissector hands off to IP, IP hands off to TCP or UDP, and TCP hands off to the application-layer dissector registered for that port.
      </p>

      <p>
        For Modbus TCP, Wireshark registers the <code>mbtcp</code> dissector on TCP port 502. For DNP3, port 20000. For OPC UA, port 4840. These are the IANA-registered ports — and in most production OT systems, they're the ones in use.
      </p>

      <Callout type="key" title="Protocol Hierarchy Statistics">
        Go to Statistics → Protocol Hierarchy. This shows every protocol detected in your capture, how many packets it appears in, and what percentage of total traffic it represents. In an OT network, you should see your ICS protocols at the top. If you see a lot of unknown TCP or a high percentage of "data" without a recognized protocol, something is either misconfigured or unusual. This is the first thing to run on any unfamiliar capture.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Decode As — Forcing a Dissector</h2>

      <p>
        Some OT deployments run protocols on non-standard ports. A Modbus device might be configured to use TCP port 1502 instead of 502. A DNP3 device might use a custom port. Wireshark won't apply the right dissector unless you tell it to.
      </p>

      <p>
        Right-click a packet from that device → Decode As → set the Transport layer's port to the appropriate dissector. Wireshark remembers this setting for the session. You can also make it permanent via Edit → Preferences → Protocols.
      </p>

      <pre>{`# Example: Modbus on port 1502
Right-click any TCP packet on port 1502
→ Decode As...
→ Field: TCP port 1502
→ Current: (none) → change to "Modbus/TCP"
→ OK

# Now all port 1502 traffic decodes as Modbus TCP`}</pre>

      <Callout type="warning" title="Non-Standard Ports Are Common in OT">
        Many OT vendors modify default port assignments — either to avoid conflicts with other services or because their protocol stack was written before standardization. If a capture shows unexplained TCP data on an unfamiliar port, check the device documentation. Modbus on 502 is standard. Modbus on 1502, 5020, or 10502 is vendor-specific. Decode As handles all of these.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Expert Information</h2>

      <p>
        Go to Analyze → Expert Information. Wireshark categorizes anomalous traffic by severity:
      </p>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { color: '#ef4444', label: 'Error', examples: 'Malformed packets, checksum failures, truncated frames' },
            { color: '#f87171', label: 'Warning', examples: 'TCP retransmissions, out-of-order packets, duplicate ACKs' },
            { color: '#fbbf24', label: 'Note', examples: 'TCP keep-alives, connection resets, segment size anomalies' },
            { color: '#22d3ee', label: 'Chat', examples: 'Normal connection setup/teardown events, protocol transitions' },
          ].map(({ color, label, examples }) => (
            <div key={label} className="px-5 py-3 flex gap-4 items-start">
              <span className="font-bold text-sm w-20 flex-shrink-0" style={{ color }}>{label}</span>
              <span className="text-slate-400 text-sm">{examples}</span>
            </div>
          ))}
        </div>
      </div>

      <p>
        In OT analysis, a high count of TCP retransmissions between an HMI and a PLC points to a communication health problem — possibly a bad cable, an overloaded device, or a congested switch port. Expert Information gets you there in seconds without building a filter.
      </p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Writing a Lua Dissector</h2>

      <p>
        For proprietary OT protocols that Wireshark doesn't know about, you can write a custom dissector in Lua. Wireshark ships with a Lua interpreter and exposes a full dissector API. A minimal dissector that decodes a simple length-prefixed binary protocol:
      </p>

      <pre>{`-- my_protocol.lua
local my_proto = Proto("myproto", "My OT Protocol")

local f_length   = ProtoField.uint16("myproto.length",   "Length",   base.DEC)
local f_cmd      = ProtoField.uint8 ("myproto.cmd",      "Command",  base.HEX)
local f_payload  = ProtoField.bytes ("myproto.payload",  "Payload")

my_proto.fields = { f_length, f_cmd, f_payload }

function my_proto.dissector(buffer, pinfo, tree)
  pinfo.cols.protocol = "MYPROTO"
  local subtree = tree:add(my_proto, buffer())
  subtree:add(f_length,  buffer(0, 2))
  subtree:add(f_cmd,     buffer(2, 1))
  subtree:add(f_payload, buffer(3))
end

-- Register on TCP port 9999
local tcp_port = DissectorTable.get("tcp.port")
tcp_port:add(9999, my_proto)`}</pre>

      <p>
        Place this file in your Wireshark plugins directory (<code>Help → About Wireshark → Folders → Personal Lua Plugins</code>) and restart Wireshark. Traffic on port 9999 will now decode using your dissector.
      </p>

      <Callout type="pro" title="Lua Dissectors for Vendor Protocols">
        Several ICS vendors have published Lua dissectors for their proprietary protocols — Schneider Electric Modicon, Siemens S7, Rockwell EtherNet/IP extensions. Search GitHub for the vendor name + "wireshark dissector lua". The Wireshark wiki also maintains a list. Before writing from scratch, check if someone already did it.
      </Callout>

      <Callout type="field" title="Field Gotcha: Dissector Guessing on Ambiguous Ports">
        If you see a protocol incorrectly identified on a port that happens to match another protocol, Wireshark is using the wrong dissector. This happens when a vendor reuses common ports — port 80 for their web API but also for their binary protocol, or port 443 for TLS-wrapped proprietary traffic. The symptom is garbled field names. The fix is Decode As → manually assign the correct dissector.
      </Callout>

      <FunFact index={3} />

      <QuizLevels chapterId="dissectors" />
    </ChapterLayout>
  )
}
