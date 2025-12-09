using System.Diagnostics;
using Serilog;
using PCSuccessionAgent.Models;

namespace PCSuccessionAgent.Services;

public class MonitoringService : IMonitoringService
{
    private readonly Dictionary<string, ApplicationUsage> _usageTracking = new();
    private readonly Dictionary<string, FileAccess> _fileAccessTracking = new();

    public async Task<UsageMetrics> CollectMetrics()
    {
        return await Task.Run(() =>
        {
            var metrics = new UsageMetrics
            {
                Timestamp = DateTime.UtcNow,
                ApplicationUsage = TrackApplicationUsage().Result,
                FileAccess = TrackFileAccess().Result,
                SystemPerformance = CollectSystemPerformance()
            };

            return metrics;
        });
    }

    public async Task<List<ApplicationUsage>> TrackApplicationUsage()
    {
        return await Task.Run(() =>
        {
            var usage = new List<ApplicationUsage>();

            try
            {
                var processes = Process.GetProcesses();
                foreach (var process in processes)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(process.MainWindowTitle))
                            continue;

                        var key = process.ProcessName;
                        if (!_usageTracking.ContainsKey(key))
                        {
                            _usageTracking[key] = new ApplicationUsage
                            {
                                ApplicationName = process.ProcessName,
                                ExecutablePath = process.MainModule?.FileName ?? "",
                                FirstSeen = DateTime.UtcNow,
                                LastSeen = DateTime.UtcNow,
                                TotalMinutesUsed = 0,
                                LaunchCount = 1
                            };
                        }
                        else
                        {
                            _usageTracking[key].LastSeen = DateTime.UtcNow;
                            _usageTracking[key].TotalMinutesUsed += 0.25; // 15 second intervals
                        }
                    }
                    catch
                    {
                        // Skip processes we can't access
                    }
                }

                usage = _usageTracking.Values.ToList();
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error tracking application usage");
            }

            return usage;
        });
    }

    public async Task<List<FileAccess>> TrackFileAccess()
    {
        return await Task.Run(() =>
        {
            // TODO: Implement file access tracking
            // This could use FileSystemWatcher or Windows audit logs
            return _fileAccessTracking.Values.ToList();
        });
    }

    private SystemPerformance CollectSystemPerformance()
    {
        try
        {
            var performance = new SystemPerformance
            {
                CpuUsagePercent = GetCpuUsage(),
                MemoryUsagePercent = GetMemoryUsage(),
                DiskUsagePercent = GetDiskUsage()
            };

            return performance;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error collecting system performance");
            return new SystemPerformance();
        }
    }

    private double GetCpuUsage()
    {
        try
        {
            var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
            cpuCounter.NextValue();
            Thread.Sleep(100);
            return cpuCounter.NextValue();
        }
        catch
        {
            return 0;
        }
    }

    private double GetMemoryUsage()
    {
        try
        {
            var memCounter = new PerformanceCounter("Memory", "% Committed Bytes In Use");
            return memCounter.NextValue();
        }
        catch
        {
            return 0;
        }
    }

    private double GetDiskUsage()
    {
        try
        {
            var drive = DriveInfo.GetDrives().FirstOrDefault(d => d.Name == "C:\\");
            if (drive != null)
            {
                var used = drive.TotalSize - drive.AvailableFreeSpace;
                return (double)used / drive.TotalSize * 100;
            }
        }
        catch
        {
            // Ignore
        }
        return 0;
    }
}

