import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function Advanced() {
  const analogy = ANALOGIES.advanced

  return (
    <ChapterLayout chapterId="advanced" title="Advanced Wireshark Techniques" prev="security" next="lab">
      <p className="text-lg text-slate-300 leading-relaxed">
        The GUI is fine for interactive analysis. For production OT monitoring, automated alerting, and forensic pipelines, you need the command-line tools. <code>tshark</code>, <code>editcap</code>, <code>mergecap</code>, and <code>capinfos</code> are all part of the Wireshark installation. Together they form a complete packet analysis platform without a screen.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">tshark — The CLI Powerhouse</h2>

      <p>
        <code>tshark</code> does everything Wireshark does, without the GUI. It's scriptable, automatable, and suitable for deployment on headless OT historian machines or monitoring appliances.
      </p>

      <pre>{`# Basic capture to file (same as Wireshark "Start capturing")
tshark -i eth0 -w /captures/ot.pcapng

# Apply a display filter and print fields in CSV-like format
tshark -r capture.pcapng \\
  -Y "mbtcp.func_code in {5,6,15,16}" \\
  -T fields \\
  -e frame.time \\
  -e ip.src \\
  -e ip.dst \\
  -e mbtcp.func_code \\
  -e mbtcp.reference_num \\
  -e mbtcp.word_cnt

# Statistics: conversation list
tshark -r capture.pcapng -q -z conv,ip

# Statistics: protocol hierarchy
tshark -r capture.pcapng -q -z io,phs

# Statistics: I/O graph (1-second bins)
tshark -r capture.pcapng -q -z io,stat,1

# Count packets by OT protocol
tshark -r capture.pcapng -q -z io,phs | grep -E "modbus|dnp3|opcua"`}</pre>

      <Callout type="key" title="tshark -T fields Is Your Extract Engine">
        The <code>-T fields -e fieldname</code> combination turns tshark into a structured data extractor. Pipe the output to awk, Python, or a log aggregator. This is how you build automated Modbus write logs, DNP3 command audit trails, or OPC UA session summaries without any commercial tooling.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">editcap — Slicing and Converting Captures</h2>

      <p>
        <code>editcap</code> modifies existing capture files: slice by time range, remove duplicates, convert between formats, and split large files.
      </p>

      <pre>{`# Extract a time slice (2-hour window during an incident)
editcap -A "2025-03-15 02:00:00" -B "2025-03-15 04:00:00" \\
  full_capture.pcapng incident_window.pcapng

# Convert pcapng to pcap for a tool that doesn't support pcapng
editcap -F pcap input.pcapng output.pcap

# Remove duplicate packets (same content within 1ms)
editcap -d capture.pcapng dedup.pcapng

# Split a large capture into 100MB chunks
editcap -c 100000 large.pcapng chunk_.pcapng`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">mergecap and capinfos</h2>

      <pre>{`# Merge two captures (e.g., from two SPAN ports on same switch)
mergecap -w merged.pcapng span_port_1.pcapng span_port_2.pcapng

# Get metadata about a capture file
capinfos capture.pcapng
# Output includes: file size, duration, packet count, start/end time,
# average packet rate, average bit rate, interface info

# Quick count of packets in a large file (without full parse)
capinfos -c capture.pcapng`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Custom Coloring Rules</h2>

      <p>
        For real-time Wireshark monitoring, custom coloring rules make anomalies visually immediate. Go to View → Coloring Rules and add rules in priority order (top rules override lower ones):
      </p>

      <div className="space-y-2 my-5">
        {[
          { color: '#ef4444', label: 'Modbus Writes', filter: 'mbtcp.func_code in {5,6,15,16}', desc: 'Red background — any write command stands out immediately' },
          { color: '#f97316', label: 'DNP3 Direct Operate', filter: 'dnp3.ctl.func_code == 3 or dnp3.ctl.func_code == 4', desc: 'Orange — highest-risk DNP3 operations' },
          { color: '#fbbf24', label: 'Modbus Exceptions', filter: 'mbtcp.func_code >= 128', desc: 'Yellow — devices reporting errors' },
          { color: '#22d3ee', label: 'TCP Retransmissions', filter: 'tcp.analysis.retransmission', desc: 'Cyan — link health indicator' },
          { color: '#34d399', label: 'OPC UA Writes', filter: 'opcua.serviceid == 0x01a5', desc: 'Green — OPC UA write service calls' },
        ].map(({ color, label, filter, desc }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{label}</span>
                <code className="text-xs" style={{ color: '#7dd3fc' }}>{filter}</code>
              </div>
              <div className="text-xs text-slate-600">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Automation with tshark + Python</h2>

      <p>
        The full automated OT monitoring pipeline: <code>dumpcap</code> captures to ring buffer → <code>tshark</code> processes each completed file → Python sends alerts.
      </p>

      <pre>{`#!/usr/bin/env python3
"""Minimal Modbus write alerter — processes pcap files as they're completed."""
import subprocess, sys, time, os
from pathlib import Path

WATCH_DIR = Path("/captures")
PROCESSED = set()

def analyze(pcap_path):
    result = subprocess.run([
        "tshark", "-r", str(pcap_path),
        "-Y", "mbtcp.func_code in {5,6,15,16}",
        "-T", "fields",
        "-e", "frame.time", "-e", "ip.src", "-e", "mbtcp.func_code",
        "-e", "mbtcp.reference_num",
    ], capture_output=True, text=True)
    for line in result.stdout.strip().splitlines():
        ts, src, fc, addr = (line.split("\\t") + [""] * 4)[:4]
        print(f"[ALERT] Modbus WRITE: t={ts} src={src} FC={fc} addr={addr}")
        # TODO: send to SIEM, Slack, PagerDuty

while True:
    for f in sorted(WATCH_DIR.glob("*.pcapng")):
        if f not in PROCESSED:
            analyze(f)
            PROCESSED.add(f)
    time.sleep(5)`}</pre>

      <Callout type="pro" title="The $15 OT Monitor">
        A Raspberry Pi Zero W (~$15), running Raspbian, with Wireshark's dumpcap and a Python alerter like the above, is a functional OT anomaly detection sensor. Attach it to a SPAN port on your OT switch. Run dumpcap to a USB drive with a ring buffer. Run the Python alerter. When it fires, SSH in and open the flagged pcap in tshark or Wireshark. This is not a replacement for a commercial IDS — but it's running Monday morning when the commercial sensor is still being procured.
      </Callout>

      <Callout type="field" title="Field Gotcha: Lua Post-Dissectors for Custom Columns">
        Wireshark's custom columns let you display any dissector field in the Packet List pane. Right-click any column header → Column Preferences → add a column with Type "Custom" and the field name (e.g., <code>mbtcp.func_code</code>). Now function codes appear directly in the packet list without expanding the detail pane. For OT monitoring profiles, add columns for: mbtcp.func_code, mbtcp.reference_num, dnp3.al.func_code, opcua.serviceid. Build this as a profile (Edit → Configuration Profiles) and share it with your team.
      </Callout>

      <FunFact index={8} />

      <QuizLevels chapterId="advanced" />
    </ChapterLayout>
  )
}
