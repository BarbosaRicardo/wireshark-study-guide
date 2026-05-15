import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import GifCard from '../components/GifCard'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Capture() {
  const analogy = ANALOGIES.capture

  return (
    <ChapterLayout chapterId="capture" title="Capture Techniques & Interfaces" prev="intro" next="filters">
      <p className="text-lg text-slate-300 leading-relaxed">
        Capturing packets sounds simple: tell Wireshark which interface to use and click Start. In practice, getting the right packets in the right place at the right time is the skill that separates engineers who find problems from engineers who guess. In OT networks, this gets harder — most traffic never touches your laptop.
      </p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Selecting a Capture Interface</h2>

      <p>
        When you open Wireshark, the interface list shows every network adapter on your machine — Ethernet ports, Wi-Fi adapters, loopback, and virtual adapters. Each shows a live traffic sparkline. The right interface is the one where your target traffic will appear.
      </p>

      <p>
        On a managed switch, traffic between two other devices (say, a PLC and an HMI) does not appear on your laptop's port unless the switch is configured to forward it there. This is the fundamental problem of switched Ethernet networks for packet capture: you only see traffic addressed to your MAC, broadcast traffic, and multicast traffic — not everything.
      </p>

      <Callout type="key" title="Promiscuous Mode">
        Promiscuous mode tells the network card to accept all frames on the wire, not just frames addressed to its MAC address. This is necessary for capturing traffic on a shared medium (like a hub or Wi-Fi). On a switched network, promiscuous mode doesn't help — the switch still only sends the right frames to each port. You need a SPAN port or tap.
      </Callout>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">SPAN Ports vs Network Taps</h2>

      <p>
        In OT environments, you need to capture traffic between devices you don't control. Two approaches:
      </p>

      <div className="rounded-2xl overflow-hidden my-6" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="p-5">
            <div className="font-bold text-sm mb-3" style={{ color: '#38bdf8' }}>SPAN Port (Mirror Port)</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Configured on managed switch</li>
              <li>• Switch copies specified traffic to the SPAN port</li>
              <li>• Capture machine connects to SPAN port</li>
              <li>• Non-intrusive — no inline hardware</li>
              <li>• May drop packets under high load</li>
              <li>• Switch CPU overhead</li>
              <li>• Best for: office environments, assessment snapshots</li>
            </ul>
          </div>
          <div className="p-5">
            <div className="font-bold text-sm mb-3" style={{ color: '#fbbf24' }}>Network Tap</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Physical inline device</li>
              <li>• Passes through traffic + copies to monitor port</li>
              <li>• Passive tap: no power needed, zero packet loss</li>
              <li>• Active tap: powered, supports aggregation</li>
              <li>• Requires physical installation</li>
              <li>• Does not burden switch CPU</li>
              <li>• Best for: continuous OT monitoring, forensics</li>
            </ul>
          </div>
        </div>
      </div>

      <Callout type="warning" title="SPAN Port Limitations in OT">
        SPAN ports are configured by IT/network teams. In many OT environments, the PLC switch is unmanaged — no SPAN capability at all. And even on managed switches, SPAN ports can drop packets when the switch is under load. For a forensic capture during an incident, a passive optical tap between devices gives you 100% of the traffic with zero packet loss. That's the evidence standard you need.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Capture Filters (BPF Syntax)</h2>

      <p>
        A capture filter is applied before packets are written to the capture buffer. Packets that don't match are discarded — they never appear in Wireshark. This is critical for high-volume OT networks where you can't store everything.
      </p>

      <p>
        Capture filters use Berkeley Packet Filter (BPF) syntax, the same syntax used by <code>tcpdump</code>:
      </p>

      <pre>{`# Only Modbus TCP (port 502)
port 502

# Only traffic to/from a specific PLC
host 192.168.1.101

# DNP3 over TCP (port 20000)
port 20000

# OPC UA (port 4840)
port 4840

# Exclude ARP and broadcast noise
not arp and not broadcast

# Combine: Modbus from a specific host
host 192.168.1.101 and port 502`}</pre>

      <Callout type="pro" title="Capture Filters Run in the Kernel">
        BPF capture filters are executed in the kernel by libpcap before Wireshark even sees the packet. This makes them extremely efficient — they add virtually zero CPU overhead. Display filters, by contrast, run in userspace after capture. Always use a capture filter for high-bandwidth OT traffic to avoid dropping packets.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">dumpcap for Headless Capture</h2>

      <p>
        <code>dumpcap</code> is the Wireshark capture engine as a standalone command-line tool. It runs without a GUI, making it suitable for deployment on OT historian machines, Raspberry Pis, or any headless Linux box on your network segment.
      </p>

      <p>
        Ring buffer capture — where old files are automatically deleted as new ones are created — is how you do continuous OT monitoring without filling up disk:
      </p>

      <pre>{`# Capture on interface eth0
# Write to /captures/ot_%Y%m%d%H%M%S.pcapng
# 10 MB per file, keep last 50 files (500 MB total)
# BPF filter: Modbus + DNP3 only
dumpcap -i eth0 \\
  -w /captures/ot.pcapng \\
  -b filesize:10240 \\
  -b files:50 \\
  -f "port 502 or port 20000"`}</pre>

      <GifCard gifKey="wire" caption="Your OT network, 24/7, captured." side="right" />

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Remote Capture via SSH</h2>

      <p>
        If you can SSH to a Linux machine on the OT network segment, you can pipe <code>tcpdump</code> output through SSH directly into Wireshark on your laptop:
      </p>

      <pre>{`ssh user@ot-historian "tcpdump -i eth0 -U -w - port 502" | wireshark -k -i -`}</pre>

      <p>
        The <code>-U</code> flag makes tcpdump write each packet immediately rather than buffering. The <code>-w -</code> writes to stdout. Wireshark reads from stdin (<code>-i -</code>) and starts immediately (<code>-k</code>). You get live Wireshark analysis of a remote OT segment from your laptop, with the full GUI.
      </p>

      <Callout type="field" title="Field Gotcha: Capture Buffer Drops">
        When Wireshark shows "Packets dropped" in the status bar, your machine is not processing packets fast enough and libpcap is dropping them. This usually means your capture is too broad — no capture filter, or too much traffic. The fix is to apply a BPF capture filter to reduce volume. On a busy OT network with high-frequency Modbus polling, even a modest machine can saturate. Narrow your filter first, then widen it if you still can't find what you're looking for.
      </Callout>

      <FunFact index={1} />

      <QuizLevels chapterId="capture" />
    </ChapterLayout>
  )
}
