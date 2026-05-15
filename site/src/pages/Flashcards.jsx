import React, { useState, useEffect, useCallback } from 'react'
import { RotateCcw, Shuffle, ChevronLeft, ChevronRight, Check, X, BookOpen, Keyboard } from 'lucide-react'

const STORAGE_KEY = 'wireshark_flashcard_v1'

const FLASHCARD_CHAPTERS = [
  { id: 'all',       label: 'All Topics' },
  { id: 'basics',    label: '🦈 Wireshark Basics' },
  { id: 'capture',   label: '📡 Capture' },
  { id: 'filters',   label: '🔎 Filters' },
  { id: 'modbus',    label: '⚙️ Modbus' },
  { id: 'dnp3',      label: '⚡ DNP3' },
  { id: 'opcua',     label: '🌐 OPC UA' },
  { id: 'security',  label: '🛡️ Security' },
]

const FLASHCARDS = [
  // BASICS
  { id: 'b01', chapter: 'basics', front: 'What is Wireshark?', back: 'Wireshark is a free, open-source packet analyzer. It captures packets from a network interface and decodes them into human-readable fields using protocol dissectors. It does not generate or modify traffic — it is a passive listener. Supports pcap and pcapng file formats. Ships with 3,000+ built-in protocol dissectors.' },
  { id: 'b02', chapter: 'basics', front: 'Three pane interface — Packet List', back: 'The top pane in Wireshark. Shows one row per captured packet with columns: No. (packet number), Time (relative or absolute), Source (IP or MAC), Destination, Protocol (highest-layer identified), Length (bytes), Info (dissector summary). Click a row to select that packet for inspection in the lower panes.' },
  { id: 'b03', chapter: 'basics', front: 'Three pane interface — Packet Details', back: 'The middle pane. Shows the selected packet decoded into expandable protocol layers. For an OT packet this might show: Frame → Ethernet II → IPv4 → TCP → Modbus/TCP. Expand each layer to see individual field names and values. Clicking a field in this pane highlights the corresponding bytes in the Packet Bytes pane.' },
  { id: 'b04', chapter: 'basics', front: 'Three pane interface — Packet Bytes', back: 'The bottom pane. Shows the raw bytes of the selected packet as hexadecimal (left) and ASCII (right). When you click a field in the Packet Details pane, the corresponding bytes are highlighted here. Essential for verifying that a dissector is reading the right bytes, and for spotting data that the dissector doesn\'t decode.' },
  { id: 'b05', chapter: 'basics', front: 'pcap vs pcapng file format', back: 'pcap: the legacy libpcap format — universally supported by every network tool (tcpdump, Snort, Zeek, SIEMs). Single capture interface, 32-bit timestamps (microsecond resolution). pcapng: next-generation format — supports multiple interfaces per file, packet annotations, hardware timestamps (nanosecond), interface statistics. Use pcapng for new captures; export pcap for maximum tool compatibility.' },
  { id: 'b06', chapter: 'basics', front: 'Protocol dissector', back: 'A Wireshark module that knows the byte layout of a specific protocol. When Wireshark captures a packet, it identifies the protocol (by port number, magic bytes, or framing) and hands it to the registered dissector. The dissector decodes each byte or bit field into a named value. Wireshark ships with 3,000+ dissectors. Custom dissectors can be written in Lua or C.' },
  { id: 'b07', chapter: 'basics', front: 'Promiscuous mode', back: 'A network interface setting that causes the adapter to accept ALL frames on the wire, not just frames addressed to its own MAC address. Required for packet capture on shared media (hubs, Wi-Fi). On a switched network, promiscuous mode still only shows traffic the switch sends to your port (unicast to your MAC, broadcasts, multicasts). A SPAN port or network tap is additionally required for switched network traffic.' },
  { id: 'b08', chapter: 'basics', front: 'Protocol Hierarchy Statistics', back: 'Wireshark menu: Statistics → Protocol Hierarchy. Shows every protocol detected in the capture, count of packets, percentage of traffic, and bytes. Used for: quickly identifying what\'s on a network, spotting unusual protocol mixes, finding ICS protocols, identifying unknown traffic (high-volume "data" without a decoded protocol). Run this first on any unfamiliar OT capture.' },
  { id: 'b09', chapter: 'basics', front: 'Expert Information', back: 'Wireshark menu: Analyze → Expert Information. Categorizes anomalous packets by severity: Error (malformed, checksum failure), Warning (retransmission, out-of-order, duplicate ACK), Note (keep-alive, connection reset), Chat (normal handshake events). In OT analysis, high Warning counts between HMI and PLC point to communication health problems — bad cable, congested link, or overloaded device.' },
  { id: 'b10', chapter: 'basics', front: 'Follow TCP Stream', back: 'Right-click any packet in a TCP session → Follow → TCP Stream. Reassembles all payload data from both sides of the connection into a single chronological view. Essential for reading application-layer conversations: the full sequence of Modbus requests and responses, DNP3 session data, OPC UA service calls. Makes protocol behavior immediately visible without packet-by-packet navigation.' },

  // CAPTURE
  { id: 'c01', chapter: 'capture', front: 'BPF (Berkeley Packet Filter) syntax', back: 'The capture filter syntax used by Wireshark, tcpdump, and libpcap. Executed in the kernel before packets reach userspace — extremely efficient, virtually zero CPU overhead. Common BPF expressions: port 502 (Modbus), host 192.168.1.100, not arp, port 20000 or port 502. Combine with and/or/not. BPF capture filters and Wireshark display filters use completely different syntax.' },
  { id: 'c02', chapter: 'capture', front: 'SPAN port (mirror port)', back: 'A switch feature that copies traffic from specified ports or VLANs to a designated SPAN port. Connect your capture machine to the SPAN port to see traffic between other devices on the switch. Limitations: switch CPU overhead under load, may drop packets at high traffic rates, requires a managed switch. Good for: spot checks, assessments, short-duration captures. Not ideal for continuous OT monitoring.' },
  { id: 'c03', chapter: 'capture', front: 'Network tap vs SPAN port', back: 'A network tap is a physical inline device that passively copies all traffic between two devices to a monitor port. Passive (optical) taps require no power and have zero packet loss. Active taps aggregate both directions into one port. Taps do not affect the primary link — the switch never knows a tap is present. Preferred over SPAN for: forensic captures, continuous OT monitoring, and high-availability links where switch CPU loading is unacceptable.' },
  { id: 'c04', chapter: 'capture', front: 'dumpcap — headless capture', back: 'The capture engine component of Wireshark, available as a standalone CLI tool. Captures without a GUI — suitable for deployment on headless OT systems (historians, Raspberry Pis). Key flags: -i (interface), -w (output file), -b filesize:N (ring buffer file size in KB), -b files:N (max number of ring buffer files), -f (BPF capture filter). Ring buffer example: dumpcap -i eth0 -w /cap.pcapng -b filesize:10240 -b files:50' },
  { id: 'c05', chapter: 'capture', front: 'Remote capture via SSH pipe', back: 'Pipe tcpdump on a remote Linux machine through SSH into a local Wireshark instance: ssh user@10.0.0.50 "tcpdump -i eth0 -U -w - port 502" | wireshark -k -i -. The -U flag makes tcpdump write each packet immediately (no buffering). -w - writes to stdout. Wireshark -i - reads from stdin, -k starts capture immediately. You get live GUI analysis of remote OT traffic from your laptop.' },
  { id: 'c06', chapter: 'capture', front: 'Capture buffer drops', back: 'Wireshark shows "Packets dropped" in the status bar when libpcap is receiving packets faster than the OS can hand them to Wireshark. Causes: no capture filter (capturing everything), high-bandwidth link, slow capture machine. Fix: apply a BPF capture filter to reduce volume (port 502 for Modbus only, etc.), or use dumpcap instead of Wireshark GUI (lower overhead), or increase the capture buffer size (-B flag in dumpcap).' },
  { id: 'c07', chapter: 'capture', front: 'Ring buffer capture', back: 'A continuous capture mode where files are written in sequence and old files are overwritten when the maximum is reached. Provides a rolling window of recent traffic without unbounded disk usage. Configure in Wireshark: Capture Options → Output → Create a new file every N MB + ring buffer with N files. With CLI: dumpcap -b filesize:10240 -b files:50 gives 50 × 10MB = 500MB total. Standard approach for continuous OT monitoring.' },

  // FILTERS
  { id: 'f01', chapter: 'filters', front: 'Display filter vs capture filter', back: 'Capture filters (BPF syntax) run before packets are stored — packets that don\'t match are never saved. Display filters (Wireshark expression language) run after capture — all packets stored, only matching ones shown. Different syntax entirely. Capture filters are for performance (reducing volume). Display filters are for analysis (finding specific traffic in a large capture). You can apply and remove display filters without losing any captured packets.' },
  { id: 'f02', chapter: 'filters', front: 'Display filter color code', back: 'The filter bar background color indicates validity: green = valid filter syntax, red/pink = syntax error, yellow = valid but deprecated syntax. If the bar stays red, there\'s a syntax error. Use Ctrl+Space for autocomplete to see valid field names. Check field names in the Display Filter Reference: wireshark.org/docs/dfref/. A filter that shows no packets is not necessarily wrong — it might just match nothing in the current capture.' },
  { id: 'f03', chapter: 'filters', front: 'ip.addr vs ip.src / ip.dst', back: 'ip.addr == 10.0.0.1 matches any packet where 10.0.0.1 appears as either source or destination. ip.src == 10.0.0.1 matches only packets sent FROM that address. ip.dst == 10.0.0.1 matches only packets sent TO that address. For security analysis: to find all traffic between two specific hosts, use ip.addr == A and ip.addr == B (both must appear somewhere in the packet — either direction).' },
  { id: 'f04', chapter: 'filters', front: 'mbtcp display filter — Modbus TCP', back: 'The Wireshark filter keyword for Modbus TCP is mbtcp. Key fields: mbtcp.func_code (function code 1-16, plus 128+ for exception responses), mbtcp.reference_num (register/coil start address), mbtcp.word_cnt (quantity of registers), mbtcp.unit_id (Modbus slave/unit ID), mbtcp.data (raw data bytes). Security filter: mbtcp.func_code in {5,6,15,16} — all write operations.' },
  { id: 'f05', chapter: 'filters', front: 'tcp.analysis.retransmission', back: 'A Wireshark display filter that matches TCP packets identified as retransmissions by the TCP analysis engine. A retransmission means the sender did not receive an ACK within the timeout and resent the data. In OT networks, retransmissions between an HMI and a PLC indicate: bad cable, congested link, overloaded PLC, or network equipment issue. A high retransmission rate for OT protocol traffic warrants physical inspection.' },
  { id: 'f06', chapter: 'filters', front: '"in" set operator in display filters', back: 'The in operator tests whether a field value is a member of a set: mbtcp.func_code in {5, 6, 15, 16}. Equivalent to mbtcp.func_code==5 or mbtcp.func_code==6 or mbtcp.func_code==15 or mbtcp.func_code==16. Also works for IP addresses: ip.addr in {10.0.0.1, 10.0.0.2, 192.168.1.100}. Much more readable than long chains of OR conditions.' },
  { id: 'f07', chapter: 'filters', front: 'Saving display filters as buttons', back: 'Right-click the filter bar → Manage Display Filters, or click the bookmark icon at the left of the filter bar. Enter a filter expression and a label. The saved filter appears as a clickable button. For OT analysis, save: all Modbus writes (mbtcp.func_code in {5,6,15,16}), Modbus exceptions (mbtcp.func_code >= 128), DNP3 operates (dnp3.ctl.func_code == 3), TCP retransmissions. Share the filter file across your team.' },

  // MODBUS
  { id: 'm01', chapter: 'modbus', front: 'Modbus TCP MBAP header fields', back: 'MBAP = Modbus Application Protocol header. 6 bytes preceding the PDU: Transaction Identifier (2B, used to match request/response), Protocol Identifier (2B, always 0x0000 for Modbus), Length (2B, byte count of remaining frame including Unit ID), Unit ID (1B, slave/device address for routing through gateways). The MBAP header is what differentiates Modbus TCP from Modbus RTU at the wire level.' },
  { id: 'm02', chapter: 'modbus', front: 'Modbus Function Code 03 — Read Holding Registers', back: 'FC 03 reads one or more 16-bit holding registers from a slave. Request: FC=0x03, Starting Address (2B), Quantity of Registers (2B). Response: FC=0x03, Byte Count, Register Values (2 bytes per register). Most common Modbus function code — used for reading analog values, process variables, setpoints. In Wireshark: mbtcp.func_code == 3. The response\'s data bytes are the register values in big-endian order.' },
  { id: 'm03', chapter: 'modbus', front: 'Modbus Function Code 06 — Write Single Register', back: 'FC 06 writes a single 16-bit value to one holding register. Request: FC=0x06, Register Address (2B), Value to Write (2B). Response echoes the request (same address and value, confirming success). This is the simplest write function code. In Wireshark: mbtcp.func_code == 6. In OT security: any FC 06 command from an unexpected source IP is a potential unauthorized write — filter and investigate immediately.' },
  { id: 'm04', chapter: 'modbus', front: 'Modbus exception response', back: 'When a slave cannot execute a requested function, it responds with the original function code ORed with 0x80 (high bit set), followed by a 1-byte exception code. FC 03 becomes 0x83 in the exception response. Common exception codes: 01 = Illegal Function (not supported by device), 02 = Illegal Data Address (address doesn\'t exist), 03 = Illegal Data Value, 04 = Slave Device Failure. Display filter: mbtcp.func_code >= 128.' },
  { id: 'm05', chapter: 'modbus', front: 'Modbus 0-based vs 1-based addressing', back: 'Modbus has two address spaces that coexist and confuse engineers. The wire-level protocol uses 0-based addresses (0x0000–0xFFFF in the PDU). Engineering documentation and HMI software often uses 1-based "register numbers" (40001 = holding register address 0). The PDU contains 0-based addresses. When Wireshark shows reference_num=0, that corresponds to register 40001 (holding register convention) or 1 (1-based addressing).' },
  { id: 'm06', chapter: 'modbus', front: 'Modbus Unit ID (Slave Address)', back: 'The Unit ID (also called Slave Address or Station Address) is a 1-byte field in the MBAP header. In a direct TCP connection to a single PLC, it\'s often 0x01 or 0xFF. Its primary purpose is routing through Modbus gateways — a single TCP connection to a gateway can reach multiple serial Modbus RTU slaves, each identified by Unit ID. A gateway strips the MBAP header and adds a Modbus RTU address before forwarding to the serial bus.' },
  { id: 'm07', chapter: 'modbus', front: 'Detecting unauthorized Modbus writes in Wireshark', back: 'Baseline step 1: identify all legitimate Modbus master IP addresses (HMI, SCADA server). Baseline step 2: identify all address ranges they write to during normal operations. Detection filter: mbtcp.func_code in {5, 6, 15, 16}. Then: inspect ip.src for each result. Any source IP not in the baseline allowlist, or any register address outside the normal range, is an anomaly. Check Statistics → Conversations to find all hosts that sent write commands.' },
  { id: 'm08', chapter: 'modbus', front: 'Modbus register scanning (reconnaissance)', back: 'An attacker or misconfigured device can map a PLC\'s register space by sending sequential FC 03 Read Holding Register requests starting from address 0 and incrementing. Addresses that don\'t exist return Exception Code 02 (Illegal Data Address). This reveals which addresses hold data. In Wireshark, this appears as many FC 03 requests with sequential mbtcp.reference_num values, most getting exception responses. Legitimate polling reads known addresses, not sequential ranges.' },

  // DNP3
  { id: 'd01', chapter: 'dnp3', front: 'DNP3 three-layer architecture', back: 'DNP3 runs a three-layer stack: Data Link Layer (framing, addressing, error detection — start bytes 0x0564), Transport Layer (fragmentation/reassembly — FIR and FIN bits indicate first and final fragments), Application Layer (function codes, object groups, data content). Over TCP/IP, the Data Link and Transport layers are preserved — they don\'t disappear just because TCP provides reliability. Wireshark shows all three layers in the dissector output.' },
  { id: 'd02', chapter: 'dnp3', front: 'DNP3 source and destination addresses', back: 'DNP3 uses 16-bit addresses (0–65534) for source and destination, independent of IP addressing. Address 0xFFFF = broadcast. In a typical system: SCADA master might be address 1, outstations (RTUs) are 10, 11, 12... A DNP3 packet carries BOTH the IP address (TCP/IP layer) and the DNP3 address (data link layer). Wireshark shows both. dnp3.src and dnp3.dst are the DNP3 layer addresses. Unexpected dnp3.src values indicate rogue or spoofed traffic.' },
  { id: 'd03', chapter: 'dnp3', front: 'DNP3 Function Code 3 — Direct Operate', back: 'Function code 0x03 (3). Immediately commands a field device to execute an action — open/close a breaker, activate an output, set a relay. The most operationally critical DNP3 function code. Direct Operate vs Select-Before-Operate (SBO): Direct Operate sends a command and immediately executes. SBO sends a Select (FC 0x01) first, waits for confirmation, then sends Operate (FC 0x02). Unauthorized Direct Operate commands are the mechanism for SCADA-based physical attacks. Display filter: dnp3.ctl.func_code == 3.' },
  { id: 'd04', chapter: 'dnp3', front: 'DNP3 Unsolicited Response', back: 'Function code 0x82 (130 decimal). An unsolicited response is sent by an outstation without being polled. The outstation has event objects configured with reporting thresholds: if a value changes by more than X, report immediately. In Wireshark, unsolicited responses appear as packets from outstation → master without a preceding request. The master acknowledges with a Confirm (FC 0x00). A flood of unsolicited responses indicates rapidly changing field conditions — alarm states, oscillating sensor, or equipment failure.' },
  { id: 'd05', chapter: 'dnp3', front: 'DNP3 Secure Authentication v5 (SAv5)', back: 'Defined in IEEE 1815-2012. Adds HMAC-based cryptographic authentication to DNP3 messages. Exchange: master sends Challenge (Object Group 120 Var 1), outstation responds with Challenge Reply (Group 120 Var 2) using HMAC-SHA256. The message being authenticated follows. Prevents replay and spoofing. Wireshark: Group 120 messages in the Packet Details indicate SAv5 is active. Most production DNP3 systems do NOT use SAv5 despite the standard being over a decade old.' },
  { id: 'd06', chapter: 'dnp3', front: 'DNP3 Object Groups', back: 'DNP3 data is organized into Object Groups and Variations. Group 1 = Binary Input (digital status), Group 2 = Binary Input Change (events), Group 10 = Binary Output Status, Group 12 = Control Relay Output Block (control operations — this is the one used with Direct Operate), Group 20 = Counter, Group 30 = Analog Input, Group 40 = Analog Output Status, Group 41 = Analog Output Block (write), Group 120 = Authentication.' },

  // OPC UA
  { id: 'o01', chapter: 'opcua', front: 'OPC UA security modes', back: 'OPC UA defines three security modes negotiated in OpenSecureChannel: None (no security — plaintext, no authentication), Sign (messages are digitally signed — integrity but no confidentiality), SignAndEncrypt (signed and encrypted — full security). The mode is visible in Wireshark in the OpenSecureChannel request. Security policy URI specifies the algorithm suite (e.g., Basic256Sha256 for SignAndEncrypt). Production OT systems should use SignAndEncrypt; most use None.' },
  { id: 'o02', chapter: 'opcua', front: 'OPC UA session establishment sequence', back: 'Sequence: (1) TCP connection to port 4840, (2) HEL/ACK — OPC UA hello handshake, (3) OpenSecureChannel — negotiates security mode and exchanges channel tokens, (4) CreateSession — client introduces itself and gets a session ID, (5) ActivateSession — authenticates the session (anonymous, username/password, or certificate), (6) Browse/Read/Write/Subscribe — operational services. CloseSession and CloseSecureChannel for orderly teardown.' },
  { id: 'o03', chapter: 'opcua', front: 'OPC UA NodeId', back: 'A NodeId uniquely identifies every node in the OPC UA address space (variables, objects, methods, types). It consists of: NamespaceIndex (which namespace), IdentifierType (Numeric, String, GUID, or ByteString), Identifier (the actual value). In Wireshark, OPC UA Read and Write service requests include NodeIds for each item being read or written. An OPC UA client writing to an unexpected NodeId is equivalent to a Modbus write to an unexpected register address.' },
  { id: 'o04', chapter: 'opcua', front: 'OPC UA Subscriptions and Publish cycle', back: 'A client creates a Subscription (CreateSubscription service) with a publishing interval. Then adds MonitoredItems (individual nodes to watch). The server sends PublishResponse messages when monitored items change beyond their deadband threshold, at the publishing interval. Client sends Publish requests to receive these notifications. Wireshark shows the full subscription negotiation and all Publish/PublishResponse exchanges — irregular intervals or unexpected MonitoredItem NodeIds are anomalies.' },
  { id: 'o05', chapter: 'opcua', front: 'OPC UA wire encoding', back: 'OPC UA supports multiple encodings: UA Binary (OPC UA Binary, opc.tcp transport) — compact binary format on TCP port 4840. UA XML (OPC UA XML/SOAP, http or https transport) — verbose XML format, used for IT integration. UA JSON (OPC UA JSON, http transport) — JSON format, newer and growing. Production OT systems almost exclusively use UA Binary. Wireshark\'s opcua dissector handles UA Binary. Traffic on port 4840 is UA Binary by default.' },
  { id: 'o06', chapter: 'opcua', front: 'Decrypting OPC UA TLS with SSLKEYLOGFILE', back: 'When OPC UA runs over TLS (port 4843), Wireshark cannot read content without session keys. If the client uses OpenSSL: set SSLKEYLOGFILE=/path/to/keys.log before launching the client. OpenSSL writes session keys to the file. In Wireshark: Edit → Preferences → Protocols → TLS → set "(Pre)-Master-Secret log filename" to the same path. Wireshark decrypts the sessions in real time. Only works if you control the client — cannot decrypt without the key material.' },

  // SECURITY
  { id: 's01', chapter: 'security', front: 'OT traffic baseline', back: 'A baseline is a documented "normal" state of OT network communication: which hosts communicate with which, on which ports, using which protocols, at what intervals and volumes. Establish by: capturing 24–72 hours during normal operations, then using Statistics → Conversations, Endpoints, and Protocol Hierarchy. Any deviation from baseline — new source IPs, new ports, new protocols, changed polling frequencies — is an anomaly worth investigating.' },
  { id: 's02', chapter: 'security', front: 'ARP poisoning detection in Wireshark', back: 'ARP poisoning occurs when an attacker sends gratuitous ARP replies claiming their MAC address corresponds to a legitimate IP (MITM setup). Wireshark detects this as a duplicate IP address warning in Expert Information (Analyze → Expert Information). Filter: arp. Look for: multiple ARP replies for the same IP with different MACs, or an IP changing its associated MAC address mid-capture. Wireshark flags "duplicate use of IP address detected" as a Warning-level event.' },
  { id: 's03', chapter: 'security', front: 'MITRE ATT&CK for ICS', back: 'A knowledge base of adversary tactics and techniques specific to industrial control systems. Relevant network-detectable techniques: T0843 Program Download (unexpected large writes to PLC), T0855 Unauthorized Command Message (writes from unknown IPs), T0856 Spoof Reporting Message (ARP spoofing to intercept sensor data), T0861 Point & Tag Identification (sequential register reads to map device), T0869 Standard Application Layer Protocol (using legitimate OT protocols for malicious commands). Each has associated Wireshark detection filters.' },
  { id: 's04', chapter: 'security', front: 'Chain of custody for PCAP evidence', back: 'For incidents with legal or regulatory implications (NERC CIP, safety events), PCAP files must be preserved as forensic evidence. Steps: (1) Immediately hash the original pcap with sha256sum, document the hash. (2) Work only from copies — never the original. (3) Document the capture metadata (interface, machine, timestamps, Wireshark version) using capinfos. (4) Store originals on write-protected media with access logs. A PCAP with no documented chain of custody may be challenged in regulatory proceedings.' },
  { id: 's05', chapter: 'security', front: 'Statistics → Conversations for anomaly detection', back: 'Statistics → Conversations shows every host-to-host pair that communicated, with packet counts, byte volumes, and duration. In OT security analysis: compare conversations against the baseline. A new conversation between hosts that never previously communicated is an immediate flag. Sort by "Bytes" to find unexpected high-volume connections. Sort by "Duration" to find persistent connections from new sources. This single view can reveal lateral movement, unauthorized access, and data exfiltration attempts.' },
  { id: 's06', chapter: 'security', front: 'NIST SP 800-82 and Wireshark', back: 'NIST Special Publication 800-82 (Guide to Industrial Control Systems Security) recommends network monitoring and traffic analysis for ICS environments. Rev 3 specifically addresses OT-specific network security monitoring. Key recommendations: establish communication baselines, monitor for unauthorized protocols, detect command injection via protocol anomaly analysis. Wireshark is the primary tool for hands-on implementation of these recommendations. GICSP exam tests knowledge of these guidelines.' },
]

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function saveProgress(prog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prog))
}

