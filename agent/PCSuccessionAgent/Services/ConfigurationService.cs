using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Microsoft.Win32;
using Newtonsoft.Json;
using Serilog;

namespace PCSuccessionAgent.Services;

public class ConfigurationService : IConfigurationService
{
    private readonly string _configPath;
    private Dictionary<string, object> _settings;

    public ConfigurationService()
    {
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "PCSuccession"
        );
        Directory.CreateDirectory(appDataPath);
        _configPath = Path.Combine(appDataPath, "config.json");
        _settings = LoadSettings();
    }

    public string ApiUrl => GetSetting<string>("ApiUrl").Result ?? "https://api.pcsuccession.local";
    public string AgentId => GetSetting<string>("AgentId").Result ?? InitializeAgentId();
    public bool MonitoringEnabled => GetSetting<bool>("MonitoringEnabled").Result;

    public async Task<T> GetSetting<T>(string key)
    {
        await Task.CompletedTask;
        
        if (_settings.TryGetValue(key, out var value))
        {
            if (value is T typedValue)
                return typedValue;
            
            try
            {
                return (T)Convert.ChangeType(value, typeof(T));
            }
            catch
            {
                return default(T)!;
            }
        }
        
        return default(T)!;
    }

    public async Task SetSetting<T>(string key, T value)
    {
        _settings[key] = value!;
        await SaveSettings();
    }

    private Dictionary<string, object> LoadSettings()
    {
        try
        {
            if (File.Exists(_configPath))
            {
                var json = File.ReadAllText(_configPath);
                return JsonConvert.DeserializeObject<Dictionary<string, object>>(json) 
                    ?? new Dictionary<string, object>();
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error loading configuration");
        }

        return new Dictionary<string, object>
        {
            { "MonitoringEnabled", true },
            { "ApiUrl", "https://api.pcsuccession.local" }
        };
    }

    private async Task SaveSettings()
    {
        try
        {
            var json = JsonConvert.SerializeObject(_settings, Formatting.Indented);
            await File.WriteAllTextAsync(_configPath, json);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error saving configuration");
        }
    }

    private string InitializeAgentId()
    {
        var agentId = Guid.NewGuid().ToString();
        SetSetting("AgentId", agentId).Wait();
        return agentId;
    }
}

