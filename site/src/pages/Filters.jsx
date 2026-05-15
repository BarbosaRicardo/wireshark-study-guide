import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Filters() {
  const analogy = ANALOGIES.filters

  return (
    <ChapterLayout chapterId="filters" title="Display & Capture Filters" prev="capture" next="dissectors">
      <p className="text-lg text-slate-300 leading-relaxed">
        A raw Wireshark capture of an OT network can contain thousands of packets per second — ARP broadcasts, keep-alives, Modbus polls, ICMP echoes, DNS queries, and whatever else is on the wire. Without filters, you're reading a firehose. With the right display filter, you're reading exactly the one conversation that matters.
      </p>

      <Callout type="key" title="Two Types of Filters">
        <strong>Capture filters</strong> (BPF syntax) run before packets are stored — packets that don't match are never saved. <strong>Display filters</strong> run after capture — all packets are stored, but only matching ones are shown. Capture filters are for performance. Display filters are for analysis. They use different syntax and serve different purposes.
      </Callout>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Display Filter Syntax</h2>

      <p>
        Wireshark display filters use a rich expression language based on protocol field names. The field name comes from the dissector — so you need to know what the dissector calls each field.
      </p>

      <pre>{`# Filter by IP address (either direction)
ip.addr == 192.168.1.101

# Filter by source OR destination
ip.src == 10.0.0.50
ip.dst == 10.0.0.1

# Filter by TCP port
tcp.port == 502

# Modbus TCP only
mbtcp

# Modbus function code 6 (Write Single Register)
mbtcp.func_code == 6

# DNP3 traffic
dnp3

# OPC UA
opcua

# ARP requests only
arp.opcode == 1

# Packets larger than 1000 bytes
frame.len > 1000`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Operators and Combinations</h2>

      <p>
        Display filters support comparison operators, logical operators, and membership tests:
      </p>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Display Filter Operators</span>
        </div>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { op: '==  !=  >  <  >=  <=', desc: 'Standard comparison operators' },
            { op: 'and  or  not', desc: 'Logical operators (also &&, ||, !)' },
            { op: 'contains', desc: 'String or byte pattern match (mbtcp contains "0x06")' },
            { op: 'matches', desc: 'Regular expression match' },
            { op: 'in {a, b, c}', desc: 'Set membership test (ip.addr in {10.0.0.1, 10.0.0.2})' },
            { op: '[n:m]', desc: 'Byte slice — frame[0:2] is the first two bytes' },
          ].map(({ op, desc }) => (
            <div key={op} className="px-5 py-2.5 flex gap-4">
              <code className="text-sm flex-shrink-0 w-48" style={{ color: '#7dd3fc' }}>{op}</code>
              <span className="text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <pre>{`# OT security analysis filters

# All Modbus writes (FC 5, 6, 15, 16)
mbtcp.func_code in {5, 6, 15, 16}

# Modbus exceptions (FC >= 128 means error)
mbtcp.func_code >= 128

# OPC UA with SecurityMode = None (0)
opcua.security_policy == 0

# DNP3 direct operate function code (0x03)
dnp3.ctl.func_code == 3

# TCP retransmissions (troubled link indicator)
tcp.analysis.retransmission

# Conversations between two specific hosts
ip.addr == 192.168.1.10 and ip.addr == 192.168.1.20

# Exclude management traffic, show only OT protocols
not arp and not icmp and (mbtcp or dnp3 or opcua)`}</pre>

      <Callout type="pro" title="The Filter Bar Color Code">
        As you type a display filter, the filter bar background changes: <strong>green</strong> = valid filter syntax, <strong>red/pink</strong> = syntax error, <strong>yellow</strong> = valid but deprecated syntax. If the bar stays red, you have a syntax error — check field names using the auto-complete dropdown (Ctrl+Space) or the Display Filter Reference at wireshark.org/docs/dfref/.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Critical OT Display Filters</h2>

      <p>
        These filters cover the most common OT analysis scenarios. Save them as filter buttons for one-click access (right-click the filter bar → Manage Display Filters):
      </p>

      <div className="space-y-3 my-6">
        {[
          { label: 'All Modbus writes', filter: 'mbtcp.func_code in {5, 6, 15, 16}', use: 'Detect unauthorized writes to coils or holding registers' },
          { label: 'Modbus exceptions', filter: 'mbtcp.func_code >= 128', use: 'Devices reporting errors — communication or permission failures' },
          { label: 'Unsolicited Modbus masters', filter: 'mbtcp and ip.src != 192.168.1.1', use: 'Traffic from any host other than the known master' },
          { label: 'DNP3 operate commands', filter: 'dnp3.ctl.func_code == 3 or dnp3.ctl.func_code == 4', use: 'Direct Operate or Direct Operate No Ack — field device commands' },
          { label: 'TCP retransmissions', filter: 'tcp.analysis.retransmission', use: 'Communication health indicator — noisy cable, overloaded device' },
          { label: 'OT protocols only', filter: 'mbtcp or dnp3 or opcua or enip', use: 'Strip out background IT traffic for focused OT analysis' },
        ].map(({ label, filter, use }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-bold text-sm text-white mb-1">{label}</div>
                <code className="text-xs block mb-1.5" style={{ color: '#7dd3fc' }}>{filter}</code>
                <div className="text-xs text-slate-500">{use}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Following Streams</h2>

      <p>
        The <strong>Follow TCP Stream</strong> feature (right-click a packet → Follow → TCP Stream) reassembles all TCP payload data from both sides of a connection into a single view. For OT protocols, this shows the complete request/response sequence of a session — useful for understanding what a Modbus master asked for and what it got back, in order.
      </p>

      <p>
        For UDP-based protocols, use Follow UDP Stream. For OPC UA over TCP, Follow TCP Stream shows the raw binary — useful for spotting repeated patterns or unexpected message sizes.
      </p>

      <Callout type="warning" title="Display Filters Don't Change What's Stored">
        A common source of confusion: applying a display filter doesn't delete packets. All captured packets are still in memory (or on disk if saving). The display filter only changes what's visible. If you save the file while a filter is active, Wireshark will ask whether to save all packets or only the filtered ones. For forensic work, always save all packets — then use filters for analysis.
      </Callout>

      <FunFact index={2} />

      <QuizLevels chapterId="filters" />
    </ChapterLayout>
  )
}
