namespace PCSuccessionAgent.UI;

partial class SettingsForm : Form
{
    private TextBox txtApiUrl;
    private TextBox txtAgentId;
    private CheckBox chkAutoStart;
    private CheckBox chkMonitorUsage;
    private Button btnSave;
    private Button btnCancel;

    public SettingsForm()
    {
        InitializeComponent();
        LoadSettings();
    }

    private void InitializeComponent()
    {
        this.Text = "PC Succession Agent - Settings";
        this.Size = new Size(600, 450);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.MinimizeBox = false;

        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 6,
            Padding = new Padding(20)
        };

        // API URL
        mainPanel.Controls.Add(new Label 
        { 
            Text = "API Server URL:", 
            Font = new Font("Segoe UI", 10, FontStyle.Bold), 
            AutoSize = true,
            Anchor = AnchorStyles.Left
        }, 0, 0);
        txtApiUrl = new TextBox { Width = 350, Anchor = AnchorStyles.Left | AnchorStyles.Right };
        mainPanel.Controls.Add(txtApiUrl, 1, 0);

        // Agent ID
        mainPanel.Controls.Add(new Label 
        { 
            Text = "Agent ID:", 
            Font = new Font("Segoe UI", 10, FontStyle.Bold), 
            AutoSize = true,
            Anchor = AnchorStyles.Left
        }, 0, 1);
        txtAgentId = new TextBox { Width = 350, ReadOnly = true, Anchor = AnchorStyles.Left | AnchorStyles.Right };
        mainPanel.Controls.Add(txtAgentId, 1, 1);

        // Auto Start
        mainPanel.Controls.Add(new Label(), 0, 2); // Spacer
        chkAutoStart = new CheckBox 
        { 
            Text = "Start automatically with Windows", 
            AutoSize = true 
        };
        mainPanel.Controls.Add(chkAutoStart, 1, 2);

        // Monitor Usage
        chkMonitorUsage = new CheckBox 
        { 
            Text = "Monitor application usage patterns", 
            AutoSize = true,
            Checked = true
        };
        mainPanel.Controls.Add(chkMonitorUsage, 1, 3);

        // Buttons
        var buttonPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            FlowDirection = FlowDirection.RightToLeft,
            Height = 50,
            Padding = new Padding(10)
        };

        btnCancel = new Button { Text = "Cancel", Size = new Size(80, 30) };
        btnCancel.Click += (s, e) => this.Close();
        buttonPanel.Controls.Add(btnCancel);

        btnSave = new Button { Text = "Save", Size = new Size(80, 30) };
        btnSave.Click += SaveSettings;
        buttonPanel.Controls.Add(btnSave);

        this.Controls.Add(mainPanel);
        this.Controls.Add(buttonPanel);
    }

    private void LoadSettings()
    {
        try
        {
            // TODO: Load settings from configuration service
            txtApiUrl.Text = "https://api.pcsuccession.yourdomain.com";
            txtAgentId.Text = Guid.NewGuid().ToString();
            chkAutoStart.Checked = true;
            chkMonitorUsage.Checked = true;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error loading settings: {ex.Message}", "Error",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private void SaveSettings(object? sender, EventArgs e)
    {
        try
        {
            // TODO: Save settings via configuration service
            MessageBox.Show("Settings saved successfully!", "Success",
                MessageBoxButtons.OK, MessageBoxIcon.Information);
            this.Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error saving settings: {ex.Message}", "Error",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}

