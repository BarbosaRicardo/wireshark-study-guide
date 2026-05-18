export const CHAPTERS = [
  { id: 'home',        label: 'Home',                             title: 'Home',                               path: '/',          icon: 'Home',       prev: null,        next: null         },
  { id: 'intro',       label: 'Ch 1: Intro to Wireshark',      title: 'Introduction to Wireshark',          path: '/intro',     icon: 'ScanSearch', prev: null,        next: 'capture'    },
  { id: 'capture',     label: 'Ch 2: Capture Techniques',       title: 'Capture Techniques & Interfaces',    path: '/capture',   icon: 'Wifi',       prev: 'intro',      next: 'filters'    },
  { id: 'filters',     label: 'Ch 3: Display Filters',          title: 'Display & Capture Filters',         path: '/filters',   icon: 'Filter',     prev: 'capture',    next: 'dissectors' },
  { id: 'dissectors',  label: 'Ch 4: Protocol Dissectors',      title: 'Protocol Dissectors & Decode As',   path: '/dissectors',icon: 'Layers',     prev: 'filters',    next: 'modbus'     },
  { id: 'modbus',      label: 'Ch 5: Modbus Analysis',          title: 'Analyzing Modbus on the Wire',      path: '/modbus',    icon: 'Network',    prev: 'dissectors', next: 'dnp3'       },
  { id: 'dnp3',        label: 'Ch 6: DNP3 Analysis',            title: 'Analyzing DNP3 Traffic',            path: '/dnp3',      icon: 'Zap',        prev: 'modbus',     next: 'opcua'      },
  { id: 'opcua',       label: 'Ch 7: OPC UA Analysis',          title: 'Analyzing OPC UA Sessions',         path: '/opcua',     icon: 'Globe',      prev: 'dnp3',       next: 'security'   },
  { id: 'security',    label: 'Ch 8: Security Analysis',        title: 'Security Analysis & Anomaly Detection', path: '/security', icon: 'Shield',  prev: 'opcua',      next: 'advanced'   },
  { id: 'advanced',    label: 'Ch 9: Advanced Techniques',      title: 'Advanced Wireshark Techniques',     path: '/advanced',  icon: 'Terminal',   prev: 'security',   next: 'lab'        },
  { id: 'lab',         label: 'Ch 10: Protocol Lab',            title: 'Protocol Analysis Lab',             path: '/lab',       icon: 'FlaskConical', prev: 'advanced', next: null         },
  { id: 'flashcards',  label: 'Flashcards',                     title: 'Flashcards',                        path: '/flashcards',icon: 'CreditCard', prev: null,         next: null         },
]

export const ANALOGIES = {
  intro:      { text: "Wireshark is a stethoscope for your network. Doctors don't guess what's wrong with a patient — they listen. Engineers shouldn't guess what's wrong with a protocol — they capture.", author: "Every OT network analyst, eventually" },
  capture:    { text: "Promiscuous mode is like eavesdropping at a party. You hear every conversation, not just the ones addressed to you. Your switch's span port is the party room with no doors.", author: "Network tap installation manual" },
  filters:    { text: "A display filter without a capture filter is like a coffee shop that serves everything and then asks 'what did you want?' — it works, but you're drowning in packets you never needed.", author: "Wireshark pro tip, slide 3" },
  dissectors: { text: "A protocol dissector is Wireshark's Rosetta Stone — it knows the byte layout of a protocol and translates raw hex into human-readable field names. Without it, you're reading hieroglyphics.", author: "Wireshark dissector plugin guide" },
  modbus:     { text: "Modbus has no authentication, no encryption, no sequence numbers. If you capture it, you see everything. If an attacker captures it, they see everything. Wireshark makes this immediately obvious.", author: "ICS security audit, day one" },
  dnp3:       { text: "DNP3 was designed when eavesdropping required physical access to a serial cable. In the TCP/IP world, Wireshark can capture a week of substation traffic from any compromised laptop on the network.", author: "DNP3 Secure Authentication white paper, reason for its existence" },
  opcua:      { text: "OPC UA's security modes sound reassuring: None, Sign, SignAndEncrypt. Wireshark will show you exactly which mode your system is actually using — and most production systems that should use SignAndEncrypt are using None.", author: "OPC UA field audit, anonymous" },
  security:   { text: "Anomaly detection in ICS isn't hard — it's just pattern recognition. A Modbus master that has polled the same 10 coils every 5 seconds for 3 years doesn't suddenly need to write to 500 holding registers at 2 AM.", author: "ICS incident response playbook" },
  advanced:   { text: "tshark running on a Pi Zero, capturing to a ring buffer, forwarding alerts via SMS — that's a $15 network anomaly detector. Wireshark is not just a desktop tool.", author: "Field engineer, Bakersfield CA" },
  lab:        { text: "The best Wireshark practice is your own production traffic. The second best is replaying PCAPs. The worst is never looking at the wire at all — which is what 80% of engineers do.", author: "Protocol analysis workshop, instructor note" },
}

