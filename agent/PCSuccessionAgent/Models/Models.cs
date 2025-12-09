namespace PCSuccessionAgent.Models;

public class SystemInventory
{
    public string AgentId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public SystemInfo SystemInfo { get; set; } = new();
    public List<Application> InstalledApplications { get; set; } = new();
    public List<RegistryItem> RegistrySettings { get; set; } = new();
    public List<Certificate> Certificates { get; set; } = new();
    public List<VpnConnection> VpnConnections { get; set; } = new();
    public List<FileLocation> UserDataLocations { get; set; } = new();
}

public class SystemInfo
{
    public string ComputerName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DomainName { get; set; } = string.Empty;
    public string OsVersion { get; set; } = string.Empty;
    public bool Is64Bit { get; set; }
    public int ProcessorCount { get; set; }
    public long TotalMemoryMB { get; set; }
    public string ProcessorName { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string MachineName { get; set; } = string.Empty;
}

public class Application
{
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public string InstallDate { get; set; } = string.Empty;
    public string InstallLocation { get; set; } = string.Empty;
    public string UninstallString { get; set; } = string.Empty;
    public string RegistryKey { get; set; } = string.Empty;
}

public class RegistryItem
{
    public string Path { get; set; } = string.Empty;
    public string ValueName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class Certificate
{
    public string Subject { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Thumbprint { get; set; } = string.Empty;
    public DateTime NotBefore { get; set; }
    public DateTime NotAfter { get; set; }
    public string StoreLocation { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
    public bool HasPrivateKey { get; set; }
}

public class VpnConnection
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ServerAddress { get; set; } = string.Empty;
    public Dictionary<string, string> Settings { get; set; } = new();
}

public class FileLocation
{
    public string Path { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public long SizeMB { get; set; }
    public int FileCount { get; set; }
}

public class UsageMetrics
{
    public DateTime Timestamp { get; set; }
    public List<ApplicationUsage> ApplicationUsage { get; set; } = new();
    public List<FileAccess> FileAccess { get; set; } = new();
    public SystemPerformance SystemPerformance { get; set; } = new();
}

public class ApplicationUsage
{
    public string ApplicationName { get; set; } = string.Empty;
    public string ExecutablePath { get; set; } = string.Empty;
    public DateTime FirstSeen { get; set; }
    public DateTime LastSeen { get; set; }
    public double TotalMinutesUsed { get; set; }
    public int LaunchCount { get; set; }
}

public class FileAccess
{
    public string FilePath { get; set; } = string.Empty;
    public DateTime LastAccessed { get; set; }
    public string AccessType { get; set; } = string.Empty;
}

public class SystemPerformance
{
    public double CpuUsagePercent { get; set; }
    public double MemoryUsagePercent { get; set; }
    public double DiskUsagePercent { get; set; }
}

