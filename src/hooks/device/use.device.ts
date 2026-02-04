import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';
export interface DeviceInfo {
  browser: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
  device: {
    vendor?: string;
    model?: string;
    type?: string;
  };
  cpu: {
    architecture?: string;
  };
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();

    const isMobile = result.device.type === 'mobile';
    const isTablet = result.device.type === 'tablet';
    const isDesktop = !isMobile && !isTablet;

    setDeviceInfo({
      browser: result.browser,
      os: result.os,
      device: result.device,
      cpu: result.cpu,
      isMobile,
      isTablet,
      isDesktop
    });
  }, []);

  return deviceInfo;
};