export const FUN_FACTS = [
  { text: "Wireshark was originally called 'Ethereal' when Gerald Combs wrote it in 1998. He renamed it in 2006 after leaving the company that owned the trademark — proof that open source naming disputes are as old as the internet.", icon: 'Info' },
  { text: "The pcap file format (libpcap) is so universal that virtually every network tool in existence can read it — Wireshark, tcpdump, Snort, Zeek, nmap, and every major SIEM. A 20-year-old PCAP from 2005 opens perfectly in Wireshark today.", icon: 'Archive' },
  { text: "Modbus TCP has no checksum in the TCP variant — it relies entirely on TCP for error detection. The Modbus RTU CRC is dropped. This surprises engineers who assume the TCP framing carries the same integrity guarantees as the serial version.", icon: 'AlertTriangle' },
  { text: "A single Wireshark capture session during a real ICS incident has led to recovery times dropping from days to hours. The 2015 Ukraine power grid attack involved protocols that left clear forensic evidence in PCAPs — investigators reconstructed the entire attack sequence from network captures.", icon: 'Zap' },
  { text: "Wireshark has 3,000+ built-in protocol dissectors. Of these, roughly 30 matter for SCADA engineers: Modbus, DNP3, OPC UA, IEC 60870-5-104, IEC 61850, EtherNet/IP, PROFINET, BACnet, ICCP, and their underlying transports.", icon: 'Layers' },
  { text: "The 'Follow TCP Stream' feature in Wireshark was added because engineers complained they couldn't see the conversation — only individual packets. It reassembles the full byte stream of a TCP session, making protocol analysis feel like reading a transcript rather than sorting puzzle pieces.", icon: 'MessageSquare' },
  { text: "Running Wireshark as root is a security risk. The correct approach is to use dumpcap (which ships with Wireshark) with appropriate group permissions — on Linux, add the user to the 'wireshark' group. This is documented and consistently ignored.", icon: 'Shield' },
  { text: "The first time most engineers see a Modbus write command in Wireshark, they realize there's no authentication field in the frame. There's no 'who sent this' field either. Any device on the network can send Function Code 06 to any slave. Wireshark makes this viscerally real.", icon: 'Lock' },
  { text: "tshark, the command-line version of Wireshark, can be embedded in scripts to monitor specific conditions and alert. A two-line bash script using tshark can detect unauthorized Modbus write commands and send a notification — no commercial SIEM required.", icon: 'Terminal' },
  { text: "OPC UA's wire format uses a custom binary encoding (OPC UA Binary) or SOAP/XML. Wireshark's OPC UA dissector handles both. The binary version is more common in production — Wireshark identifies it by the 'OPC.TCP' magic bytes at the start of each message.", icon: 'Binary' },
  { text: "DNP3 Secure Authentication (SAv5) was added to the protocol specifically because researchers demonstrated a man-in-the-middle attack using a laptop and Wireshark. The attack required no special hardware — just a captured session and replay.", icon: 'AlertOctagon' },
  { text: "The 'Statistics > I/O Graph' feature in Wireshark can visualize protocol polling intervals. A perfectly regular 5-second spike in Modbus traffic is a healthy RTU scan. An irregular pattern — or a sudden burst — is a diagnostic flag worth investigating.", icon: 'BarChart2' },
]

export const FIELD_STORIES = [
  {
    title: "The Capture That Proved the PLC Was Right",
    icon: "Terminal",
    story: "An industrial network engineer spent three days being told by a PLC vendor that their device was sending correct Modbus responses. The SCADA engineer insisted the responses were malformed. Both had logs. Neither trusted the other's logs. A Wireshark capture on the network segment between them showed, in 90 seconds, that the PLC was sending correct Modbus RTU responses but the TCP gateway was retransmitting them with a corrupted length field. Neither the PLC nor the SCADA system was wrong. The gateway firmware had a bug. The vendor released a patch the following week. Without the packet capture, this would have been a multi-month finger-pointing exercise."
  },
  {
    title: "The OPC UA Session That Went to SecurityMode=None",
    icon: "Shield",
    story: "A security audit team used Wireshark to capture OPC UA traffic on the plant network. They expected to see encrypted sessions. Instead, they saw plaintext XML-encoded OPC UA — fully readable, including tag names, process values, and write commands. Filtering on port 4840 and following the TCP stream showed every operator action for the past 4 hours of the capture. The SCADA integrator had deployed SecurityMode=None and never changed it. The Wireshark capture became Exhibit A in the audit finding. The remediation project took 6 months and cost more than the original integration."
  },
  {
    title: "The 10-Second Timeout That Was Actually 10,001ms",
    icon: "AlertOctagon",
    story: "A Modbus TCP application was timing out every polling cycle on one specific device. The engineer increased the timeout from 5 seconds to 10 seconds. The device still timed out. A Wireshark capture filtered on the device IP showed the actual response time: 10,001ms — one millisecond over the 10-second timeout. The device was responding correctly; it just took slightly over 10 seconds. The engineer set the timeout to 12 seconds and the problem vanished. Without the capture, the next step would have been RMA-ing the device. The device was fine."
  },
  {
    title: "The Retransmit Storm That Wasn't TCP",
    icon: "AlertTriangle",
    story: "A plant network was experiencing periodic slowdowns every 4 hours. Wireshark Statistics > TCP Stream Graphs showed massive retransmit spikes. The network team replaced a switch. The problem continued. A closer look at the capture showed the retransmits were coming from an OPC UA server that was flooding the network during its historian write batch — 800 simultaneous connections all flushing at once. The 'retransmit storm' was legitimate TCP traffic, just very poorly timed. The fix: stagger historian writes across 10-second windows. The slowdowns disappeared. The switch the network team replaced was fine."
  },
  {
    title: "The DNP3 Packet That Wasn't DNP3",
    icon: "Ghost",
    story: "A substation engineer reported that the Wireshark DNP3 dissector was showing malformed frames on one outstation. Every fourth or fifth frame was flagged as a DNP3 error. The engineer suspected a firmware bug. A capture filtered on 0x0564 start bytes showed the malformed 'frames' were not DNP3 at all — they were RS-485 noise from a nearby VFD that happened to start with 0x05 followed by a byte close to 0x64. The serial-to-TCP gateway was forwarding all received bytes, including noise. The actual DNP3 frames were fine. The noise frames were the VFD's switching frequency artifacts. A ferrite core on the RS-485 cable eliminated them."
  },
]

