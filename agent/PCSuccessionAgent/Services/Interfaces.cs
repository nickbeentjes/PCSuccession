using PCSuccessionAgent.Models;

namespace PCSuccessionAgent.Services;

public interface IDiscoveryService
{
    Task<SystemInventory> PerformFullDiscovery();
    Task<List<Application>> DiscoverInstalledApplications();
    Task<List<RegistryItem>> DiscoverRegistrySettings();
    Task<List<Certificate>> DiscoverCertificates();
    Task<List<VpnConnection>> DiscoverVpnConnections();
    Task<List<FileLocation>> DiscoverUserDataLocations();
    Task<SystemInfo> GatherSystemInfo();
}

public interface IMonitoringService
{
    Task<UsageMetrics> CollectMetrics();
    Task<List<ApplicationUsage>> TrackApplicationUsage();
    Task<List<FileAccess>> TrackFileAccess();
}

public interface IApiClient
{
    Task SendInventory(SystemInventory inventory);
    Task SendMetrics(UsageMetrics metrics);
    Task<List<Command>> GetPendingCommands();
    Task SendCommandResult(string commandId, bool success, string? error = null);
}

public interface IConfigurationService
{
    string ApiUrl { get; }
    string AgentId { get; }
    bool MonitoringEnabled { get; }
    Task<T> GetSetting<T>(string key);
    Task SetSetting<T>(string key, T value);
}

public class Command
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
}


