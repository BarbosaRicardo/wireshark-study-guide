import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Lab() {
  const analogy = ANALOGIES.lab

  return (
    <ChapterLayout chapterId="lab" title="Protocol Analysis Lab" prev="advanced">
      <p className="text-lg text-slate-300 leading-relaxed">
        Theory is necessary. But Wireshark skills are built by opening captures and answering questions. This chapter is a structured set of analysis scenarios — each one is a realistic OT situation with a question that requires applying what you've learned. For each scenario, the tools, filters, and reasoning are described. Try them on real captures before you need them in an incident.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Scenario 1 — Unauthorized Modbus Write</h2>

      <div className="rounded-2xl p-5 my-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f87171' }}>Scenario</div>
        <p className="text-sm text-slate-300">Operations reports that a pump tripped unexpectedly at 02:17. The PLC log shows a coil write. You have a pcap of the last 6 hours of network traffic on the OT subnet.</p>
      </div>

      <p>
        <strong>Investigation steps:</strong>
      </p>

      <pre>{`# 1. Filter for all Modbus write commands
mbtcp.func_code in {5, 6, 15, 16}

# 2. Look at the Time column — find events near 02:17
# Sort by time: View → Time Display Format → Time of Day

# 3. Identify the source IP of any writes at that time
# Check ip.src — is it the known HMI, or something unexpected?

# 4. If unexpected source: Statistics → Conversations to find
#    all other traffic from that IP in the 6-hour window

# 5. Check what address was written (mbtcp.reference_num)
#    and what value was written (mbtcp.data)
# FC 05 writes coils: value 0xFF00 = ON, 0x0000 = OFF`}</pre>

      <Callout type="key" title="Chain of Custody Note">
        For incidents with legal or regulatory implications (NERC CIP events, safety incidents), the pcap file must be preserved with a hash. Run <code>sha256sum capture.pcapng</code> before any analysis and document the hash. This establishes that the evidence hasn't been modified between collection and analysis.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Scenario 2 — OPC UA Security Assessment</h2>

      <div className="rounded-2xl p-5 my-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#fbbf24' }}>Scenario</div>
        <p className="text-sm text-slate-300">Security audit requires verifying that all OPC UA sessions use SignAndEncrypt. You have a 1-hour capture of all traffic on the historian network segment.</p>
      </div>

      <pre>{`# 1. Filter for all OPC UA OpenSecureChannel requests
opcua

# 2. In the Packet Details pane, expand:
#    OPC UA → OpenSecureChannelRequest → SecurityMode
# SecurityMode values:
#   0 = None (FAIL)
#   1 = Sign (PARTIAL — data visible but authenticated)
#   2 = SignAndEncrypt (PASS)

# 3. To find ALL unique sessions and their security modes:
tshark -r capture.pcapng \\
  -Y "opcua" \\
  -T fields \\
  -e ip.src \\
  -e ip.dst \\
  -e opcua.security_policy \\
  | sort | uniq

# Any row with security_policy = 0 is a finding`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Scenario 3 — DNP3 Anomaly Hunt</h2>

      <div className="rounded-2xl p-5 my-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f87171' }}>Scenario</div>
        <p className="text-sm text-slate-300">ICS-CERT advisory warns that a threat actor has been sending DNP3 Direct Operate commands to substations through compromised SCADA workstations. You need to verify whether any unauthorized Direct Operate traffic exists in your captures.</p>
      </div>

      <pre>{`# 1. Filter for all DNP3 Direct Operate commands
dnp3.ctl.func_code == 3 or dnp3.ctl.func_code == 4

# 2. Check ip.src for each result
#    Known SCADA master IPs: document these from your network diagram
#    Any other IP is a finding

# 3. Check timestamp pattern
#    Legitimate SCADA Direct Operate: follows SBO (Select Before Operate)
#    Look for FC 3 without a preceding FC 1 (Select) from the same source

# 4. Check DNP3 source address (dnp3.src)
#    Legitimate masters have known addresses
#    Unknown master address = spoofed or rogue device

# 5. For timeline reconstruction:
tshark -r capture.pcapng \\
  -Y "dnp3.ctl.func_code == 3 or dnp3.ctl.func_code == 4" \\
  -T fields \\
  -e frame.time -e ip.src -e dnp3.src -e dnp3.dst \\
  -e dnp3.ctl.func_code`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Scenario 4 — Communication Health Baseline</h2>

      <div className="rounded-2xl p-5 my-4" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#38bdf8' }}>Scenario</div>
        <p className="text-sm text-slate-300">A PLC is occasionally going to comms fault. Operations says it happens "a few times a day." You need to characterize the frequency, duration, and pattern of communication failures to give maintenance a useful report.</p>
      </div>

      <pre>{`# 1. Filter for TCP retransmissions (indicates lost packets)
tcp.analysis.retransmission

# 2. Filter for TCP resets (connection aborted)
tcp.flags.reset == 1 and ip.dst == [PLC IP]

# 3. Filter for Modbus exceptions from the PLC
mbtcp.func_code >= 128 and ip.src == [PLC IP]

# 4. Look for gaps in the polling sequence
#    Export packet timestamps for the poll stream:
tshark -r capture.pcapng \\
  -Y "mbtcp and ip.src == 192.168.1.10 and ip.dst == 192.168.1.100" \\
  -T fields -e frame.time -e mbtcp.func_code \\
  | awk -F\\t '{print $1}' > timestamps.txt
#    Large gaps between timestamps = failed polls`}</pre>

      <Callout type="pro" title="GICSP and WCNA Exam Alignment">
        The GIAC ICS Security (GICSP) exam tests your ability to analyze OT network traffic and identify security anomalies — exactly the scenarios above. The Wireshark Certified Network Analyst (WCNA) exam focuses on protocol analysis depth: reading function codes, understanding session establishment, and interpreting error conditions. Both exams benefit from hands-on time with real OT protocol captures. The Wireshark wiki's SampleCaptures page has examples of Modbus, DNP3, and other ICS protocols. Download them and work through these scenarios on real data.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Where to Get Practice Captures</h2>

      <div className="space-y-3 my-5">
        {[
          { source: 'Wireshark Sample Captures', url: 'wiki.wireshark.org/SampleCaptures', desc: 'Official collection including Modbus, DNP3, PROFINET, BACnet, and hundreds of other protocols' },
          { source: 'NETRESEC', url: 'netresec.com', desc: 'Malcolm and NetworkMiner team — ICS/SCADA PCAPs including some from real incidents (anonymized)' },
          { source: 'Your own dumpcap', url: 'Local ring buffer', desc: 'The best practice is your own production traffic. Even 30 minutes of real Modbus polling teaches more than any synthetic PCAP.' },
          { source: 'SANS ICS ranges', url: 'sans.org/ics', desc: 'ICS515 course materials include structured lab PCAPs with known anomalies for practice' },
        ].map(({ source, url, desc }) => (
          <div key={source} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="font-bold text-sm text-white mb-0.5">{source}</div>
            <div className="text-xs mb-1" style={{ color: '#7dd3fc' }}>{url}</div>
            <div className="text-xs text-slate-500">{desc}</div>
          </div>
        ))}
      </div>

      <FunFact index={9} />

      <QuizLevels chapterId="lab" />
    </ChapterLayout>
  )
}