export const CHAPTER_HOOKS = {
  intro:      "You suspect a Modbus device is sending malformed responses. Your colleague says their application log shows correct data. You disagree. What is the one thing Wireshark can show you that no application log can — and why does it settle the argument?",
  capture:    "You want to capture traffic from a device on a managed switch. The switch only delivers traffic addressed to your MAC. What two options do you have — and which one doesn't require switch reconfiguration?",
  filters:    "You have a 2GB PCAP of mixed traffic from a busy substation. You need to see only DNP3 frames from one specific outstation. Write the display filter — and what would change if you had set a capture filter instead?",
  dissectors: "A protocol Wireshark doesn't recognize shows as raw TCP data. What two methods can you use to tell Wireshark to decode it as a known protocol — and when does each method work?",
  modbus:     "A Modbus TCP poll returns exception code 0x04 (Server Device Failure). Your application logs show this as 'device offline.' The device is actually running. What does the Wireshark capture reveal that the application log hides?",
  dnp3:       "A Wireshark capture shows a DNP3 outstation sending responses with IIN1.6 set. Your SCADA master isn't alarming. What does IIN1.6 mean — and what's the risk of your master ignoring it?",
  opcua:      "You capture OPC UA traffic and see the SecurityMode field as 'None' in every session establishment. What does that mean for the data being exchanged — and what can anyone on the network segment do with that information?",
  security:   "You run Wireshark on your plant network for 10 minutes and see Modbus write commands you didn't expect. What's your next step before you escalate to a security incident?",
  advanced:   "tshark can run continuously on a Linux machine and write to a ring buffer. What does that enable that the Wireshark GUI cannot do — and what's a realistic production use case?",
  lab:        "Before you use Wireshark on a production network: what three things should you verify to avoid accidentally disrupting traffic or violating policy?",
}

export const CHAPTER_RETRIEVAL = {
  intro:      { q: "What was Wireshark originally called, and when was it renamed?", a: "Originally 'Ethereal' (1998); renamed 'Wireshark' in 2006 when the creator left the company that owned the trademark" },
  capture:    { q: "What is promiscuous mode in Wireshark — and what does it capture that normal mode doesn't?", a: "Promiscuous mode captures all frames on the network segment, not just those addressed to your NIC" },
  filters:    { q: "What is the Wireshark display filter for DNP3 traffic?", a: "dnp3 — or dnp3 && ip.addr==x.x.x.x to filter by device IP" },
  dissectors: { q: "What Wireshark feature lets you decode a TCP stream as a specific protocol that Wireshark doesn't auto-detect?", a: "Decode As — right-click a packet and select Decode As to manually assign a dissector" },
  modbus:     { q: "What Wireshark display filter shows only Modbus TCP traffic?", a: "modbus — or mbtcp for the transport layer; tcp.port==502 if the dissector isn't auto-applying" },
  dnp3:       { q: "What two bytes start every DNP3 frame — and what Wireshark filter finds them?", a: "0x05 0x64 — display filter: dnp3 or frame contains 05:64" },
  opcua:      { q: "What Wireshark display filter shows OPC UA traffic?", a: "opcua — Wireshark auto-dissects OPC UA Binary on port 4840 and 4843" },
  security:   { q: "What Wireshark feature helps you identify which connections have the most retransmits or resets?", a: "Statistics > TCP Stream Graphs, or Statistics > Conversations sorted by bytes/packets" },
  advanced:   { q: "What is the command-line Wireshark tool that allows headless capture and analysis?", a: "tshark — supports all Wireshark dissectors and filters in a scriptable CLI interface" },
  lab:        { q: "What Wireshark feature lets you replay a PCAP file to test dissectors or applications?", a: "tcpreplay (external tool) or File > Export to replay; Wireshark itself is a passive analyzer only" },
}
