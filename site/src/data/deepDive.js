const yt  = (q, title)         => ({ type: 'youtube', title, searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` })
const doc = (title, url)       => ({ type: 'doc',     title, url })
const book = (title, author, chapter, page) => ({ type: 'book', title, author, chapter, page })
const sanders  = (ch, pg) => book('Practical Packet Analysis', 'Chris Sanders, 3rd ed.', ch, pg)
const chappell = (ch, pg) => book('Wireshark Network Analysis', 'Laura Chappell, 2nd ed.', ch, pg)

export const DEEP_DIVE = {
  intro: {
    level1: [
      yt('wireshark beginner tutorial packet capture analysis', 'Wireshark for Beginners — First Capture Walk-Through'),
      yt('wireshark interface overview packet list detail bytes pane', 'Wireshark GUI — Packet List, Detail, and Bytes Pane Explained'),
      doc('Wireshark Official Documentation', 'https://www.wireshark.org/docs/wsug_html/'),
      doc('Wireshark Wiki — Getting Started', 'https://wiki.wireshark.org/'),
    ],
    level2: [
      yt('wireshark pcapng format vs pcap differences advantages', 'pcapng vs pcap — Format Differences and Why It Matters'),
      chappell('Chapter 1: Network Analysis Overview', '1'),
      doc('Wireshark Wiki — SampleCaptures', 'https://wiki.wireshark.org/SampleCaptures'),
    ],
  },
  capture: {
    level1: [
      yt('wireshark capture interfaces promiscuous mode span port', 'Wireshark Capture Interfaces and Promiscuous Mode'),
      yt('network tap vs span port difference wireshark monitoring', 'Network Tap vs SPAN Port — When to Use Each'),
      doc('Wireshark Wiki — Capture Setup', 'https://wiki.wireshark.org/CaptureSetup'),
    ],
    level2: [
      yt('dumpcap ring buffer continuous pcap capture headless', 'dumpcap Ring Buffer — Continuous Capture Without Wireshark GUI'),
      yt('wireshark remote capture ssh pipe tcpdump', 'Remote Capture Over SSH — tcpdump Pipe to Wireshark'),
      sanders('Chapter 4: Working with Captured Packets', '75'),
    ],
    level3: [
      yt('AF_PACKET PACKET_MMAP linux kernel packet capture high performance', 'High-Performance Linux Packet Capture — AF_PACKET and PACKET_MMAP'),
      chappell('Chapter 5: Capture Traffic from the Wire', '101'),
      doc('libpcap Documentation', 'https://www.tcpdump.org/manpages/pcap.3pcap.html'),
    ],
  },
  filters: {
    level1: [
      yt('wireshark display filter syntax examples tutorial beginners', 'Wireshark Display Filters — Syntax and Common Examples'),
      yt('wireshark capture filter BPF syntax tcpdump', 'BPF Capture Filters — Berkeley Packet Filter Syntax'),
      doc('Wireshark Display Filter Reference', 'https://www.wireshark.org/docs/dfref/'),
    ],
    level2: [
      yt('wireshark display filter operators comparisons ip.addr mbtcp', 'Advanced Display Filter Operators — Comparisons, Ranges, In Sets'),
      yt('wireshark filter macros saved filters display filter buttons', 'Wireshark Display Filter Macros and Saved Filters'),
      chappell('Chapter 6: Following Streams and Reassembling Data', '123'),
    ],
    level3: [
      yt('wireshark filter performance BPF optimization tshark', 'BPF vs Display Filters — Performance Implications'),
      sanders('Chapter 5: Advanced Wireshark Features', '99'),
    ],
  },
  dissectors: {
    level1: [
      yt('wireshark protocol dissector decode as custom port', 'Wireshark Dissectors — Decode As and Protocol Recognition'),
      yt('wireshark protocol hierarchy statistics overview', 'Protocol Hierarchy Statistics — What Is on My Network?'),
      doc('Wireshark Wiki — Dissectors', 'https://wiki.wireshark.org/Lua/Dissectors'),
    ],
    level2: [
      yt('wireshark lua dissector custom protocol tutorial', 'Writing a Wireshark Lua Dissector from Scratch'),
      yt('wireshark expert information malformed packets TCP errors', 'Wireshark Expert Information — Reading Protocol Health'),
      chappell('Chapter 7: Customizing Wireshark', '147'),
    ],
    level3: [
      yt('wireshark heuristic dissector post dissector lua API', 'Heuristic Dissectors and Post-Dissectors in Wireshark Lua'),
      doc('Wireshark Developer Guide — Adding a Dissector', 'https://www.wireshark.org/docs/wsdg_html/'),
    ],
  },
  modbus: {
    level1: [
      yt('modbus TCP protocol explained function codes registers', 'Modbus TCP Protocol — Function Codes and Register Map'),
      yt('wireshark modbus TCP capture analysis OT SCADA', 'Analyzing Modbus TCP in Wireshark — OT Network Analysis'),
      doc('Modbus Application Protocol Specification V1.1b3', 'https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf'),
    ],
    level2: [
      yt('modbus TCP security vulnerabilities no authentication ICS', 'Modbus TCP Security — Why No Authentication Is a Problem'),
      yt('wireshark modbus write detection display filter security', 'Detecting Unauthorized Modbus Writes in Wireshark'),
      doc('ICS-CERT — Understanding Control System Cyber Vulnerabilities', 'https://www.cisa.gov/resources-tools/resources/ics-cert-advisories'),
    ],
    level3: [
      yt('NIST SP 800-82 ICS security Modbus network monitoring', 'NIST SP 800-82 — ICS Security and Modbus Network Monitoring'),
      doc('Modbus Messaging on TCP/IP Implementation Guide', 'https://modbus.org/docs/Modbus_Messaging_Implementation_Guide_V1_0b.pdf'),
    ],
  },
  dnp3: {
    level1: [
      yt('DNP3 protocol explained data link transport application layer', 'DNP3 Protocol — Data Link, Transport, and Application Layers Explained'),
      yt('wireshark DNP3 capture analysis substation SCADA RTU', 'Analyzing DNP3 Traffic in Wireshark — Substation Analysis'),
      doc('DNP3 Users Group', 'https://www.dnp.org/'),
    ],
    level2: [
      yt('DNP3 function codes direct operate SBO unsolicited response', 'DNP3 Function Codes — Direct Operate, SBO, and Unsolicited Responses'),
      yt('DNP3 Secure Authentication SAv5 IEEE 1815 replay protection', 'DNP3 Secure Authentication v5 — Why and How'),
      doc('IEEE 1815-2012 DNP3 Standard Overview', 'https://standards.ieee.org/ieee/1815/'),
    ],
    level3: [
      yt('DNP3 ICS security NERC CIP substation cyber attack forensics', 'DNP3 Security Analysis — NERC CIP and Forensic Investigation'),
      chappell('Chapter 14: ICS Protocol Analysis', '325'),
    ],
  },
  opcua: {
    level1: [
      yt('OPC UA protocol explained session security modes client server', 'OPC UA Protocol — Session Setup and Security Modes Explained'),
      yt('wireshark OPC UA capture analysis opc.tcp port 4840', 'Analyzing OPC UA Traffic in Wireshark — Session Walkthrough'),
      doc('OPC Foundation — OPC UA Overview', 'https://opcfoundation.org/about/opc-technologies/opc-ua/'),
    ],
    level2: [
      yt('OPC UA security modes SignAndEncrypt certificate audit', 'OPC UA Security — Why Most Production Systems Use SecurityMode=None'),
      yt('OPC UA subscription monitored items publish response wireshark', 'OPC UA Subscriptions — Monitoring Industrial Data'),
      doc('IEC 62541 OPC UA Specification', 'https://opcfoundation.org/developer-tools/specifications-unified-architecture'),
    ],
    level3: [
      yt('OPC UA TLS decryption wireshark SSLKEYLOGFILE forensics', 'Decrypting OPC UA TLS Sessions in Wireshark'),
      doc('OPC UA PubSub Specification IEC 62541-14', 'https://opcfoundation.org/developer-tools/specifications-unified-architecture/part-14-pubsub/'),
    ],
  },
  security: {
    level1: [
      yt('ICS OT network security anomaly detection wireshark baseline', 'OT Network Security — Baselining and Anomaly Detection'),
      yt('ARP poisoning MITM attack detection wireshark network security', 'ARP Poisoning and MITM Detection in Wireshark'),
      doc('NIST SP 800-82 Rev 3 — ICS Security Guide', 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf'),
    ],
    level2: [
      yt('Wireshark ICS threat hunting modbus anomaly detection tshark', 'OT Threat Hunting with Wireshark and tshark'),
      yt('MITRE ATT&CK for ICS network detection PCAP forensics', 'MITRE ATT&CK for ICS — Network Detection Techniques'),
      doc('CISA ICS-CERT Network Detection Guidance', 'https://www.cisa.gov/resources-tools/resources/ics-cert'),
    ],
    level3: [
      yt('ICS incident response PCAP forensics chain of custody analysis', 'ICS Incident Response — PCAP Forensics and Chain of Custody'),
      doc('IEC 62443 Security Levels and Network Monitoring', 'https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards'),
    ],
  },
  advanced: {
    level1: [
      yt('tshark command line tutorial fields statistics capture', 'tshark Command-Line Tutorial — Capture, Filter, and Extract Fields'),
      yt('wireshark editcap mergecap capinfos command line tools', 'Wireshark CLI Tools — editcap, mergecap, and capinfos'),
      doc('tshark Man Page', 'https://www.wireshark.org/docs/man-pages/tshark.html'),
    ],
    level2: [
      yt('wireshark coloring rules custom columns OT security profile', 'Building a Wireshark OT Security Profile — Coloring Rules and Custom Columns'),
      yt('wireshark ring buffer continuous capture OT monitoring dumpcap', 'Continuous OT Monitoring with dumpcap Ring Buffer'),
      chappell('Chapter 11: Customizing Wireshark for Faster Analysis', '249'),
    ],
    level3: [
      yt('tshark python automation OT anomaly detection ICS SCADA', 'Automating OT Analysis — tshark + Python for Anomaly Detection'),
      yt('wireshark lua scripting post dissector custom fields automation', 'Wireshark Lua — Post-Dissectors and Custom Protocol Fields'),
      sanders('Chapter 8: Advanced Protocol Analysis', '185'),
    ],
  },
  lab: {
    level1: [
      yt('wireshark practice exercises sample PCAP analysis', 'Wireshark Practice — Working with Sample PCAP Files'),
      yt('wireshark OT protocol analysis scenario based ICS SCADA', 'OT Protocol Analysis Lab — Modbus, DNP3, and OPC UA Scenarios'),
      doc('Wireshark Sample Capture Files', 'https://wiki.wireshark.org/SampleCaptures'),
    ],
    level2: [
      yt('ICS network forensics incident response PCAP investigation lab', 'ICS Incident Investigation Lab — PCAP-Based Forensics'),
      yt('wireshark ICS security assessment finding unauthorized traffic', 'OT Security Assessment — Finding Anomalies in Production Captures'),
      doc('CISA ICS-CERT Tabletop Exercises', 'https://www.cisa.gov/ics-tabletop-exercise-packages'),
    ],
    level3: [
      yt('GICSP exam preparation ICS network security certification', 'GICSP Exam Prep — ICS Network Security Domains'),
      doc('SANS ICS515 — ICS Active Defense and Incident Response Course', 'https://www.sans.org/cyber-security-courses/ics-active-defense-incident-response/'),
      doc('WCNA Certification Study Resources', 'https://www.chappelluniversity.com/wcna.html'),
    ],
  },
}
