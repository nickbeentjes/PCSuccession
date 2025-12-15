using System.Management;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;
using Serilog;
using PCSuccessionAgent.Models;

namespace PCSuccessionAgent.Services;

public class DiscoveryService : IDiscoveryService
{
    public async Task<SystemInventory> PerformFullDiscovery()
    {
        Log.Information("Starting full system discovery");

        var inventory = new SystemInventory
        {
            AgentId = Environment.MachineName,
            Timestamp = DateTime.UtcNow,
            SystemInfo = await GatherSystemInfo(),
            InstalledApplications = await DiscoverInstalledApplications(),
            RegistrySettings = await DiscoverRegistrySettings(),
            Certificates = await DiscoverCertificates(),
            VpnConnections = await DiscoverVpnConnections(),
            UserDataLocations = await DiscoverUserDataLocations()
        };

        return inventory;
    }

    public async Task<SystemInfo> GatherSystemInfo()
    {
        return await Task.Run(() =>
        {
            var systemInfo = new SystemInfo
            {
                ComputerName = Environment.MachineName,
                UserName = Environment.UserName,
                DomainName = Environment.UserDomainName,
                OsVersion = Environment.OSVersion.ToString(),
                Is64Bit = Environment.Is64BitOperatingSystem,
                ProcessorCount = Environment.ProcessorCount,
                TotalMemoryMB = GetTotalMemoryMB(),
                MachineName = Environment.MachineName
            };

            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
                foreach (ManagementObject obj in searcher.Get())
                {
                    systemInfo.Manufacturer = obj["Manufacturer"]?.ToString() ?? "";
                    systemInfo.Model = obj["Model"]?.ToString() ?? "";
                }

                using var cpuSearcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
                foreach (ManagementObject obj in cpuSearcher.Get())
                {
                    systemInfo.ProcessorName = obj["Name"]?.ToString() ?? "";
                    break;
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error gathering system info from WMI");
            }

            return systemInfo;
        });
    }

