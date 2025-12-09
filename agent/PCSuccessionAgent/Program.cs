using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using PCSuccessionAgent.Services;
using PCSuccessionAgent.UI;

namespace PCSuccessionAgent;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        // Configure Serilog
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.File(
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                    "PCSuccession",
                    "logs",
                    "agent-.txt"
                ),
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30
            )
            .CreateLogger();

        try
        {
            Log.Information("PC Succession Agent starting...");

            // Check if running as service or interactive
            if (args.Contains("--service"))
            {
                CreateHostBuilder(args).Build().Run();
            }
            else
            {
                // Run with system tray UI
                ApplicationConfiguration.Initialize();
                Application.Run(new SystemTrayContext());
            }
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application terminated unexpectedly");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }

    static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .UseWindowsService()
            .UseSerilog()
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<AgentWorker>();
                services.AddSingleton<IDiscoveryService, DiscoveryService>();
                services.AddSingleton<IMonitoringService, MonitoringService>();
                services.AddSingleton<IApiClient, ApiClient>();
                services.AddSingleton<IConfigurationService, ConfigurationService>();
            });
}

