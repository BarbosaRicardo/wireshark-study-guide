import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import GifCard from '../components/GifCard'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Security() {
  const analogy = ANALOGIES.security

  return (
    <ChapterLayout chapterId="security" title="Security Analysis & Anomaly Detection" prev="opcua" next="advanced">
      <p className="text-lg text-slate-300 leading-relaxed">
        OT security analysis with Wireshark is fundamentally about knowing what normal looks like. An OT network is among the most predictable environments in IT/OT security — the same PLCs talk to the same HMIs at the same intervals doing the same things, day after day. Anything that deviates from that baseline is worth investigating. Wireshark is how you see the deviation.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Baselining OT Traffic</h2>

      <p>
        Before you can detect anomalies, you need a baseline. In a healthy OT network, a 30-minute capture during normal operations will show you the complete communication pattern: which hosts talk to which, on which ports, using which protocols, at what intervals.
      </p>

      <p>
        Wireshark's Statistics menu provides the tools for building this baseline:
      </p>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { stat: 'Statistics → Conversations', use: 'All host-to-host pairs that communicated. Columns: packets, bytes, duration. An unexpected conversation is immediately visible.' },
            { stat: 'Statistics → Endpoints', use: 'All hosts seen in the capture. A new IP address on your OT subnet that you don\'t recognize is an immediate flag.' },
            { stat: 'Statistics → Protocol Hierarchy', use: 'What percentage of traffic is each protocol. Sudden increase in unknown TCP suggests new traffic not matching a known dissector.' },
            { stat: 'Statistics → I/O Graph', use: 'Traffic volume over time. A poll that suddenly doubles in frequency appears as a clear visual spike.' },
            { stat: 'Statistics → Flow Graph', use: 'Sequence diagram of packets between hosts. Shows the exact request/response order — useful for spotting commands arriving out of expected sequence.' },
          ].map(({ stat, use }) => (
            <div key={stat} className="px-5 py-3.5 flex gap-4 items-start">
              <code className="text-xs flex-shrink-0 w-52 leading-relaxed" style={{ color: '#7dd3fc' }}>{stat}</code>
              <div className="text-sm text-slate-400">{use}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Detecting ARP Poisoning (MITM)</h2>

      <p>
        ARP poisoning is an attacker technique where a malicious host sends gratuitous ARP replies claiming that its MAC address corresponds to a legitimate IP — typically the gateway or an HMI. Traffic intended for that IP gets redirected to the attacker's machine for interception or modification.
      </p>

      <p>
        Wireshark makes this visible immediately:
      </p>

      <pre>{`# ARP traffic only
arp

# Look for: multiple ARP replies associating the same MAC with different IPs
# Or: an IP changing its MAC address between captures
# Or: "duplicate use of IP address" in Expert Information (Analyze → Expert Information)

# Wireshark will flag this as a Warning in Expert Information:
# "Duplicate IP address detected for 192.168.1.1 (old=AA:BB:CC:DD:EE:FF, new=11:22:33:44:55:66)"

# Filter for potential MITM:
# Look for a host responding to ARP for an IP that isn't its own
arp.opcode == 2 and arp.src.proto_ipv4 != arp.dst.proto_ipv4`}</pre>

      <Callout type="warning" title="ARP Poisoning in OT Networks">
        ARP poisoning in an OT network is particularly dangerous because unauthenticated protocols like Modbus trust the IP-level identity of the sender. If an attacker poisons ARP to redirect Modbus traffic through their machine, they can read all control data and potentially inject malicious commands. Wireshark on a SPAN port will catch the poisoning event in real time — the anomalous ARP reply appears before any traffic redirection occurs.
      </Callout>

      <GifCard gifKey="hacker" caption="ARP poisoning: redirecting traffic before it knows what hit it." side="right"
        body="ARP poisoning (ARP spoofing) inserts a malicious host into traffic flows by sending gratuitous ARP replies that associate the attacker's MAC address with a legitimate IP. Subsequent traffic to the victim IP is delivered to the attacker, who can forward it (man-in-the-middle) or drop it (denial of service). Wireshark detects ARP poisoning by identifying duplicate ARP replies for the same IP from different MACs — filter on arp.duplicate-address-detected or look for multiple ARP replies in a short window."
      />

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">MITRE ATT&CK for ICS — Network Techniques</h2>

      <p>
        MITRE ATT&CK for ICS (Industrial Control Systems) documents adversary techniques specific to OT environments. Several are directly detectable in Wireshark captures:
      </p>

      <div className="space-y-3 my-6">
        {[
          { id: 'T0843', name: 'Program Download', filter: 'mbtcp.func_code in {15, 16} or dnp3.ctl.func_code == 2', desc: 'Unexpected writes to multiple registers — could be firmware or ladder logic upload' },
          { id: 'T0855', name: 'Unauthorized Command Message', filter: 'mbtcp.func_code in {5, 6, 15, 16} and ip.src != [known masters]', desc: 'Write commands from unknown source IPs' },
          { id: 'T0856', name: 'Spoof Reporting Message', filter: 'arp.duplicate-address-detected', desc: 'ARP spoofing to intercept and potentially modify sensor reports' },
          { id: 'T0861', name: 'Point & Tag Identification', filter: 'mbtcp.func_code == 3 and mbtcp.reference_num != [baseline addresses]', desc: 'Reads to unfamiliar register addresses — reconnaissance of the point map' },
        ].map(({ id, name, filter, desc }) => (
          <div key={id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xs font-black flex-shrink-0 px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{id}</span>
              <div className="flex-1">
                <div className="font-bold text-sm text-white mb-1">{name}</div>
                <code className="text-xs block mb-1.5" style={{ color: '#7dd3fc' }}>{filter}</code>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">OT Threat Hunting with tshark</h2>

      <p>
        For continuous monitoring, <code>tshark</code> can process captures and alert on specific conditions without a GUI:
      </p>

      <pre>{`#!/bin/bash
# Alert on any Modbus write command from unexpected source
tshark -i eth0 -Y 'mbtcp.func_code in {5,6,15,16}' \\
  -T fields \\
  -e frame.time \\
  -e ip.src \\
  -e ip.dst \\
  -e mbtcp.func_code \\
  -e mbtcp.reference_num \\
  2>/dev/null | while read line; do
    echo "[ALERT] Modbus Write Detected: $line"
    # Add: send to SIEM, Slack webhook, SMS, etc.
  done`}</pre>

      <Callout type="pro" title="Establishing the Baseline First">
        The filters above only work if you know what's normal. "Modbus writes from unknown source IPs" requires knowing the known source IPs. Run a 24-hour baseline capture during normal operations, extract the conversation list, and document every IP that sends write commands. That's your allowlist. Anything outside that list is an anomaly. Wireshark's Statistics → Conversations will build this list in 30 seconds.
      </Callout>

      <Callout type="field" title="Field Gotcha: ICS Incidents Leave PCAP Evidence">
        The 2015 Ukraine power grid attack (BlackEnergy), the 2016 Ukraine attack (Industroyer), and the 2021 Oldsmar water treatment attack all left forensic evidence in network captures. Industroyer included a DNP3 module that replayed legitimate-looking control messages. A PCAP of that traffic would have shown DNP3 Direct Operate commands sent by an IP that wasn't the SCADA master — exactly the anomaly that baseline analysis would catch. Continuous ring-buffer capture is cheap. Incident reconstruction without PCAP is expensive.
      </Callout>

      <FunFact index={7} />

      <QuizLevels chapterId="security" />
    </ChapterLayout>
  )
}