function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 15), s | 1) ^ (s + Math.imul(s ^ (s >>> 7), s | 61))) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards() {
  const [chapter, setChapter] = useState('all')
  const [progress, setProgress] = useState(loadProgress)
  const [shuffled, setShuffled] = useState(false)
  const [seed, setSeed] = useState(Date.now())
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const baseCards = chapter === 'all' ? FLASHCARDS : FLASHCARDS.filter(c => c.chapter === chapter)
  const cards = shuffled ? seededShuffle(baseCards, seed) : baseCards
  const current = cards[index] || null

  const isMastered = current ? !!progress[current.id]?.mastered : false
  const isSeen = current ? !!progress[current.id]?.seen : false
  const seenCount = cards.filter(c => progress[c.id]?.seen).length
  const masteredCount = cards.filter(c => progress[c.id]?.mastered).length
  const pct = cards.length ? Math.round((masteredCount / cards.length) * 100) : 0

  const go = useCallback((dir) => {
    if (animating) return
    setAnimating(true)
    setFlipped(false)
    setTimeout(() => {
      setIndex(i => {
        const next = i + dir
        if (next < 0) return cards.length - 1
        if (next >= cards.length) return 0
        return next
      })
      setAnimating(false)
    }, 200)
  }, [animating, cards.length])

  const flip = useCallback(() => {
    if (animating) return
    setFlipped(f => !f)
    if (current) {
      const p = { ...progress }
      p[current.id] = { ...p[current.id], seen: true }
      setProgress(p)
      saveProgress(p)
    }
  }, [animating, current, progress])

  const markMastered = useCallback(() => {
    if (!current) return
    const p = { ...progress }
    p[current.id] = { ...p[current.id], seen: true, mastered: true }
    setProgress(p)
    saveProgress(p)
    go(1)
  }, [current, progress, go])

  const markNeeds = useCallback(() => {
    if (!current) return
    const p = { ...progress }
    p[current.id] = { ...p[current.id], seen: true, mastered: false }
    setProgress(p)
    saveProgress(p)
    go(1)
  }, [current, progress, go])

  const resetProgress = () => {
    setProgress({})
    saveProgress({})
    setIndex(0)
    setFlipped(false)
  }

  const doShuffle = () => { setSeed(Date.now()); setShuffled(true); setIndex(0); setFlipped(false) }
  const unShuffle = () => { setShuffled(false); setIndex(0); setFlipped(false) }

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); flip() }
      if (e.code === 'ArrowRight' || e.code === 'KeyL') go(1)
      if (e.code === 'ArrowLeft' || e.code === 'KeyH') go(-1)
      if (e.code === 'KeyM') markMastered()
      if (e.code === 'KeyN') markNeeds()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flip, go, markMastered, markNeeds])

  useEffect(() => { setIndex(0); setFlipped(false) }, [chapter])

  if (!current) return (
    <div className="p-8 text-center text-slate-400">No cards for this category yet.</div>
  )

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: 'linear-gradient(135deg, #060e1a, #0f1e37, #0a1628)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen size={24} style={{ color: '#22d3ee' }} />
              Wireshark Flashcards
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{FLASHCARDS.length} cards · Space to flip · ← → navigate · M mastered · N needs review</p>
          </div>
          <button
            onClick={() => setShowHint(h => !h)}
            className="p-2 rounded-xl text-slate-400 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            title="Keyboard shortcuts"
          >
            <Keyboard size={20} />
          </button>
        </div>

        {showHint && (
          <div className="mb-4 p-4 rounded-2xl text-xs text-slate-500 grid grid-cols-2 gap-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div><kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>Space</kbd> Flip card</div>
            <div><kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>← →</kbd> Navigate</div>
            <div><kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>M</kbd> Mark mastered</div>
            <div><kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>N</kbd> Needs review</div>
          </div>
        )}

        {/* Chapter filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FLASHCARD_CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setChapter(ch.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={chapter === ch.id
                ? { background: '#0284c7', color: 'white', boxShadow: '0 0 12px rgba(14,165,233,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-6 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>{index + 1} / {cards.length} cards</span>
            <div className="flex gap-4">
              <span className="text-amber-500 font-semibold">{seenCount} seen</span>
              <span className="font-semibold" style={{ color: '#34d399' }}>{masteredCount} mastered</span>
              <span className="font-bold" style={{ color: '#22d3ee' }}>{pct}%</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="absolute left-0 top-0 h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${cards.length ? (seenCount / cards.length) * 100 : 0}%` }} />
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${cards.length ? (masteredCount / cards.length) * 100 : 0}%`, background: '#34d399' }} />
          </div>
          {cards.length <= 25 && (
            <div className="flex gap-1 mt-2 justify-center flex-wrap">
              {cards.map((c, i) => (
                <button key={c.id} onClick={() => { setIndex(i); setFlipped(false) }}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                  style={{
                    transform: i === index ? 'scale(1.5)' : 'scale(1)',
                    background: i === index ? '#22d3ee' : progress[c.id]?.mastered ? '#34d399' : progress[c.id]?.seen ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Card */}
        <div onClick={flip} className="relative cursor-pointer select-none mb-6"
          style={{ perspective: '1200px', minHeight: 300 }}>
          <div className="relative w-full transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: 300 }}>

            {/* Front */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
              <div className="h-full min-h-[300px] rounded-3xl p-8 flex flex-col"
                style={{ background: 'rgba(10,22,40,0.95)', border: '2px solid rgba(14,165,233,0.3)', boxShadow: '0 0 40px rgba(14,165,233,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(14,165,233,0.15)', color: '#22d3ee' }}>
                    {FLASHCARD_CHAPTERS.find(c => c.id === current.chapter)?.label || current.chapter}
                  </span>
                  {isMastered && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                      <Check size={12} /> Mastered
                    </span>
                  )}
                  {isSeen && !isMastered && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>Review</span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl font-semibold text-white text-center leading-relaxed">{current.front}</p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center animate-bounce">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  </div>
                  <span>Tap to reveal</span>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="h-full min-h-[300px] rounded-3xl p-8 flex flex-col"
                style={{ background: 'linear-gradient(135deg, rgba(6,14,26,0.98), rgba(2,40,70,0.95))', border: '2px solid rgba(14,165,233,0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    {current.front}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Definition</span>
                </div>
                <div className="flex-1 flex items-start justify-center overflow-y-auto">
                  <p className="text-sm leading-relaxed text-left w-full" style={{ color: '#cbd5e1' }}>{current.back}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={(e) => { e.stopPropagation(); markNeeds() }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    <X size={16} /> Needs Review
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); markMastered() }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7' }}>
                    <Check size={16} /> Got It
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => go(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-slate-300 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronLeft size={18} /> Prev
          </button>

          <div className="flex gap-2">
            <button onClick={shuffled ? unShuffle : doShuffle}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
              style={shuffled
                ? { background: '#0284c7', color: 'white', boxShadow: '0 0 12px rgba(14,165,233,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              <Shuffle size={16} /> {shuffled ? 'Shuffled' : 'Shuffle'}
            </button>
            <button onClick={resetProgress}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-semibold text-sm text-slate-500 transition-all active:scale-95 hover:text-red-400"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Reset progress">
              <RotateCcw size={16} />
            </button>
          </div>

          <button onClick={() => go(1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-slate-300 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