    public async Task<List<Application>> DiscoverInstalledApplications()
    {
        return await Task.Run(() =>
        {
            var applications = new List<Application>();

            // Check both 32-bit and 64-bit registry locations
            var registryPaths = new[]
            {
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
            };

            foreach (var path in registryPaths)
            {
                try
                {
                    using var key = Registry.LocalMachine.OpenSubKey(path);
                    if (key == null) continue;

                    foreach (var subkeyName in key.GetSubKeyNames())
                    {
                        using var subkey = key.OpenSubKey(subkeyName);
                        if (subkey == null) continue;

                        var displayName = subkey.GetValue("DisplayName")?.ToString();
                        if (string.IsNullOrWhiteSpace(displayName)) continue;

                        var app = new Application
                        {
                            Name = displayName,
                            Version = subkey.GetValue("DisplayVersion")?.ToString() ?? "",
                            Publisher = subkey.GetValue("Publisher")?.ToString() ?? "",
                            InstallDate = subkey.GetValue("InstallDate")?.ToString() ?? "",
                            InstallLocation = subkey.GetValue("InstallLocation")?.ToString() ?? "",
                            UninstallString = subkey.GetValue("UninstallString")?.ToString() ?? "",
                            RegistryKey = $"{path}\\{subkeyName}"
                        };

                        applications.Add(app);
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Error reading registry path: {Path}", path);
                }
            }

            Log.Information("Discovered {Count} applications", applications.Count);
            return applications;
        });
    }

    public async Task<List<RegistryItem>> DiscoverRegistrySettings()
    {
        return await Task.Run(() =>
        {
            var items = new List<RegistryItem>();

            // TODO: Implement registry discovery for important settings
            // This should be configurable and safe

            return items;
        });
    }

    public async Task<List<Certificate>> DiscoverCertificates()
    {
        return await Task.Run(() =>
        {
            var certificates = new List<Certificate>();

            try
            {
                var stores = new[]
                {
                    new { Location = StoreLocation.CurrentUser, Name = StoreName.My },
                    new { Location = StoreLocation.CurrentUser, Name = StoreName.Root },
                    new { Location = StoreLocation.LocalMachine, Name = StoreName.My },
                    new { Location = StoreLocation.LocalMachine, Name = StoreName.Root }
                };

                foreach (var storeInfo in stores)
                {
                    try
                    {
                        using var store = new X509Store(storeInfo.Name, storeInfo.Location);
                        store.Open(OpenFlags.ReadOnly);

                        foreach (X509Certificate2 cert in store.Certificates)
                        {
                            certificates.Add(new Certificate
                            {
                                Subject = cert.Subject,
                                Issuer = cert.Issuer,
                                Thumbprint = cert.Thumbprint,
                                NotBefore = cert.NotBefore,
                                NotAfter = cert.NotAfter,
                                StoreLocation = storeInfo.Location.ToString(),
                                StoreName = storeInfo.Name.ToString(),
                                HasPrivateKey = cert.HasPrivateKey
                            });
                        }

                        store.Close();
                    }
                    catch (Exception ex)
                    {
                        Log.Error(ex, "Error reading certificate store: {Location}/{Name}",
                            storeInfo.Location, storeInfo.Name);
                    }
                }

                Log.Information("Discovered {Count} certificates", certificates.Count);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error discovering certificates");
            }

            return certificates;
        });
    }

    public async Task<List<VpnConnection>> DiscoverVpnConnections()
    {
        return await Task.Run(() =>
        {
            var connections = new List<VpnConnection>();

            try
            {
                var rasPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Connections";
                using var key = Registry.CurrentUser.OpenSubKey(rasPath);
                
                // TODO: Implement VPN connection discovery
                // This requires parsing VPN configurations from various sources

                Log.Information("Discovered {Count} VPN connections", connections.Count);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error discovering VPN connections");
            }

            return connections;
        });
    }

    public async Task<List<FileLocation>> DiscoverUserDataLocations()
    {
        return await Task.Run(() =>
        {
            var locations = new List<FileLocation>();

            try
            {
                // Common user data locations
                var specialFolders = new[]
                {
                    Environment.SpecialFolder.MyDocuments,
                    Environment.SpecialFolder.Desktop,
                    Environment.SpecialFolder.ApplicationData,
                    Environment.SpecialFolder.LocalApplicationData,
                    Environment.SpecialFolder.MyPictures,
                    Environment.SpecialFolder.MyVideos,
                    Environment.SpecialFolder.MyMusic
                };

                foreach (var folder in specialFolders)
                {
                    var path = Environment.GetFolderPath(folder);
                    if (Directory.Exists(path))
                    {
                        var dirInfo = new DirectoryInfo(path);
                        locations.Add(new FileLocation
                        {
                            Path = path,
                            Type = folder.ToString(),
                            SizeMB = GetDirectorySize(dirInfo) / (1024 * 1024),
                            FileCount = GetFileCount(dirInfo)
                        });
                    }
                }

                Log.Information("Discovered {Count} user data locations", locations.Count);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error discovering user data locations");
            }

            return locations;
        });
    }

    private long GetTotalMemoryMB()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                var memory = obj["TotalPhysicalMemory"];
                if (memory != null)
                {
                    return Convert.ToInt64(memory) / (1024 * 1024);
                }
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting total memory");
        }
        return 0;
    }

    private long GetDirectorySize(DirectoryInfo directory)
    {
        try
        {
            var files = directory.GetFiles("*", SearchOption.AllDirectories);
            return files.Sum(f => f.Length);
        }
        catch
        {
            return 0;
        }
    }

    private int GetFileCount(DirectoryInfo directory)
    {
        try
        {
            return directory.GetFiles("*", SearchOption.AllDirectories).Length;
        }
        catch
        {
            return 0;
        }
    }
}


