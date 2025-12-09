import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import winston from 'winston';

const execAsync = promisify(exec);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'tools.log' }),
  ],
});

export async function execPowerShell(args: { script: string; as_admin?: boolean }) {
  try {
    const { script, as_admin } = args;
    
    logger.info('Executing PowerShell script', { script, as_admin });
    
    const command = as_admin
      ? `powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command ${script.replace(/"/g, '\\"')}' -Verb RunAs -Wait"`
      : `powershell -NoProfile -ExecutionPolicy Bypass -Command "${script}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    return {
      content: [
        {
          type: 'text',
          text: stdout || 'Command executed successfully',
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`PowerShell execution failed: ${error.message}`);
  }
}

export async function installApplication(args: {
  application_name: string;
  installer_url?: string;
  install_arguments?: string;
  verify_command?: string;
}) {
  try {
    const { application_name, installer_url, install_arguments, verify_command } = args;
    
    logger.info('Installing application', { application_name });
    
    // Check if application is already installed
    const checkScript = `Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*${application_name}*" }`;
    const { stdout: existing } = await execAsync(`powershell -Command "${checkScript}"`);
    
    if (existing.trim()) {
      return {
        content: [
          {
            type: 'text',
            text: `${application_name} is already installed`,
          },
        ],
      };
    }
    
    // Download and install
    if (installer_url) {
      const tempDir = process.env.TEMP || 'C:\\Temp';
      const installerPath = path.join(tempDir, `${application_name}_installer.exe`);
      
      // Download installer
      const downloadScript = `Invoke-WebRequest -Uri "${installer_url}" -OutFile "${installerPath}"`;
      await execAsync(`powershell -Command "${downloadScript}"`);
      
      // Install
      const installScript = `Start-Process -FilePath "${installerPath}" -ArgumentList "${install_arguments || '/S'}" -Wait`;
      await execAsync(`powershell -Command "${installScript}"`);
      
      // Cleanup
      await fs.unlink(installerPath).catch(() => {});
      
      // Verify if command provided
      if (verify_command) {
        await execAsync(`powershell -Command "${verify_command}"`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `${application_name} installed successfully`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Installation initiated for ${application_name}. Manual installation may be required.`,
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`Application installation failed: ${error.message}`);
  }
}

export async function configureSystem(args: {
  config_type: 'registry' | 'environment' | 'service' | 'firewall';
  settings: Record<string, any>;
}) {
  try {
    const { config_type, settings } = args;
    
    logger.info('Configuring system', { config_type, settings });
    
    switch (config_type) {
      case 'registry': {
        // Configure registry settings
        const { path: regPath, name, value, type } = settings;
        const script = `New-ItemProperty -Path "${regPath}" -Name "${name}" -Value "${value}" -PropertyType ${type || 'String'} -Force`;
        await execAsync(`powershell -Command "${script}"`);
        break;
      }
      
      case 'environment': {
        // Set environment variable
        const { name, value, scope } = settings;
        const script = `[Environment]::SetEnvironmentVariable("${name}", "${value}", "${scope || 'User'}")`;
        await execAsync(`powershell -Command "${script}"`);
        break;
      }
      
      case 'service': {
        // Configure Windows service
        const { name, action } = settings;
        const script = action === 'start'
          ? `Start-Service -Name "${name}"`
          : action === 'stop'
          ? `Stop-Service -Name "${name}"`
          : `Set-Service -Name "${name}" -StartupType ${action}`;
        await execAsync(`powershell -Command "${script}"`);
        break;
      }
      
      case 'firewall': {
        // Configure firewall rule
        const { name, port, protocol, action } = settings;
        const script = `New-NetFirewallRule -DisplayName "${name}" -Direction Inbound -Protocol ${protocol} -LocalPort ${port} -Action ${action}`;
        await execAsync(`powershell -Command "${script}"`);
        break;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `System configuration applied: ${config_type}`,
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`System configuration failed: ${error.message}`);
  }
}

export async function transferFiles(args: {
  source_path: string;
  target_path: string;
  include_hidden?: boolean;
}) {
  try {
    const { source_path, target_path, include_hidden } = args;
    
    logger.info('Transferring files', { source_path, target_path });
    
    // Ensure target directory exists
    const targetDir = path.dirname(target_path);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Copy files
    const copyScript = include_hidden
      ? `Copy-Item -Path "${source_path}" -Destination "${target_path}" -Recurse -Force`
      : `Copy-Item -Path "${source_path}" -Destination "${target_path}" -Recurse -Force -Exclude ".*"`;
    
    await execAsync(`powershell -Command "${copyScript}"`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Files transferred from ${source_path} to ${target_path}`,
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`File transfer failed: ${error.message}`);
  }
}

