using RestSharp;
using Newtonsoft.Json;
using Serilog;
using PCSuccessionAgent.Models;

namespace PCSuccessionAgent.Services;

public class ApiClient : IApiClient
{
    private readonly IConfigurationService _config;
    private readonly RestClient _client;

    public ApiClient(IConfigurationService config)
    {
        _config = config;
        var options = new RestClientOptions(_config.ApiUrl)
        {
            ThrowOnAnyError = false,
            Timeout = TimeSpan.FromSeconds(30)
        };
        _client = new RestClient(options);
    }

    public async Task SendInventory(SystemInventory inventory)
    {
        try
        {
            var request = new RestRequest("/api/v1/agents/inventory", Method.Post);
            request.AddHeader("X-Agent-Id", _config.AgentId);
            request.AddJsonBody(inventory);

            var response = await _client.ExecuteAsync(request);
            
            if (!response.IsSuccessful)
            {
                Log.Error("Failed to send inventory: {StatusCode} - {Content}", 
                    response.StatusCode, response.Content);
            }
            else
            {
                Log.Information("Inventory sent successfully");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error sending inventory to API");
        }
    }

    public async Task SendMetrics(UsageMetrics metrics)
    {
        try
        {
            var request = new RestRequest("/api/v1/agents/metrics", Method.Post);
            request.AddHeader("X-Agent-Id", _config.AgentId);
            request.AddJsonBody(metrics);

            var response = await _client.ExecuteAsync(request);
            
            if (!response.IsSuccessful)
            {
                Log.Error("Failed to send metrics: {StatusCode} - {Content}",
                    response.StatusCode, response.Content);
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error sending metrics to API");
        }
    }

    public async Task<List<Command>> GetPendingCommands()
    {
        try
        {
            var request = new RestRequest($"/api/v1/agents/{_config.AgentId}/commands", Method.Get);
            request.AddHeader("X-Agent-Id", _config.AgentId);

            var response = await _client.ExecuteAsync(request);
            
            if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
            {
                var commands = JsonConvert.DeserializeObject<List<Command>>(response.Content);
                return commands ?? new List<Command>();
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting pending commands");
        }

        return new List<Command>();
    }

    public async Task SendCommandResult(string commandId, bool success, string? error = null)
    {
        try
        {
            var request = new RestRequest($"/api/v1/agents/commands/{commandId}/result", Method.Post);
            request.AddHeader("X-Agent-Id", _config.AgentId);
            request.AddJsonBody(new
            {
                Success = success,
                Error = error,
                Timestamp = DateTime.UtcNow
            });

            await _client.ExecuteAsync(request);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error sending command result");
        }
    }
}


