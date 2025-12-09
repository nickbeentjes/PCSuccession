using System.Diagnostics;
using Serilog;

namespace PCSuccessionAgent.UI;

public class SystemTrayContext : ApplicationContext
{
    private NotifyIcon trayIcon;
    private ContextMenuStrip contextMenu;
    private readonly System.Windows.Forms.Timer statusTimer;

    public SystemTrayContext()
    {
        // Create context menu
        contextMenu = new ContextMenuStrip();
        contextMenu.Items.Add("Open Dashboard", null, OpenDashboard);
        contextMenu.Items.Add("View Status", null, ViewStatus);
        contextMenu.Items.Add("-");
        contextMenu.Items.Add("Settings", null, OpenSettings);
        contextMenu.Items.Add("-");
        contextMenu.Items.Add("Exit", null, Exit);

        // Create tray icon
        trayIcon = new NotifyIcon()
        {
            Icon = SystemIcons.Application, // TODO: Replace with custom icon
            ContextMenuStrip = contextMenu,
            Visible = true,
            Text = "PC Succession Agent - Monitoring"
        };

        trayIcon.DoubleClick += OpenDashboard;

        // Start status update timer
        statusTimer = new System.Windows.Forms.Timer();
        statusTimer.Interval = 60000; // Update every minute
        statusTimer.Tick += UpdateStatus;
        statusTimer.Start();

        // Start monitoring services
        StartServices();
    }

    private async void StartServices()
    {
        try
        {
            // Initialize and start services in background
            await Task.Run(() =>
            {
                // Services will be initialized here
                Log.Information("Agent services starting in system tray mode");
            });
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error starting services");
            MessageBox.Show($"Error starting agent services: {ex.Message}", 
                "PC Succession Agent", 
                MessageBoxButtons.OK, 
                MessageBoxIcon.Error);
        }
    }

    private void UpdateStatus(object? sender, EventArgs e)
    {
        // Update tray icon tooltip with current status
        // This will be implemented with real status data
    }

    private void OpenDashboard(object? sender, EventArgs e)
    {
        try
        {
            // Open web dashboard in default browser
            var dashboardUrl = "https://pcsuccession.yourdomain.com"; // TODO: Load from config
            Process.Start(new ProcessStartInfo
            {
                FileName = dashboardUrl,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error opening dashboard");
            MessageBox.Show($"Error opening dashboard: {ex.Message}",
                "PC Succession Agent",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private void ViewStatus(object? sender, EventArgs e)
    {
        var statusForm = new StatusForm();
        statusForm.ShowDialog();
    }

    private void OpenSettings(object? sender, EventArgs e)
    {
        var settingsForm = new SettingsForm();
        settingsForm.ShowDialog();
    }

    private void Exit(object? sender, EventArgs e)
    {
        trayIcon.Visible = false;
        statusTimer.Stop();
        Application.Exit();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            trayIcon?.Dispose();
            contextMenu?.Dispose();
            statusTimer?.Dispose();
        }
        base.Dispose(disposing);
    }
}

