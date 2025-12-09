using Microsoft.Extensions.Hosting;
using Serilog;
using PCSuccessionAgent.Services;

namespace PCSuccessionAgent;

public class AgentWorker : BackgroundService
{
    private readonly IDiscoveryService _discoveryService;
    private readonly IMonitoringService _monitoringService;
    private readonly IApiClient _apiClient;
    private readonly IConfigurationService _configService;

    public AgentWorker(
        IDiscoveryService discoveryService,
        IMonitoringService monitoringService,
        IApiClient apiClient,
        IConfigurationService configService)
    {
        _discoveryService = discoveryService;
        _monitoringService = monitoringService;
        _apiClient = apiClient;
        _configService = configService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Log.Information("Agent Worker starting");

        // Initial full discovery
        await PerformFullDiscovery();

        // Start continuous monitoring
        var discoveryTimer = new PeriodicTimer(TimeSpan.FromHours(6));
        var monitoringTimer = new PeriodicTimer(TimeSpan.FromMinutes(15));
        var syncTimer = new PeriodicTimer(TimeSpan.FromMinutes(5));

        var discoveryTask = PeriodicDiscovery(discoveryTimer, stoppingToken);
        var monitoringTask = PeriodicMonitoring(monitoringTimer, stoppingToken);
        var syncTask = PeriodicSync(syncTimer, stoppingToken);

        await Task.WhenAll(discoveryTask, monitoringTask, syncTask);
    }

    private async Task PerformFullDiscovery()
    {
        try
        {
            Log.Information("Starting full system discovery");
            var inventory = await _discoveryService.PerformFullDiscovery();
            await _apiClient.SendInventory(inventory);
            Log.Information("Full discovery completed");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error during full discovery");
        }
    }

    private async Task PeriodicDiscovery(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await PerformFullDiscovery();
        }
    }

    private async Task PeriodicMonitoring(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                Log.Information("Collecting usage metrics");
                var metrics = await _monitoringService.CollectMetrics();
                await _apiClient.SendMetrics(metrics);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error during monitoring");
            }
        }
    }

    private async Task PeriodicSync(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                // Check for commands from server
                var commands = await _apiClient.GetPendingCommands();
                foreach (var command in commands)
                {
                    await ProcessCommand(command);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error during sync");
            }
        }
    }

    private async Task ProcessCommand(dynamic command)
    {
        // Process commands from the orchestration server
        Log.Information("Processing command: {CommandType}", command.Type);
        await Task.CompletedTask;
    }
}

