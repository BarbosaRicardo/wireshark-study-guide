import React from 'react'
import ChapterLayout from '../components/ChapterLayout'
import Callout from '../components/Callout'
import FunFact from '../components/FunFact'
import QuizLevels from '../components/QuizLevels'
import { ANALOGIES } from '../data/chapters'

export default function OpcUa() {
  const analogy = ANALOGIES.opcua

  return (
    <ChapterLayout chapterId="opcua" title="Analyzing OPC UA Sessions" prev="dnp3" next="security">
      <p className="text-lg text-slate-300 leading-relaxed">
        OPC UA is the most architecturally sophisticated protocol you'll encounter in OT networks. It has security modes, certificates, session establishment, subscriptions, and a complex service model. Wireshark has a full OPC UA dissector. The challenge is knowing which fields matter and what they're telling you about your system's actual security posture.
      </p>

      <div className="rounded-2xl p-5 my-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38bdf8' }}>Quote</div>
        <p className="text-slate-300 italic text-sm leading-relaxed">"{analogy.text}"</p>
        <p className="text-xs text-slate-600 mt-2">— {analogy.author}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">OPC UA Session Establishment</h2>

      <p>
        An OPC UA session begins with a TCP connection to port 4840, followed by a structured handshake. Each stage is visible in Wireshark as distinct service calls:
      </p>

      <div className="rounded-2xl overflow-hidden my-5" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {[
            { step: '1', service: 'HEL/ACK', desc: 'Hello/Acknowledge — TCP-level OPC UA hello, negotiates max message size and chunk count' },
            { step: '2', service: 'OpenSecureChannel', desc: 'Establishes a Secure Channel with the negotiated SecurityMode (None, Sign, or SignAndEncrypt)' },
            { step: '3', service: 'CreateSession', desc: 'Creates the OPC UA session, exchanges endpoint URLs and application descriptions' },
            { step: '4', service: 'ActivateSession', desc: 'Authenticates the session with user credentials or certificates — this is where identity is established' },
            { step: '5', service: 'Browse/Read/Subscribe', desc: 'Normal session operations: browsing the address space, reading node values, creating subscriptions' },
            { step: '6', service: 'CloseSession + CloseSecureChannel', desc: 'Orderly session teardown' },
          ].map(({ step, service, desc }) => (
            <div key={step} className="px-5 py-3 flex gap-4 items-start">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8' }}>{step}</div>
              <div className="flex-1">
                <code className="text-sm font-bold" style={{ color: '#7dd3fc' }}>{service}</code>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Callout type="key" title="Security Modes">
        OPC UA defines three security modes: <strong>None</strong> (no security), <strong>Sign</strong> (messages are signed but not encrypted), and <strong>SignAndEncrypt</strong> (messages are signed and encrypted). The mode is negotiated in OpenSecureChannel. Wireshark shows this in the <code>opcua.security_mode</code> field. In a production system, critical data should use SignAndEncrypt. If it says None, your OPC UA traffic is plaintext on the wire.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Reading OPC UA in Wireshark</h2>

      <p>
        OPC UA uses a custom binary encoding called OPC UA Binary (also called UA-Binary). Wireshark's <code>opcua</code> dissector handles this. Traffic appears on port 4840 by default. Each packet's Packet Details pane will show the service type, request/response ID, and the full decoded message.
      </p>

      <pre>{`# Display filters for OPC UA analysis

# All OPC UA traffic
opcua

# OpenSecureChannel only (security negotiation)
opcua.serviceid == 0x01ac or opcua.serviceid == 0x01af

# CreateSession / ActivateSession
opcua.serviceid == 0x01c9 or opcua.serviceid == 0x01cd

# Only SecurityMode = None (0x00)
# (visible in OpenSecureChannel request)
opcua.sec_channel_id != 0 and frame contains "0100000001000000"

# Read requests (NodeId reads)
opcua.serviceid == 0x019d

# Write requests (NodeId writes)
opcua.serviceid == 0x01a5

# CreateSubscription (data monitoring setup)
opcua.serviceid == 0x01d9`}</pre>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Subscriptions and Publish Cycles</h2>

      <p>
        OPC UA subscriptions allow a client to register interest in data changes, rather than polling. The server sends <strong>Publish Response</strong> messages when monitored items change. In Wireshark, a healthy subscription looks like:
      </p>

      <pre>{`Client → Server: CreateSubscription (publishingInterval: 1000ms)
Server → Client: CreateSubscriptionResponse (subscriptionId: 42)
Client → Server: CreateMonitoredItems (nodeId: Temperature_01, ...)
Server → Client: CreateMonitoredItemsResponse (monitoredItemId: 1)

[1 second later]
Client → Server: Publish (subscriptionId: 42)
Server → Client: PublishResponse (notificationMessage: Temperature_01 = 98.6)`}</pre>

      <p>
        Irregular Publish intervals, unexpected NotificationMessages, or subscriptions to unusual NodeIDs are anomalies worth examining. A legitimate OPC UA client subscribes to known tags at known intervals.
      </p>

      <Callout type="warning" title="OPC UA SecurityMode: None in Production">
        OPC UA was designed with security built in — unlike Modbus. Despite this, surveys of production OT networks consistently find OPC UA servers running in SecurityMode: None. The reasons are pragmatic: certificate management is complex, legacy clients don't support certificates, and configuration takes time. Wireshark's OPC UA dissector makes the actual security mode immediately visible. If your security documentation says SignAndEncrypt but Wireshark says None, the documentation is wrong.
      </Callout>

      <h2 className="text-2xl font-bold text-white mt-8 mb-3">Decrypting OPC UA TLS Sessions</h2>

      <p>
        When OPC UA runs over TLS (port 4843), Wireshark cannot read the content without the session keys. If you control the client application, you can configure it to log session keys to a file using the <code>SSLKEYLOGFILE</code> environment variable (for applications that use OpenSSL):
      </p>

      <pre>{`# On Linux/Mac — before launching the OPC UA client
export SSLKEYLOGFILE=/tmp/opcua_keys.log

# In Wireshark: Edit → Preferences → Protocols → TLS
# Set "(Pre)-Master-Secret log filename" to /tmp/opcua_keys.log
# Now Wireshark decrypts the TLS sessions in real time`}</pre>

      <Callout type="field" title="Field Gotcha: OPC UA Binary vs OPC UA XML">
        OPC UA supports two wire encodings: Binary (compact, fast) and XML/WebServices (verbose, interoperable). Production systems almost always use Binary — it's what Wireshark's dissector handles. If you see OPC UA traffic that Wireshark isn't decoding correctly, check whether the system is using the XML-based Web Services transport (HTTP/SOAP on port 80 or 443). This is rare in OT but exists in systems with IT integration layers.
      </Callout>

      <FunFact index={6} />

      <QuizLevels chapterId="opcua" />
    </ChapterLayout>
  )
}
