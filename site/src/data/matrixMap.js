// Maps chapters to the company skills-matrix (survey) competencies they cover.
// NOTE: Wireshark is not a direct line item on either company matrix — it is
// the verification tool behind every "troubleshoot communications" and
// "conduct P2P" competency. Chapters that directly support a survey competency
// are mapped below; pure tool chapters intentionally carry no badge.

export const TRACKS = {
  scada: { label: 'SCADA OPS', color: '#fb923c' },
  rtac: { label: 'RTAC AUTO', color: '#818cf8' },
}

export const MATRIX_MAP = {
  industrial: [
    { track: 'rtac', week: 1, category: 'Modbus Client Channel Config',
      skills: ['Troubleshoot Modbus communications (supports: decode at the wire)'] },
    { track: 'rtac', week: 3, category: 'DNP3 Client Channel Config',
      skills: ['Troubleshoot DNP3 communications (supports: decode at the wire)'] },
    { track: 'scada', week: 2, category: 'DNP3 OPC Device Configuration',
      skills: ['Diagnose common DNP3 communication problems (supports)'] },
  ],
  tcpip: [
    { track: 'rtac', week: 2, category: 'OPC-UA Client Channel Config',
      skills: ['Troubleshoot OPC-UA communications (supports: TCP-level diagnosis)'] },
  ],
  lab: [
    { track: 'rtac', week: 1, category: 'Modbus Client Channel Config',
      skills: ['Troubleshoot register discrepancies and conduct P2P (supports: capture-verified P2P)'] },
  ],
}

export const isOnMatrix = (chapterId) => Boolean(MATRIX_MAP[chapterId]?.length)
