import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import GifCard from '../components/GifCard'
import QuizLevels from '../components/QuizLevels'
import TrainingPanel from '../components/TrainingPanel'
import { ANALOGIES } from '../data/chapters'

export default function Intro() {
  const analogy = ANALOGIES.intro

  return (
    <ChapterLayout chapterId="intro" title="Introduction to Wireshark" next="capture">
      <p className="text-lg text-slate-300 leading-relaxed">
        Every packet that crosses your network is evidence. Evidence of what's working, evidence of what's broken, and — in an OT environment — evidence of whether your PLCs are communicating safely or being manipulated. Wireshark is the tool that reads that evidence. Everything else in network troubleshooting is guessing.
      </p>

      <p>
        Gerald Combs wrote the first version in 1998 and called it Ethereal. He renamed it Wireshark in 2006. In the intervening 27 years, it has become the universal language of network analysis — used by protocol developers, security engineers, IT helpdesk staff, and ICS/SCADA engineers who need to see what's actually on the wire between their HMI and their RTUs.
      </p>

      <Callout type="key" title="What Wireshark Does">
        Wireshark captures network packets and decodes them into human-readable fields. It doesn't generate traffic. It doesn't modify traffic. It listens. A packet that crosses your network interface is captured, timestamped, decoded by the appropriate protocol dissector, and displayed — down to the individual byte. If a protocol field says something unexpected, you'll see it.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">The Three Pane Interface</h2>

      <p>
        Open Wireshark and you see three panels. Understanding what each shows is not optional — it's the foundation of everything else.
      </p>

      <div className="rounded-2xl overflow-hidden my-6" style={{ border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.04)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(14,165,233,0.15)', background: 'rgba(14,165,233,0.08)' }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#38bdf8' }}>Three Pane Layout</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { name: 'Packet List (top)', desc: 'One row per packet. Columns: No., Time, Source, Destination, Protocol, Length, Info. Click a row to select that packet.' },
            { name: 'Packet Details (middle)', desc: 'The selected packet decoded into protocol layers. Expand a layer to see individual fields. Ethernet → IP → TCP → Modbus TCP, for example.' },
            { name: 'Packet Bytes (bottom)', desc: 'The raw hex and ASCII representation of the packet bytes. When you click a field in Packet Details, the corresponding bytes highlight here.' },
          ].map(({ name, desc }) => (
            <div key={name} className="px-5 py-3.5 flex gap-4">
              <div className="text-sm font-bold flex-shrink-0 w-44" style={{ color: '#7dd3fc' }}>{name}</div>
              <div className="text-sm text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="pro" title="Navigating the Panes">
        You can resize all three panes by dragging the dividers. In OT analysis, you'll spend most of your time in the Packet Details pane — expanding Modbus, DNP3, or OPC UA layers to read function codes, register addresses, and data values. The Bytes pane becomes important when you suspect a dissector is misidentifying a field.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">pcap and pcapng File Formats</h2>

      <p>
        Wireshark saves captures in <code>pcap</code> or <code>pcapng</code> format. <code>pcap</code> is the legacy format — universally supported by every network tool in existence. <code>pcapng</code> is the next-generation format that supports multiple interfaces per file, packet annotations, interface statistics, and hardware timestamps.
      </p>

      <p>
        For OT incident response, prefer <code>pcapng</code> when capturing on modern systems. The interface metadata and precise timestamps matter when you're trying to reconstruct the sequence of events during an anomaly. For compatibility with older tools or sending to a vendor, export as <code>pcap</code>.
      </p>

      <GifCard gifKey="inspect" caption="Reading a raw pcap for the first time." side="right" />

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Wireshark in OT/SCADA Environments</h2>

      <p>
        In an IT network, Wireshark is a troubleshooting tool. In an OT network, it's also a security tool. The difference is that OT protocols — Modbus, DNP3, EtherNet/IP, OPC UA — are largely unauthenticated. There's no cryptographic proof of who sent what. Any device on the network can send a Modbus write command to any slave. Wireshark makes this immediately visible.
      </p>

      <p>
        An OT engineer who knows Wireshark can answer questions that are otherwise unanswerable: Is this RTU polling frequency changing? Is something writing to registers it shouldn't? Is OPC UA actually using SignAndEncrypt, or is it running in None mode? The wire doesn't lie — and Wireshark reads the wire.
      </p>

      <Callout type="warning" title="Wireshark Does Not Modify Traffic">
        A common misconception: Wireshark affects the network. It doesn't. It operates in passive capture mode. Your Modbus devices don't know Wireshark is there. The only performance impact is on the machine running Wireshark — particularly during high-volume captures. The network itself is unaffected.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">The Protocol Dissector System</h2>

      <p>
        Wireshark ships with 3,000+ built-in protocol dissectors. A dissector is a module that knows the byte layout of a specific protocol — where the function code is, how many bytes the address field occupies, what values in the flags field mean. When Wireshark captures a packet, it identifies the protocol (by port number, by magic bytes, by framing) and hands the packet to the appropriate dissector.
      </p>

      <p>
        For OT engineers, the critical dissectors are: <strong>mbtcp</strong> (Modbus TCP), <strong>dnp3</strong>, <strong>opcua</strong>, <strong>enip/cip</strong> (EtherNet/IP), <strong>profinet</strong>, <strong>bacnet</strong>, <strong>iec104</strong> (IEC 60870-5-104). These are all built in. No plugins required.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <Callout type="field" title="Field Gotcha: Running Wireshark as Root">
        On Linux, the temptation is to run Wireshark as root to get packet capture permissions. Don't. Instead, add your user to the <code>wireshark</code> group: <code>sudo usermod -aG wireshark $USER</code>. This grants capture permission to <code>dumpcap</code> without exposing the full Wireshark GUI to root-level execution. This matters in OT environments where the analysis machine may be on a shared network segment.
      </Callout>

      <FunFact index={0} />

      <QuizLevels chapterId="intro" />
      <TrainingPanel course="wireshark" />
    </ChapterLayout>
  )
}
