// ==============================================================================
// SENTINEL-IOT: OFFLINE MOCK TELEMETRY GENERATOR (SECTION 7.2)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

import { TelemetryEvent, DomainType, AttackClass } from '../types/sentinel';

const DOMAINS: DomainType[] = [
  'Network_Traffic',
  'IoT_Modbus',
  'IoT_Fridge',
  'IoT_GPS_Tracker',
  'IoT_Garage_Door',
  'IoT_Motion_Light',
  'IoT_Thermostat',
  'IoT_Weather',
  'Linux_process',
  'Linux_disk',
  'Linux_memory',
  'Windows_10',
  'Windows_7'
];

const DOMAIN_FEATURES: Record<DomainType, string[]> = {
  Network_Traffic: ['duration', 'src_bytes', 'dst_bytes', 'missed_bytes', 'src_pkts', 'dst_pkts', 'proto_tcp', 'service_http', 'conn_state_SF'],
  IoT_Modbus: ['FC1_Read_Coils', 'FC2_Read_Discrete', 'FC3_Read_Hold_Reg', 'FC4_Read_Input_Reg', 'Modbus_Sub_Function', 'Cycle_Time_ms'],
  IoT_Fridge: ['temp_condition', 'door_state', 'fridge_temperature', 'defrost_cycle', 'compressor_power_W'],
  IoT_GPS_Tracker: ['latitude', 'longitude', 'altitude_m', 'speed_kmh', 'satellite_count', 'hdop_precision'],
  IoT_Garage_Door: ['door_state', 'open_duration_sec', 'vibration_sensor_g', 'optical_beam_clear', 'lock_relay_active'],
  IoT_Motion_Light: ['pir_motion_detected', 'ambient_lux', 'relay_switch_state', 'power_draw_mA', 'battery_pct'],
  IoT_Thermostat: ['current_temperature', 'target_temperature', 'hvac_fan_mode', 'humidity_pct', 'compressor_duty_cycle'],
  IoT_Weather: ['temperature_c', 'relative_humidity', 'barometric_pressure_hpa', 'wind_speed_ms', 'rain_accum_mm'],
  Linux_process: ['PID', 'CPU_Usage_pct', 'Memory_Usage_pct', 'VSZ_kB', 'RSS_kB', 'Syscall_Rate_sec'],
  Linux_disk: ['Read_IOPS', 'Write_IOPS', 'Read_kB_sec', 'Write_kB_sec', 'Queue_Depth', 'Disk_Util_pct'],
  Linux_memory: ['Mem_Free_kB', 'Mem_Buffers_kB', 'Mem_Cached_kB', 'Swap_Used_kB', 'Page_Faults_sec'],
  Windows_10: ['Process_IO_Write_Bytes_sec', 'Process_Virtual_Bytes_Peak', 'Thread_Count', 'Handle_Count', 'CPU_Privileged_pct'],
  Windows_7: ['Process_IO_Read_Bytes_sec', 'Process_Working_Set_Peak', 'Page_Fault_Count', 'Context_Switches_sec']
};

export class MockTelemetryService {
  private timer: NodeJS.Timeout | null = null;
  private listeners: ((event: TelemetryEvent) => void)[] = [];
  private eventCount = 142;
  private activeDomain: DomainType = 'Network_Traffic';

  public setActiveDomain(domain: DomainType) {
    this.activeDomain = domain;
  }

  public start(intervalMs = 1500) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const event = this.generateSyntheticEvent();
      this.listeners.forEach((cb) => cb(event));
    }, intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public onTelemetry(callback: (event: TelemetryEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public triggerAdversarialEvent(epsilon: number, attackType: 'FGSM' | 'PGD_20'): TelemetryEvent {
    this.eventCount++;
    const domain = this.activeDomain;
    const isHardened = true; // Hardened Conformer retains 96.8% accuracy
    const isAnomaly = true;
    const tau = 0.942;
    const featureNames = DOMAIN_FEATURES[domain] || ['feature_1', 'feature_2', 'feature_3'];
    
    const event: TelemetryEvent = {
      id: `evt_adv_${Date.now()}_${this.eventCount}`,
      timestamp: new Date().toISOString(),
      domain: domain,
      deviceId: `${domain.toLowerCase()}_node_01`,
      sourceIp: `192.168.100.${10 + (this.eventCount % 30)}`,
      targetIp: '192.168.100.1',
      processId: domain.includes('Windows') ? 4120 : domain.includes('Linux') ? 8821 : undefined,
      features: Array.from({ length: 10 }, () => Number((Math.random() + epsilon).toFixed(4))),
      anomalyProbability: tau,
      isAnomaly: isAnomaly,
      severity: 'CRITICAL',
      predictedClass: attackType === 'PGD_20' ? 'ransomware' : 'ddos',
      confidence: Number((0.92 - epsilon * 0.2).toFixed(3)),
      saliencyTopFeatures: [
        { featureName: featureNames[0] || 'Primary_Vector', importanceScore: 48.4 },
        { featureName: featureNames[1] || 'Secondary_Vector', importanceScore: 31.2 },
        { featureName: featureNames[2] || 'Perturbation_Shift', importanceScore: 20.4 }
      ],
      xaiLatencyMs: 0.78,
      remediationStatus: 'ACTIVE_BLOCKED',
      remediationAction: domain.includes('Windows')
        ? `taskkill /F /PID 4120`
        : `iptables -A INPUT -s 192.168.100.${10 + (this.eventCount % 30)} -j DROP`,
      mttrLatencyMs: Number((19.2 + Math.random() * 3.5).toFixed(2)),
      compliance: {
        nistControlId: 'SI-3',
        nistControlName: 'Malicious Code Protection & Adversarial Defense',
        isoControlId: 'A.12.6.1',
        auditBlockHash: this.generateMerkleHash()
      }
    };

    this.listeners.forEach((cb) => cb(event));
    return event;
  }

  public generateSyntheticEvent(): TelemetryEvent {
    this.eventCount++;
    const domain = this.activeDomain || DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const isAnomaly = Math.random() > 0.65;
    const tau = isAnomaly
      ? Number((0.86 + Math.random() * 0.12).toFixed(4))
      : Number((0.02 + Math.random() * 0.10).toFixed(4));

    const attacks: AttackClass[] = domain.includes('Modbus')
      ? ['injection', 'dos']
      : domain.includes('Windows')
      ? ['ransomware', 'backdoor', 'password']
      : domain.includes('Linux')
      ? ['backdoor', 'xss', 'injection']
      : ['ddos', 'scanning', 'mitm', 'dos'];

    const attack: AttackClass = isAnomaly
      ? attacks[Math.floor(Math.random() * attacks.length)]
      : 'normal';

    const featureNames = DOMAIN_FEATURES[domain] || ['feature_1', 'feature_2', 'feature_3', 'feature_4'];

    const sourceIp = `192.168.100.${10 + (this.eventCount % 30)}`;
    const processId = domain.includes('Windows') ? 4120 : domain.includes('Linux') ? 8821 : undefined;

    let remediationAction = 'Baseline Verified';
    let remediationStatus: TelemetryEvent['remediationStatus'] = 'NONE';

    if (isAnomaly) {
      if (domain.includes('Windows')) {
        remediationAction = `taskkill /F /PID ${processId}`;
        remediationStatus = 'ACTIVE_BLOCKED';
      } else if (domain.includes('Linux')) {
        remediationAction = `kill -9 ${processId}`;
        remediationStatus = 'ACTIVE_BLOCKED';
      } else {
        remediationAction = `iptables -A INPUT -s ${sourceIp} -j DROP`;
        remediationStatus = 'ACTIVE_BLOCKED';
      }
    }

    const nistMap: Record<AttackClass, { id: string; name: string; iso: string }> = {
      ddos: { id: 'SC-5', name: 'Denial of Service Protection', iso: 'A.12.1.3' },
      dos: { id: 'SC-5', name: 'Denial of Service Protection', iso: 'A.12.1.3' },
      ransomware: { id: 'SI-3', name: 'Malicious Code Protection', iso: 'A.12.6.1' },
      injection: { id: 'SI-10', name: 'Information Input Validation', iso: 'A.14.2.8' },
      password: { id: 'IA-5', name: 'Authenticator Management', iso: 'A.9.4.2' },
      scanning: { id: 'SI-4', name: 'Information System Monitoring', iso: 'A.12.4.1' },
      backdoor: { id: 'SI-4', name: 'Malicious Code & Intrusion Detection', iso: 'A.12.6.1' },
      xss: { id: 'SI-10', name: 'Input Validation & Output Sanitization', iso: 'A.14.2.8' },
      mitm: { id: 'SC-8', name: 'Transmission Confidentiality and Integrity', iso: 'A.13.1.1' },
      normal: { id: 'AU-9', name: 'Protection of Audit Information', iso: 'A.12.4.3' }
    };

    const compInfo = nistMap[attack] || nistMap.normal;

    return {
      id: `evt_${Date.now()}_${this.eventCount}`,
      timestamp: new Date().toISOString(),
      domain: domain,
      deviceId: `${domain.toLowerCase()}_node_01`,
      sourceIp: sourceIp,
      targetIp: '192.168.100.1',
      processId: processId,
      features: Array.from({ length: 10 }, () => Number(Math.random().toFixed(4))),
      anomalyProbability: tau,
      isAnomaly: isAnomaly,
      severity: isAnomaly ? (tau > 0.90 ? 'CRITICAL' : 'WARNING') : 'NORMAL',
      predictedClass: attack,
      confidence: Number((0.85 + Math.random() * 0.12).toFixed(3)),
      saliencyTopFeatures: [
        { featureName: featureNames[0] || 'Feature_Alpha', importanceScore: 44.2 },
        { featureName: featureNames[1] || 'Feature_Beta', importanceScore: 28.6 },
        { featureName: featureNames[2] || 'Feature_Gamma', importanceScore: 16.4 }
      ],
      xaiLatencyMs: 0.78,
      remediationStatus: remediationStatus,
      remediationAction: remediationAction,
      mttrLatencyMs: Number((18.5 + Math.random() * 5.0).toFixed(2)),
      compliance: {
        nistControlId: compInfo.id,
        nistControlName: compInfo.name,
        isoControlId: compInfo.iso,
        auditBlockHash: this.generateMerkleHash()
      }
    };
  }

  private generateMerkleHash(): string {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}

export const mockTelemetry = new MockTelemetryService();
